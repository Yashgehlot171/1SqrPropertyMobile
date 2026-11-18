import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {FlowSection, flow} from './FlowUI';
import {QuoteAction, QuoteCard} from './customerQuotationUi';
import {editCustomerConstructionReview, getBuilderConstructionReview, getCustomerConstructionReview, submitCustomerConstructionReview, type ConstructionCustomerReview, type ConstructionReviewInput} from '@/services/constructionCustomerReviewApi';

type Category = 'workQualityRating' | 'communicationRating' | 'timelinessRating' | 'valueForMoneyRating';
const categoryNames: {key: Category; label: string}[] = [{key: 'workQualityRating', label: 'Work Quality'}, {key: 'communicationRating', label: 'Communication'}, {key: 'timelinessRating', label: 'Timeliness'}, {key: 'valueForMoneyRating', label: 'Value for Money'}];

export function ConstructionCustomerReviewPanel({projectId, actor, builderName}: {projectId: string; actor: 'customer' | 'builder'; builderName: string}) {
  const [review, setReview] = useState<ConstructionCustomerReview | null>(null); const [eligible, setEligible] = useState(false); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [editing, setEditing] = useState(false); const [rating, setRating] = useState(0); const [reviewText, setReviewText] = useState(''); const [categories, setCategories] = useState<Partial<Record<Category, number>>>({});
  const load = useCallback(async () => {setLoading(true); setError(''); try {if (actor === 'customer') {const response = await getCustomerConstructionReview(projectId); setEligible(response.eligible); setReview(response.review);} else {const response = await getBuilderConstructionReview(projectId); setReview(response.review);}} catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to load Customer review.');} finally {setLoading(false);}}, [actor, projectId]);
  useEffect(() => {load();}, [load]);
  const beginEdit = () => {setRating(review?.rating ?? 0); setReviewText(review?.reviewText ?? ''); setCategories({workQualityRating: review?.workQualityRating ?? undefined, communicationRating: review?.communicationRating ?? undefined, timelinessRating: review?.timelinessRating ?? undefined, valueForMoneyRating: review?.valueForMoneyRating ?? undefined}); setEditing(true);};
  const submit = async () => {if (!rating) {setError('Choose an overall rating from 1 to 5.'); return;} const input: ConstructionReviewInput = {rating, reviewText: reviewText.trim() || undefined, ...categories}; setBusy(true); setError(''); try {const response = review ? await editCustomerConstructionReview(projectId, input) : await submitCustomerConstructionReview(projectId, input); setEligible(response.eligible); setReview(response.review); setEditing(false);} catch (reason) {setError(reason instanceof Error ? reason.message : 'Unable to submit your review.');} finally {setBusy(false);}};
  if (loading) return <FlowSection title="Customer Reviews"><QuoteCard title="Loading reviews"><ActivityIndicator color={flow.blue}/></QuoteCard></FlowSection>;
  return <FlowSection title={actor === 'customer' ? 'Your Builder Review' : 'Customer Review'}>
    {review ? <QuoteCard title={actor === 'customer' ? 'Your Review' : 'Verified Customer Review'}>
      <Text style={styles.rating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} <Text style={styles.ratingValue}>{review.rating}.0 / 5</Text></Text>
      <Text style={styles.verified}>✓ Verified 1SQUARE Project</Text>
      {actor === 'builder' && review.customerDisplayName ? <Text style={styles.muted}>By {review.customerDisplayName}</Text> : null}
      <Text style={styles.muted}>{new Date(review.createdAt).toLocaleDateString('en-IN')}</Text>
      {categoryNames.map(category => review[category.key] != null ? <Text key={category.key} style={styles.muted}>{category.label}: {review[category.key]} / 5</Text> : null)}
      {review.reviewText ? <Text style={styles.reviewText}>{review.reviewText}</Text> : <Text style={styles.muted}>No written feedback.</Text>}
      {actor === 'customer' && !editing ? <QuoteAction label="Edit Your Review" onPress={beginEdit}/> : null}
    </QuoteCard> : actor === 'builder' ? <QuoteCard title="No review for this project"><Text style={styles.muted}>No verified Customer review has been submitted.</Text></QuoteCard> : eligible ? <QuoteCard title="Rate Your Builder"><Text style={styles.muted}>{builderName}</Text><Text style={styles.muted}>Share feedback about your completed 1SQUARE construction project.</Text>{!editing ? <QuoteAction label="Rate Your Builder" onPress={beginEdit}/> : null}</QuoteCard> : null}
    {actor === 'customer' && eligible && editing ? <QuoteCard title={review ? 'Edit Your Review' : 'Rate Your Builder'}>
      <Text style={styles.fieldLabel}>Overall Rating (required)</Text><RatingPicker value={rating} onChange={setRating} label="Overall rating"/>
      {categoryNames.map(category => <View key={category.key}><Text style={styles.fieldLabel}>{category.label} (optional)</Text><RatingPicker value={categories[category.key] ?? 0} label={category.label} onChange={value => setCategories(previous => ({...previous, [category.key]: value}))}/></View>)}
      <Text style={styles.fieldLabel}>Review (optional)</Text><TextInput accessibilityLabel="Review text" value={reviewText} onChangeText={setReviewText} maxLength={2000} multiline placeholder="Share your experience" style={styles.input}/><Text style={styles.muted}>{reviewText.length}/2000</Text>
      <QuoteAction label={busy ? 'Submitting…' : review ? 'Save Review' : 'Submit Review'} disabled={busy || rating < 1 || rating > 5} onPress={submit}/>{review ? <QuoteAction label="Cancel Edit" disabled={busy} onPress={() => setEditing(false)}/> : null}
    </QuoteCard> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <QuoteAction label="Refresh reviews" disabled={busy} onPress={load}/>
  </FlowSection>;
}

function RatingPicker({value, onChange, label}: {value: number; onChange: (value: number) => void; label: string}) {return <View accessibilityLabel={label} style={styles.stars}>{[1, 2, 3, 4, 5].map(score => <Pressable accessibilityRole="button" accessibilityLabel={`${label} ${score}`} key={score} onPress={() => onChange(score)} style={styles.starButton}><Text style={[styles.star, score <= value && styles.starSelected]}>{score <= value ? '★' : '☆'}</Text></Pressable>)}</View>;}

const styles = StyleSheet.create({rating: {fontSize: 22, color: '#D99500'}, ratingValue: {fontSize: 13, color: flow.ink, fontWeight: '800'}, verified: {fontSize: 11, fontWeight: '900', color: flow.green, paddingVertical: 4}, muted: {fontSize: 11, lineHeight: 16, color: flow.muted}, reviewText: {fontSize: 13, lineHeight: 19, color: flow.ink, paddingTop: 8}, fieldLabel: {fontSize: 12, fontWeight: '800', color: flow.ink, paddingTop: 9}, stars: {flexDirection: 'row', gap: 8, paddingVertical: 7}, starButton: {padding: 2}, star: {fontSize: 27, color: flow.line}, starSelected: {color: '#D99500'}, input: {minHeight: 82, textAlignVertical: 'top', borderWidth: 1, borderColor: flow.line, borderRadius: 9, padding: 11, marginTop: 6, color: flow.ink}, error: {color: flow.red, fontSize: 12}});
