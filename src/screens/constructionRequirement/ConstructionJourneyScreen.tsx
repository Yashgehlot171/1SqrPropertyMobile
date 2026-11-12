import React, { useCallback, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  mockBuilders,
  mockConstructionPlans,
  mockMaterialSpecifications,
} from '@/data/mockConstructionRequirement';
import {
  acceptConstructionQuote,
  createConstructionPlanRequest,
  getConstructionPlanRequest,
  listConstructionPlanRequests,
  requestConstructionMeeting,
} from '@/services/constructionJourneyApi';
import type { PlanRequest } from '@/services/constructionJourneyApi';
import { useAuthStore } from '@/store/authStore';
import { useConstructionJourneyStore } from '@/store/constructionJourneyStore';
import type { ConstructionRequirementStackParamList } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { calculateCornerPlotArea } from '@/utils/constructionCalculator';
import { FlowButton, FlowInfo, FlowPage, FlowSection, flow } from './FlowUI';

type Nav = NativeStackNavigationProp<ConstructionRequirementStackParamList>;
type Stage =
  | 'PlanOverview'
  | 'StructureSteel'
  | 'DetailedSpecifications'
  | 'ComparePlans'
  | 'FinishingMaterials'
  | 'KitchenAmenities'
  | 'CustomizePlan'
  | 'RequestQuote'
  | 'QuoteRequests'
  | 'QuoteDetails'
  | 'ProjectTracking';
const titles: Record<Stage, string> = {
  PlanOverview: 'Plan Overview',
  StructureSteel: 'Structure & Steel',
  DetailedSpecifications: 'Detailed Specifications',
  ComparePlans: 'Compare Plans',
  FinishingMaterials: 'Finishing Materials',
  KitchenAmenities: 'Kitchen / Amenities',
  CustomizePlan: 'Customize Plan',
  RequestQuote: 'Request Quote',
  QuoteRequests: 'Quote Requests',
  QuoteDetails: 'Quote Details',
  ProjectTracking: 'Project Tracking',
};
const rates = { Silver: 1450, Gold: 1850, Premium: 2350 };
const upgrades = [
  {
    id: 'tiles',
    title: 'Premium 4×2 Tiles',
    price: 90000,
    icon: 'grid-outline',
  },
  {
    id: 'kitchen',
    title: 'Modular Kitchen Package',
    price: 120000,
    icon: 'restaurant-outline',
  },
  {
    id: 'ceiling',
    title: 'False Ceiling Package',
    price: 85000,
    icon: 'square-outline',
  },
  {
    id: 'borewell',
    title: 'Borewell + Motor Pump',
    price: 75000,
    icon: 'water-outline',
  },
  {
    id: 'furniture',
    title: 'Furniture (Semi)',
    price: 150000,
    icon: 'bed-outline',
  },
];
const finishing = [
  { id: 'cat-tiles', title: 'Flooring & Tiles', icon: 'grid-outline' },
  { id: 'cat-paint', title: 'Paint', icon: 'color-palette-outline' },
  { id: 'cat-doors', title: 'Doors & Windows', icon: 'browsers-outline' },
  { id: 'cat-waterproofing', title: 'Waterproofing', icon: 'water-outline' },
];
const amenities = [
  {
    id: 'cat-modular-kitchen',
    title: 'Modular Kitchen',
    icon: 'restaurant-outline',
  },
  { id: 'cat-false-ceiling', title: 'False Ceiling', icon: 'square-outline' },
  { id: 'cat-furniture', title: 'Furniture', icon: 'bed-outline' },
  { id: 'cat-borewell', title: 'Borewell', icon: 'water-outline' },
  { id: 'cat-motor-pump', title: 'Motor Pump', icon: 'cog-outline' },
  { id: 'cat-water-tank', title: 'Water Tank', icon: 'beaker-outline' },
];

export function ConstructionJourneyScreen() {
  const navigation = useNavigation<Nav>();
  const stage = useRoute().name as Stage;
  const journey = useConstructionJourneyStore();
  const user = useAuthStore(state => state.user);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedSpecs, setExpandedSpecs] = useState<string[]>([
    'cat-structure',
    'cat-steel',
  ]);
  const toggleSpec = (id: string) =>
    setExpandedSpecs(items =>
      items.includes(id) ? items.filter(item => item !== id) : [...items, id],
    );
  const [tab, setTab] = useState<'Active' | 'Past'>('Active');
  const [detailTab, setDetailTab] = useState<
    'Details' | 'Specifications' | 'Timeline'
  >('Details');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [meetingVisible, setMeetingVisible] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingMessage, setMeetingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PlanRequest | null>(
    null,
  );
  const plan =
    mockConstructionPlans.find(item => item.id === journey.planId) ??
    mockConstructionPlans[0];
  const builder =
    mockBuilders.find(item => item.id === plan.builderId) ?? mockBuilders[0];
  const rate = rates[journey.tier];
  const calculatedArea = journey.hasPlot && journey.plotLengthFt > 0 && journey.plotWidthFt > 0
    ? calculateCornerPlotArea({lengthFt: journey.plotLengthFt, widthFt: journey.plotWidthFt, isCornerPlot: journey.isCornerPlot}).totalConstructionAreaSqFt
    : journey.areaSqFt;
  const base = rate * calculatedArea;
  const extras = upgrades.filter(item => journey.upgrades.includes(item.id));
  const upgradesTotal = extras.reduce((sum, item) => sum + item.price, 0);
  const estimate = base + upgradesTotal;
  const quote = selectedRequest?.quotes?.[0];
  const finalAmount = quote ? Number(quote.amount) : null;
  const isCurrentDraft = selectedRequest?.id === journey.draftRequestId;
  const submittedEstimate = isCurrentDraft
    ? estimate
    : Number(selectedRequest?.budgetMax ?? 0);
  const requestStatus = selectedRequest?.status ?? 'pending';

  useFocusEffect(
    useCallback(() => {
      if (
        stage !== 'QuoteRequests' &&
        stage !== 'QuoteDetails' &&
        stage !== 'ProjectTracking'
      ) {
        return;
      }
      let active = true;
      setLoading(true);
      setError(null);
      const promise =
        stage === 'QuoteRequests'
          ? listConstructionPlanRequests()
          : journey.requestId
          ? getConstructionPlanRequest(journey.requestId)
          : Promise.resolve(null);
      promise
        .then(result => {
          if (!active) {
            return;
          }
          if (Array.isArray(result)) {
            setRequests(result);
          } else {
            setSelectedRequest(result);
          }
        })
        .catch(cause => {
          if (active) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Could not load construction requests.',
            );
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
      return () => {
        active = false;
      };
    }, [stage, journey.requestId]),
  );

  const specification = (id: string) =>
    mockMaterialSpecifications.find(
      item =>
        item.packageId === `package-${journey.tier.toLowerCase()}` &&
        item.categoryId === id,
    );
  const submit = async () => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await createConstructionPlanRequest({
        builderName: builder.name,
        planName: `${journey.tier} Plan`,
        location: journey.location,
        plotAreaSqFt: journey.plotAreaSqFt,
        builtUpAreaSqFt: calculatedArea,
        floors: journey.floors,
        estimate,
        upgrades: extras.map(item => item.title),
        notes,
      });
      journey.requestQuote(result.id);
      navigation.navigate('QuoteRequests');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not send quote request.',
      );
    } finally {
      setSubmitting(false);
    }
  };
  const goToRequest = (request: PlanRequest) => {
    journey.selectRequest(request.id);
    setSelectedRequest(request);
    navigation.navigate('QuoteDetails');
  };
  const acceptQuote = async () => {
    if (!journey.requestId || !quote || accepting) {
      return;
    }
    setAccepting(true);
    setError(null);
    try {
      const updated = await acceptConstructionQuote(
        journey.requestId,
        quote.id,
      );
      setSelectedRequest(updated);
      navigation.navigate('ProjectTracking');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not accept the quote.',
      );
    } finally {
      setAccepting(false);
    }
  };
  const scheduleMeeting = async () => {
    if (!journey.requestId || meetingLoading) {
      return;
    }
    const preferredAt = new Date(`${meetingDate}T${meetingTime}:00`);
    const [year, month, day] = meetingDate.split('-').map(Number);
    const [hour, minute] = meetingTime.split(':').map(Number);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(meetingDate) ||
      !/^\d{2}:\d{2}$/.test(meetingTime) ||
      Number.isNaN(preferredAt.getTime()) ||
      preferredAt.getFullYear() !== year ||
      preferredAt.getMonth() + 1 !== month ||
      preferredAt.getDate() !== day ||
      preferredAt.getHours() !== hour ||
      preferredAt.getMinutes() !== minute ||
      preferredAt.getTime() <= Date.now()
    ) {
      setError('Enter a future date (YYYY-MM-DD) and time (HH:mm).');
      return;
    }
    setMeetingLoading(true);
    setError(null);
    try {
      const updated = await requestConstructionMeeting(
        journey.requestId,
        preferredAt.toISOString(),
      );
      setSelectedRequest(updated);
      setMeetingVisible(false);
      setMeetingMessage(
        'Meeting request sent. The team will confirm your preferred time.',
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not request meeting.',
      );
    } finally {
      setMeetingLoading(false);
    }
  };
  const materialRow = (item: { id: string; title: string; icon: string }) => {
    const spec = specification(item.id);
    const isOpen = expanded === item.id;
    return (
      <Pressable
        key={item.id}
        accessibilityRole="button"
        onPress={() => setExpanded(isOpen ? null : item.id)}
        style={styles.materialCard}
      >
        <View style={styles.materialIcon}>
          <Icon name={item.icon} size={27} color={flow.blue} />
        </View>
        <View style={styles.grow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.small}>
            {spec?.detail ?? 'Ask builder for details'}
          </Text>
          <Status status={spec?.status ?? 'Conditional'} />
        </View>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-forward'}
          color={flow.muted}
          size={18}
        />
        {isOpen ? (
          <View style={styles.materialExpanded}>
            <Text style={styles.small}>
              Included in {journey.tier} plan:{' '}
              {spec?.detail ?? 'To be confirmed'}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  };
  let primary:
    | {
        label: string;
        onPress: () => void;
        disabled?: boolean;
        loading?: boolean;
      }
    | undefined;
  let secondary: { label: string; onPress: () => void } | undefined;
  switch (stage) {
    case 'PlanOverview':
      primary = {
        label: 'View Specifications',
        onPress: () => navigation.navigate('DetailedSpecifications'),
      };
      secondary = {
        label: 'Customize Plan',
        onPress: () => navigation.navigate('CustomizePlan'),
      };
      break;
    case 'StructureSteel':
    case 'DetailedSpecifications':
      primary = {
        label: 'Customize Plan',
        onPress: () => navigation.navigate('CustomizePlan'),
      };
      break;
    case 'FinishingMaterials':
      primary = {
        label: 'Kitchen / Amenities',
        onPress: () => navigation.navigate('KitchenAmenities'),
      };
      break;
    case 'KitchenAmenities':
      primary = {
        label: 'Customize Plan',
        onPress: () => navigation.navigate('CustomizePlan'),
      };
      break;
    case 'CustomizePlan':
      primary = {
        label: 'Compare Plans',
        onPress: () => navigation.navigate('ComparePlans'),
      };
      break;
    case 'RequestQuote':
      primary = {
        label: 'Send Quote Request',
        onPress: () => {
          void submit();
        },
        loading: submitting,
      };
      break;
    case 'ProjectTracking':
      primary = {
        label: 'View Request Details',
        onPress: () => navigation.navigate('QuoteDetails'),
      };
      break;
  }
  return (
    <FlowPage
      title={titles[stage]}
      onBack={navigation.goBack}
      primary={primary}
      secondary={secondary}
    >
      {stage === 'PlanOverview' ? (
        <>
          <View style={styles.planTabs}>
            {(['Silver', 'Gold', 'Premium'] as const).map(item => (
              <Pressable
                key={item}
                onPress={() => journey.selectTier(item)}
                style={[styles.planTab, journey.tier === item && styles.planTabActive]}
              >
                <Text style={[styles.planTabText, journey.tier === item && styles.planTabTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <ImageBackground
            source={require('@/assets/images/homeimage2.jpg')}
            style={styles.planHero}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroShade}>
              <Text style={styles.heroBuilder}>{builder.name}</Text>
              <Text style={styles.heroTitle}>{journey.tier} Plan</Text>
              <Text style={styles.heroRate}>
                {formatCurrency(rate)} / sq.ft.
              </Text>
            </View>
          </ImageBackground>
          <View style={styles.estimateRow}>
            <View>
              <Text style={styles.small}>Estimated Base Cost</Text>
              <Text style={styles.bigPrice}>{formatCurrency(base)}</Text>
            </View>
            <Text style={styles.small}>
              For {calculatedArea.toLocaleString('en-IN')} sq.ft.
            </Text>
          </View>
          <View style={styles.twoColumns}>
            <View style={styles.smallInfo}>
              <Icon name="location-outline" size={20} color={flow.blue} />
              <View>
                <Text style={styles.cardTitle}>Service Areas</Text>
                <Text style={styles.small}>{builder.location}</Text>
              </View>
            </View>
            <View style={styles.smallInfo}>
              <Icon name="time-outline" size={20} color={flow.blue} />
              <View>
                <Text style={styles.cardTitle}>Expected Duration</Text>
                <Text style={styles.small}>6 - 8 Months</Text>
              </View>
            </View>
          </View>
          <FlowSection title="Plan Highlights">
            {[
              'Quality materials',
              'Branded fittings',
              'Customisation options',
              'End-to-end support',
            ].map(item => (
              <View style={styles.checkRow} key={item}>
                <Icon name="checkmark-circle" size={18} color={flow.green} />
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
          </FlowSection>
        </>
      ) : null}

      {stage === 'StructureSteel' ? (
        <>
          <SpecificationPanel
            id="cat-structure"
            title="Foundation & Structure"
            icon="business-outline"
            expanded={expandedSpecs.includes('cat-structure')}
            onToggle={() => toggleSpec('cat-structure')}
            rows={[
              ['Foundation Type', 'PCC + RCC'],
              ['Concrete Grade', 'M25'],
              ['RCC Structure', 'Seismic compliant'],
            ]}
          />
          <SpecificationPanel
            id="cat-steel"
            title="Steel"
            icon="construct-outline"
            expanded={expandedSpecs.includes('cat-steel')}
            onToggle={() => toggleSpec('cat-steel')}
            rows={[
              ['Steel Type', 'Branded TMT'],
              ['Grade', journey.tier === 'Premium' ? 'Fe550D' : 'Fe500D'],
              ['Brand', 'Tata / JSW / Equivalent'],
            ]}
          />
          <SpecificationPanel
            id="cat-cement"
            title="Cement"
            icon="cube-outline"
            expanded={expandedSpecs.includes('cat-cement')}
            onToggle={() => toggleSpec('cat-cement')}
            rows={[
              ['Cement Type', 'OPC 53 Grade'],
              ['Brand', 'Ultratech / ACC'],
              ['Usage', 'As per structural design'],
            ]}
          />
        </>
      ) : null}

      {stage === 'DetailedSpecifications' ? (
        <FlowSection title="Room-wise and material-wise specifications">
          {[
            {id: 'cat-structure', title: 'Foundation & Structure', icon: 'business-outline'},
            {id: 'cat-steel', title: 'Steel & Concrete', icon: 'construct-outline'},
            {id: 'cat-tiles', title: 'Flooring & Tiles', icon: 'grid-outline'},
            {id: 'cat-doors', title: 'Doors & Windows', icon: 'browsers-outline'},
            {id: 'cat-paint', title: 'Paint & Finishing', icon: 'color-palette-outline'},
            {id: 'cat-modular-kitchen', title: 'Kitchen', icon: 'restaurant-outline'},
            {id: 'cat-electrical', title: 'Electrical', icon: 'flash-outline'},
            {id: 'cat-plumbing', title: 'Plumbing & Sanitary', icon: 'water-outline'},
            {id: 'cat-water-tank', title: 'Water Tank & Pump', icon: 'beaker-outline'},
          ].map(materialRow)}
        </FlowSection>
      ) : null}

      {stage === 'FinishingMaterials' ? (
        <>{finishing.map(materialRow)}</>
      ) : null}
      {stage === 'KitchenAmenities' ? <>{amenities.map(materialRow)}</> : null}

      {stage === 'CustomizePlan' ? (
        <>
          <Text style={styles.sectionHeading}>Select upgrade options</Text>
          {upgrades.map(item => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: journey.upgrades.includes(item.id),
              }}
              key={item.id}
              onPress={() => journey.toggleUpgrade(item.id)}
              style={styles.upgrade}
            >
              <Icon
                name={
                  journey.upgrades.includes(item.id)
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={21}
                color={
                  journey.upgrades.includes(item.id) ? flow.blue : '#AFBCCB'
                }
              />
              <View style={styles.upgradeIcon}>
                <Icon name={item.icon} size={22} color={flow.blue} />
              </View>
              <View style={styles.grow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.upgradePrice}>
                  + {formatCurrency(item.price)}
                </Text>
              </View>
            </Pressable>
          ))}
          <View style={styles.summary}>
            <FlowInfo label="Base Cost" value={formatCurrency(base)} />
            <FlowInfo
              label="Selected Upgrades"
              value={formatCurrency(upgradesTotal)}
            />
            <FlowInfo
              label="Updated Estimate"
              value={formatCurrency(estimate)}
              strong
            />
          </View>
        </>
      ) : null}

      {stage === 'RequestQuote' ? (
        <>
          <Text style={styles.sectionHeading}>Review Your Selection</Text>
          <View style={styles.builderCard}>
            <Image
              source={require('@/assets/images/homeimage2.jpg')}
              style={styles.builderThumb}
            />
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>{builder.name}</Text>
              <Text style={styles.small}>{journey.tier} Plan</Text>
              <Text style={styles.small}>{formatCurrency(rate)} / sq.ft.</Text>
            </View>
          </View>
          <View style={styles.summary}>
            <FlowInfo label="Base Cost" value={formatCurrency(base)} />
            <FlowInfo
              label="Selected Upgrades"
              value={formatCurrency(upgradesTotal)}
            />
            <FlowInfo
              label="Estimated Cost"
              value={formatCurrency(estimate)}
              strong
            />
          </View>
          <FlowSection title="Your Information">
            <View style={styles.whiteCard}>
              <FlowInfo label="Name" value={user?.name ?? '—'} />
              <FlowInfo label="Phone" value={user?.mobile ?? '—'} />
              <FlowInfo label="Preferred Contact" value="Phone Call" />
            </View>
          </FlowSection>
          <FlowSection title="Additional Notes">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any specific requirement?"
              placeholderTextColor={flow.muted}
              multiline
              style={styles.notes}
            />
          </FlowSection>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.small}>
            The estimate is indicative. A final builder quotation may differ.
          </Text>
        </>
      ) : null}

      {stage === 'QuoteRequests' ? (
        <>
          <View style={styles.tabs}>
            {(['Active', 'Past'] as const).map(item => (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[styles.tab, tab === item && styles.activeTab]}
              >
                <Text
                  style={[styles.tabText, tab === item && styles.activeTabText]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          {loading ? (
            <Text style={styles.small}>Loading requests...</Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {requests
            .filter(item =>
              tab === 'Past'
                ? ['completed', 'rejected'].includes(item.status ?? '')
                : !['completed', 'rejected'].includes(item.status ?? ''),
            )
            .map(item => (
              <View key={item.id} style={styles.requestCard}>
                <Image
                  source={require('@/assets/images/homeimage2.jpg')}
                  style={styles.requestImage}
                />
                <View style={styles.grow}>
                  <Text style={styles.cardTitle}>
                    {item.title ?? 'Construction Request'}
                  </Text>
                  <Text style={styles.small}>
                    Requested on {date(item.createdAt)}
                  </Text>
                  <Text style={styles.small}>
                    Status:{' '}
                    <Text style={styles.statusText}>
                      {item.quotes?.length
                        ? 'Quote Received'
                        : item.status ?? 'Pending'}
                    </Text>
                  </Text>
                  <FlowButton
                    label="View Details"
                    outline
                    onPress={() => goToRequest(item)}
                  />
                </View>
              </View>
            ))}
          {!loading &&
          requests.filter(item =>
            tab === 'Past'
              ? ['completed', 'rejected'].includes(item.status ?? '')
              : !['completed', 'rejected'].includes(item.status ?? ''),
          ).length === 0 ? (
            <Text style={styles.empty}>
              No {tab.toLowerCase()} construction requests yet.
            </Text>
          ) : null}
        </>
      ) : null}

      {stage === 'QuoteDetails' ? (
        <>
          <View style={styles.whiteCard}>
            <View style={styles.detailHead}>
              <Text style={styles.cardTitle}>
                {selectedRequest?.title ?? 'Construction Quote'}
              </Text>
              <Status status={quote ? 'Quote Received' : requestStatus} />
            </View>
            <Text style={styles.small}>
              Requested {date(selectedRequest?.createdAt)} · #
              {selectedRequest?.requestNo ?? journey.requestId}
            </Text>
          </View>
          <View style={styles.tabs}>
            {(['Details', 'Specifications', 'Timeline'] as const).map(item => (
              <Pressable
                key={item}
                onPress={() => setDetailTab(item)}
                style={[styles.tab, detailTab === item && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    detailTab === item && styles.activeTabText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          {loading ? <Text style={styles.small}>Loading quote...</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {detailTab === 'Details' ? (
            <>
              <Text style={styles.sectionHeading}>
                {quote ? 'Final Quotation' : 'Awaiting Final Quotation'}
              </Text>
              <Text style={styles.bigPrice}>
                {finalAmount !== null
                  ? formatCurrency(finalAmount)
                  : submittedEstimate > 0
                  ? formatCurrency(submittedEstimate)
                  : 'Pending'}
              </Text>
              {!quote ? (
                <Text style={styles.small}>
                  Showing your estimate until a builder shares a final quote.
                </Text>
              ) : null}
              <View style={styles.whiteCard}>
                {isCurrentDraft ? (
                  <FlowInfo
                    label="Base Construction Cost"
                    value={formatCurrency(base)}
                  />
                ) : null}
                {isCurrentDraft ? (
                  <FlowInfo
                    label="Selected Upgrades"
                    value={formatCurrency(upgradesTotal)}
                  />
                ) : null}
                <FlowInfo
                  label="Submitted Estimate"
                  value={
                    submittedEstimate > 0
                      ? formatCurrency(submittedEstimate)
                      : 'Not available'
                  }
                />
                <FlowInfo
                  label="Builder Quote"
                  value={
                    finalAmount === null
                      ? 'Pending'
                      : formatCurrency(finalAmount)
                  }
                  strong
                />
              </View>
              {quote?.notes ? (
                <Text style={styles.small}>{quote.notes}</Text>
              ) : null}
            </>
          ) : null}
          {detailTab === 'Specifications' ? (
            <View style={styles.whiteCard}>
              {isCurrentDraft ? (
                [
                  'cat-structure',
                  'cat-steel',
                  'cat-cement',
                  'cat-tiles',
                  'cat-modular-kitchen',
                ].map(id => (
                  <FlowInfo
                    key={id}
                    label={id.replace('cat-', '').replace('-', ' ')}
                    value={specification(id)?.detail ?? 'To be confirmed'}
                  />
                ))
              ) : (
                <Text style={styles.small}>
                  Request-specific specifications are not available.
                </Text>
              )}
            </View>
          ) : null}
          {detailTab === 'Timeline' ? (
            <View style={styles.whiteCard}>
              {selectedRequest?.statusHistory?.length ? (
                selectedRequest.statusHistory.map(item => (
                  <View key={item.id} style={styles.history}>
                    <Icon name="ellipse" size={11} color={flow.blue} />
                    <View>
                      <Text style={styles.cardTitle}>{item.newStatus}</Text>
                      <Text style={styles.small}>
                        {date(item.createdAt)} {item.remarks ?? ''}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.small}>No timeline updates yet.</Text>
              )}
            </View>
          ) : null}
          <View style={styles.quoteActions}>
            <View style={styles.grow}>
              <FlowButton
                label={
                  ['converted', 'completed'].includes(requestStatus)
                    ? 'Quote Accepted'
                    : 'Accept Quote'
                }
                disabled={
                  !quote || ['converted', 'completed'].includes(requestStatus)
                }
                loading={accepting}
                onPress={() => {
                  void acceptQuote();
                }}
              />
            </View>
            <View style={styles.grow}>
              <FlowButton
                label="Schedule Meeting"
                outline
                disabled={
                  !quote || ['completed', 'rejected'].includes(requestStatus)
                }
                onPress={() => {
                  setError(null);
                  setMeetingVisible(true);
                }}
              />
            </View>
          </View>
          <Text style={styles.small}>
            {quote
              ? 'Choose a preferred meeting time. The team will confirm it.'
              : 'These actions become available after a builder shares a final quotation.'}
          </Text>
          {meetingMessage ? (
            <Text style={styles.success}>{meetingMessage}</Text>
          ) : null}
          {selectedRequest?.followUpAt ? (
            <Text style={styles.small}>
              Preferred meeting:{' '}
              {new Date(selectedRequest.followUpAt).toLocaleString('en-IN')}
            </Text>
          ) : null}
          <FlowButton
            label={
              ['converted', 'completed'].includes(requestStatus)
                ? 'View Project Tracking'
                : 'Preview Project Tracking'
            }
            outline
            onPress={() => navigation.navigate('ProjectTracking')}
          />
          <Modal
            transparent
            animationType="fade"
            visible={meetingVisible}
            onRequestClose={() => setMeetingVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalBackdrop}
            >
              <View style={styles.modalCard}>
                <Text style={styles.sectionHeading}>Schedule Meeting</Text>
                <Text style={styles.small}>
                  Choose your preferred date and time. The team will confirm
                  availability.
                </Text>
                <TextInput
                  value={meetingDate}
                  onChangeText={setMeetingDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={flow.muted}
                  style={styles.modalInput}
                />
                <TextInput
                  value={meetingTime}
                  onChangeText={setMeetingTime}
                  placeholder="HH:mm (24-hour)"
                  placeholderTextColor={flow.muted}
                  style={styles.modalInput}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <FlowButton
                  label="Request Meeting"
                  loading={meetingLoading}
                  onPress={() => {
                    void scheduleMeeting();
                  }}
                />
                <FlowButton
                  label="Cancel"
                  outline
                  onPress={() => setMeetingVisible(false)}
                />
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </>
      ) : null}

      {stage === 'ProjectTracking' ? (
        <>
          <Text style={styles.sectionHeading}>My Construction Project</Text>
          <View style={styles.whiteCard}>
            <Text style={styles.cardTitle}>
              {selectedRequest?.title ?? 'Construction Project'}
            </Text>
            <Text style={styles.small}>
              Request #{selectedRequest?.requestNo ?? journey.requestId}
            </Text>
            <Status status={requestStatus} />
          </View>
          {[
            'Agreement Signed',
            'Site Preparation',
            'Foundation',
            'Structure',
            'Finishing',
            'Handover',
          ].map(item => (
            <View key={item} style={styles.milestone}>
              <View style={styles.milestoneDot}>
                <Icon name="ellipse" size={12} color={flow.surface} />
              </View>
              <View>
                <Text style={styles.cardTitle}>{item}</Text>
                <Text style={styles.small}>Awaiting progress update</Text>
              </View>
            </View>
          ))}
          <Text style={styles.small}>
            Milestones update when the builder shares project progress.
          </Text>
          {selectedRequest?.statusHistory?.length ? (
            <FlowSection title="Recent Updates">
              {selectedRequest.statusHistory.map(item => (
                <View key={item.id} style={styles.history}>
                  <Icon name="ellipse" size={11} color={flow.blue} />
                  <View>
                    <Text style={styles.cardTitle}>{item.newStatus}</Text>
                    <Text style={styles.small}>
                      {date(item.createdAt)} {item.remarks ?? ''}
                    </Text>
                  </View>
                </View>
              ))}
            </FlowSection>
          ) : null}
        </>
      ) : null}
    </FlowPage>
  );
}

function SpecificationPanel({
  title,
  icon,
  rows,
  expanded,
  onToggle,
}: {
  id: string;
  title: string;
  icon: string;
  rows: [string, string][];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.specPanel}>
      <Pressable onPress={onToggle} style={styles.specHeader}>
        <Icon name={icon} size={20} color={flow.blue} />
        <Text style={[styles.cardTitle, styles.grow]}>{title}</Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={flow.ink}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.specRows}>
          {rows.map(([label, value]) => (
            <FlowInfo key={label} label={label} value={value} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
function Status({ status }: { status: string }) {
  const positive =
    status === 'Included' ||
    status === 'Quote Received' ||
    status === 'completed';
  const negative = status === 'Not Included' || status === 'rejected';
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: positive
            ? flow.greenSoft
            : negative
            ? '#FDEAEA'
            : flow.blueSoft,
        },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          { color: positive ? flow.green : negative ? flow.red : flow.blue },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}
function date(value?: string) {
  return value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  sectionHeading: { color: flow.ink, fontSize: 15, fontWeight: '700' },
  cardTitle: { color: flow.ink, fontSize: 13, fontWeight: '700' },
  body: { color: flow.ink, fontSize: 12 },
  small: { color: flow.muted, fontSize: 11, lineHeight: 16 },
  error: { color: flow.red, fontSize: 12 },
  empty: {
    color: flow.muted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 28,
  },
  planHero: { height: 190, justifyContent: 'flex-end' },
  planTabs: { flexDirection: 'row', gap: 7 },
  planTab: { flex: 1, height: 34, borderRadius: 5, borderWidth: 1, borderColor: flow.line, alignItems: 'center', justifyContent: 'center', backgroundColor: flow.surface },
  planTabActive: { backgroundColor: flow.blue, borderColor: flow.blue },
  planTabText: { color: flow.ink, fontSize: 11, fontWeight: '600' },
  planTabTextActive: { color: flow.surface },
  heroImage: { borderRadius: 7 },
  heroShade: {
    padding: 13,
    gap: 4,
    backgroundColor: 'rgba(4,20,39,0.62)',
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  heroBuilder: { fontSize: 12, color: flow.surface, fontWeight: '700' },
  heroTitle: { fontSize: 21, color: '#FFE37B', fontWeight: '800' },
  heroRate: { fontSize: 15, color: flow.surface, fontWeight: '700' },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bigPrice: { color: flow.ink, fontSize: 22, fontWeight: '800' },
  twoColumns: { gap: 10 },
  smallInfo: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  specPanel: {
    backgroundColor: flow.surface,
    borderWidth: 1,
    borderColor: flow.line,
    borderRadius: 7,
    overflow: 'hidden',
  },
  specHeader: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 12,
  },
  specRows: {
    paddingHorizontal: 13,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: flow.line,
  },
  materialCard: {
    backgroundColor: flow.surface,
    borderWidth: 1,
    borderColor: flow.line,
    borderRadius: 7,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 9,
  },
  materialIcon: {
    width: 55,
    height: 55,
    backgroundColor: flow.blueSoft,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialExpanded: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: flow.line,
    paddingTop: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 3,
  },
  pillText: { fontSize: 10, fontWeight: '700' },
  upgrade: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: flow.surface,
    borderRadius: 7,
    padding: 7,
    borderWidth: 1,
    borderColor: flow.line,
  },
  upgradeIcon: {
    width: 42,
    height: 42,
    backgroundColor: flow.blueSoft,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradePrice: { color: flow.red, fontSize: 11, marginTop: 3 },
  summary: {
    backgroundColor: flow.blueSoft,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  whiteCard: {
    backgroundColor: flow.surface,
    borderWidth: 1,
    borderColor: flow.line,
    borderRadius: 7,
    padding: 12,
    gap: 6,
  },
  builderCard: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    backgroundColor: flow.surface,
    padding: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: flow.line,
  },
  builderThumb: { width: 62, height: 57, borderRadius: 5 },
  notes: {
    height: 65,
    textAlignVertical: 'top',
    backgroundColor: flow.surface,
    borderWidth: 1,
    borderColor: flow.line,
    borderRadius: 7,
    color: flow.ink,
    fontSize: 12,
    padding: 10,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 5,
    backgroundColor: '#EDF1F6',
    padding: 2,
  },
  tab: { flex: 1, height: 32, alignItems: 'center', justifyContent: 'center' },
  activeTab: { backgroundColor: flow.blue, borderRadius: 4 },
  tabText: { fontSize: 11, color: flow.muted, fontWeight: '600' },
  activeTabText: { color: flow.surface },
  requestCard: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: flow.surface,
    borderRadius: 7,
    padding: 8,
    borderWidth: 1,
    borderColor: flow.line,
  },
  requestImage: { width: 70, height: 94, borderRadius: 5 },
  statusText: { color: flow.blue, fontWeight: '700' },
  detailHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  history: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  milestone: {
    backgroundColor: flow.surface,
    borderRadius: 7,
    minHeight: 64,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderColor: flow.line,
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BEC9D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteActions: { flexDirection: 'row', gap: 8 },
  success: { color: flow.green, fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,23,42,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: flow.surface,
    borderRadius: 10,
    padding: 18,
    gap: 12,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: flow.line,
    borderRadius: 6,
    paddingHorizontal: 12,
    color: flow.ink,
    fontSize: 13,
  },
});
