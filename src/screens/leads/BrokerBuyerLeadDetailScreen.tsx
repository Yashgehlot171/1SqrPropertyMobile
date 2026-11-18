import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {createBrokerLeadPurchaseIntent, getBrokerBuyerLead, getPurchasedBuyerContact, type BrokerBuyerLead, type PurchasedBuyerContact} from '@/services/propertyLeadDiscoveryApi';
import {callPurchasedLeadBuyer, openPurchasedLeadWhatsApp} from '@/utils/purchasedLeadContactActions';
import type {HomeStackParamList} from '@/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BrokerBuyerLeadDetail'>;
const nice = (value?: string | null) => value?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) ?? 'Not specified';
const money = (value?: string | null) => value ? `₹${Number(value).toLocaleString('en-IN')}` : 'Not specified';

export function BrokerBuyerLeadDetailScreen({route, navigation}: Props) {
  const [lead, setLead] = useState<BrokerBuyerLead>(); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [purchaseError, setPurchaseError] = useState(''); const [purchaseBusy, setPurchaseBusy] = useState(false); const [buyerContact, setBuyerContact] = useState<PurchasedBuyerContact>(); const [contactError, setContactError] = useState('');
  const loadSequence = useRef(0);
  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);setError('');setBuyerContact(undefined);setContactError('');
    try {
      const nextLead = await getBrokerBuyerLead(route.params.requirementId);
      if (sequence !== loadSequence.current) return;
      setLead(nextLead);
      if (nextLead.purchase?.isPurchased && nextLead.purchase.purchaseStatus === 'SUCCESS') {
        try {
          const contact = await getPurchasedBuyerContact(nextLead.requirementId);
          if (sequence === loadSequence.current) setBuyerContact(contact);
        } catch (reason) {
          if (sequence === loadSequence.current) setContactError(reason instanceof Error ? reason.message : 'Purchased contact is unavailable right now.');
        }
      }
    } catch(e) {if (sequence === loadSequence.current) {setLead(undefined);setError(e instanceof Error ? e.message : 'Unable to load Buyer requirement.');}}
    finally {if (sequence === loadSequence.current) setLoading(false);}
  }, [route.params.requirementId]);
  useFocusEffect(useCallback(() => {load();return () => {loadSequence.current += 1;};}, [load]));
  const beginPurchase = () => {
    if (!lead || !lead.purchase?.isAvailable || lead.purchase.buyerLeadPrice === null || purchaseBusy) return;
    const amount = lead.purchase.currency === 'INR' ? `₹${Number(lead.purchase.buyerLeadPrice).toLocaleString('en-IN')}` : `${lead.purchase.currency} ${lead.purchase.buyerLeadPrice}`;
    Alert.alert('Create purchase intent?', `${amount}. This creates a pending payment intent. A payment gateway is not connected yet, so this will not complete or unlock contact.`, [{text:'Cancel',style:'cancel'},{text:'Continue',onPress:() => {
      setPurchaseBusy(true);setPurchaseError('');
      const idempotencyKey = `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;
      createBrokerLeadPurchaseIntent(lead.requirementId,idempotencyKey).then(() => load()).catch(reason => setPurchaseError(reason instanceof Error ? reason.message : 'Unable to create purchase intent.')).finally(() => setPurchaseBusy(false));
    }}]);
  };
  if (loading) return <View style={styles.state}><ActivityIndicator color={colors.primary}/></View>;
  if (!lead) return <View style={styles.state}><Text style={styles.error}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Retry</Text></Pressable></View>;
  const preferences = Object.entries(lead.preferences ?? {});
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.header}><Pressable onPress={() => navigation.goBack()}><Icon name="arrow-back" size={24} color={colors.textPrimary}/></Pressable><Text style={styles.title}>Buyer Requirement</Text></View>
    <View style={styles.mask}><Icon name="person-circle-outline" size={34} color={colors.primary}/><View><Text style={styles.name}>Buyer</Text><Text style={styles.muted}>Identity protected</Text></View></View>
    <Section title="Property"><Line label="Property type" value={lead.propertyType?.name ?? 'Not specified'}/>{preferences.map(([key,value]) => <Line key={key} label={nice(key)} value={Array.isArray(value) ? value.join(', ') : String(value)}/>)}</Section>
    <Section title="Location"><Line label="City" value={lead.city?.name ?? 'Not specified'}/><Line label="Preferred localities" value={lead.localities.map(item => item.name).join(', ') || 'Not specified'}/><Line label="Nearby locality acceptable" value={lead.nearbyLocalityAccepted ? 'Yes' : 'No'}/></Section>
    <Section title="Budget & Area"><Line label="Budget" value={`${money(lead.budget.min)} – ${money(lead.budget.max)}`}/><Line label="Area" value={`${lead.area.min ?? 'Not specified'} – ${lead.area.max ?? 'Not specified'} ${lead.area.unit ?? ''}`.trim()}/></Section>
    <Section title="Purchase & Payment"><Line label="Purchase timeline" value={nice(lead.purchaseTimeline)}/>{lead.targetPurchaseDate ? <Line label="Target purchase date" value={lead.targetPurchaseDate.slice(0,10)}/>:null}<Line label="Payment preference" value={nice(lead.paymentPreference)}/>{lead.loanIntent ? <><Line label="Occupation" value={nice(lead.loanIntent.occupation)}/><Line label="Loan amount" value={money(lead.loanIntent.amount)}/><Line label="Loan status" value={nice(lead.loanIntent.status)}/></>:null}</Section>
    {lead.additionalRequirement ? <Section title="Additional Requirement"><Text style={styles.body}>{lead.additionalRequirement}</Text></Section>:null}
    <View style={styles.purchase}>
      {lead.purchase?.isPurchased ? <>
        <Text style={styles.purchased}>Lead Purchased</Text>
        {buyerContact ? <>
          <Line label="Buyer Name" value={buyerContact.buyerName}/>
          <Line label="Mobile Number" value={buyerContact.mobile}/>
          <View style={styles.contactActions}>
            {buyerContact.canCall ? <Pressable accessibilityRole="button" onPress={() => {callPurchasedLeadBuyer(buyerContact.mobile).catch(() => undefined);}} style={styles.action}><Text style={styles.actionText}>Call</Text></Pressable> : null}
            {buyerContact.canWhatsApp ? <Pressable accessibilityRole="button" onPress={() => {openPurchasedLeadWhatsApp(buyerContact.buyerName,buyerContact.mobile).catch(() => undefined);}} style={styles.whatsappAction}><Icon name="logo-whatsapp" size={18} color={colors.white}/><Text style={styles.actionText}>WhatsApp</Text></Pressable> : null}
          </View>
        </> : <>
          <Text style={styles.muted}>{contactError || 'Loading purchased contact…'}</Text>
          {contactError ? <Pressable onPress={() => {load().catch(() => undefined);}}><Text style={styles.retry}>Retry contact</Text></Pressable> : null}
        </>}
      </>
        : lead.purchase?.purchaseStatus === 'PENDING' ? <><Text style={styles.pending}>Payment Pending</Text><Text style={styles.muted}>The payment gateway is not connected yet. Contact remains locked.</Text></>
        : lead.purchase?.isAvailable && lead.purchase.buyerLeadPrice !== null ? <>
          <Text style={styles.value}>{lead.purchase.currency === 'INR' ? `Lead price · ₹${Number(lead.purchase.buyerLeadPrice).toLocaleString('en-IN')}` : `Lead price · ${lead.purchase.currency} ${lead.purchase.buyerLeadPrice}`}</Text>
          {lead.purchase.remainingSlots !== null ? <Text style={styles.muted}>{lead.purchase.remainingSlots} purchase slot{lead.purchase.remainingSlots === 1 ? '' : 's'} remaining</Text> : null}
          <Pressable disabled={purchaseBusy} onPress={beginPurchase} style={[styles.action,purchaseBusy&&styles.disabled]}><Text style={styles.actionText}>{purchaseBusy ? 'Creating intent…' : lead.purchase.purchaseStatus === 'FAILED' || lead.purchase.purchaseStatus === 'CANCELLED' ? 'Retry Purchase Intent' : 'Start Purchase Intent'}</Text></Pressable>
        </> : lead.purchase?.remainingSlots === 0 ? <Text style={styles.pending}>Sold Out</Text> : <Text style={styles.muted}>Lead purchase is currently unavailable.</Text>}
      {purchaseError ? <Text style={styles.error}>{purchaseError}</Text> : null}
      {!lead.purchase?.isPurchased ? <View style={styles.lock}><Icon name="lock-closed-outline" size={18} color={colors.textSecondary}/><Text style={styles.muted}>Buyer contact is available only after successful purchase</Text></View> : null}
    </View>
  </ScrollView>;
}
function Section({title,children}: React.PropsWithChildren<{title:string}>) {return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;}
function Line({label,value}: {label:string;value:string}) {return <View style={styles.line}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;}
const styles=StyleSheet.create({page:{padding:spacing.lg,gap:spacing.md,backgroundColor:colors.background},header:{flexDirection:'row',alignItems:'center',gap:spacing.md},title:{fontSize:typography.fontSize.lg,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},mask:{flexDirection:'row',alignItems:'center',gap:spacing.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:spacing.radiusLg,padding:spacing.md},name:{fontSize:typography.fontSize.md,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},muted:{fontSize:typography.fontSize.sm,color:colors.textSecondary},section:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:spacing.radiusLg,padding:spacing.md,gap:spacing.md},sectionTitle:{fontSize:typography.fontSize.md,fontWeight:typography.fontWeight.bold,color:colors.textPrimary},line:{gap:4},label:{fontSize:typography.fontSize.xs,color:colors.textSecondary},value:{fontSize:typography.fontSize.sm,color:colors.textPrimary},body:{fontSize:typography.fontSize.sm,color:colors.textPrimary,lineHeight:22},purchase:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:spacing.radiusLg,padding:spacing.md,gap:spacing.sm},contactActions:{flexDirection:'row',gap:spacing.sm},whatsappAction:{minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:spacing.xs,backgroundColor:'#25D366',borderRadius:spacing.radiusMd,paddingHorizontal:spacing.md},purchased:{fontSize:typography.fontSize.md,fontWeight:typography.fontWeight.bold,color:colors.success},pending:{fontSize:typography.fontSize.md,fontWeight:typography.fontWeight.bold,color:colors.warning},action:{minHeight:48,alignItems:'center',justifyContent:'center',backgroundColor:colors.primary,borderRadius:spacing.radiusMd,paddingHorizontal:spacing.md},disabled:{opacity:.6},actionText:{fontSize:typography.fontSize.sm,fontWeight:typography.fontWeight.bold,color:colors.white},lock:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:spacing.sm,padding:spacing.md},state:{flex:1,alignItems:'center',justifyContent:'center',gap:spacing.md},error:{color:colors.error,textAlign:'center'},retry:{color:colors.primary,fontWeight:typography.fontWeight.bold}});
