import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  ConfirmationModal,
  EmptyState,
  ScreenContainer,
  SearchBar,
  ServiceCard,
  StatCard,
  SupportTicketCard,
} from '@/components';
import {SUPPORT_TICKET_STATUSES} from '@/constants/appConstants';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {PlaceholderBlock} from '@/screens/shared/PlaceholderBlock';
import {useSupportStore} from '@/store/supportStore';
import type {
  ServicesStackParamList,
  SupportTicket,
  SupportTicketStatus,
} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ServicesStackParamList, 'SupportDashboard'>;
type TicketFilter = 'All' | SupportTicketStatus;

export function SupportDashboardScreen({navigation}: Props) {
  const tickets = useSupportStore(state => state.tickets);
  const deleteTicket = useSupportStore(state => state.deleteTicket);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TicketFilter>('All');
  const [deleteTarget, setDeleteTarget] = useState<SupportTicket | null>(null);

  const visibleTickets = useMemo(
    () =>
      tickets.filter(ticket => {
        const matchesFilter =
          activeFilter === 'All' || ticket.status === activeFilter;
        const searchValue = query.trim().toLowerCase();
        const matchesQuery =
          !searchValue ||
          ticket.issueType.toLowerCase().includes(searchValue) ||
          ticket.subject.toLowerCase().includes(searchValue) ||
          ticket.description.toLowerCase().includes(searchValue);

        return matchesFilter && matchesQuery;
      }),
    [activeFilter, query, tickets],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Support"
        subtitle="Create, track, update and resolve local support tickets"
        onBackPress={navigation.goBack}
      />
      <View style={styles.stats}>
        <StatCard label="Open" value={tickets.filter(item => item.status === 'Open').length} />
        <StatCard label="In Progress" value={tickets.filter(item => item.status === 'In Progress').length} />
        <StatCard label="Resolved" value={tickets.filter(item => item.status === 'Resolved').length} />
        <StatCard label="Total Tickets" value={tickets.length} />
      </View>
      <View style={styles.shortcuts}>
        <ServiceCard
          description="Raise a new issue with optional attachments"
          icon="add-circle-outline"
          onPress={() => navigation.navigate(ROUTES.services.supportTicketForm)}
          title="Create Ticket"
        />
        <ServiceCard
          description="Review all ticket states in one place"
          icon="list-outline"
          onPress={() => setActiveFilter('All')}
          title="My Tickets"
        />
      </View>
      <View style={styles.shortcuts}>
        <ServiceCard
          description="Common issues and static workflow guidance"
          icon="book-outline"
          onPress={() =>
            showToast(
              'FAQ: Login, property listing, loan, legal and profile help are available in local support ticket descriptions.',
            )
          }
          title="FAQ"
        />
        <ServiceCard
          description="Call back and contact support placeholder"
          icon="call-outline"
          onPress={() =>
            showToast(
              'Contact Support: raise a local ticket or use WhatsApp/Call actions in service modules.',
            )
          }
          title="Contact Support"
        />
      </View>
      <SearchBar
        onChangeText={setQuery}
        placeholder="Search issue type, subject or description"
        value={query}
      />
      <View style={styles.filters}>
        {(['All', ...SUPPORT_TICKET_STATUSES] as TicketFilter[]).map(item => (
          <Pressable
            key={item}
            onPress={() => setActiveFilter(item)}
            style={[
              styles.filterChip,
              activeFilter === item && styles.filterChipSelected,
            ]}>
            <Text
              style={[
                styles.filterText,
                activeFilter === item && styles.filterTextSelected,
              ]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <AppButton
        label="Create Support Ticket"
        onPress={() => navigation.navigate(ROUTES.services.supportTicketForm)}
      />
      {visibleTickets.length ? (
        visibleTickets.map(ticket => (
          <SupportTicketCard
            key={ticket.id}
            onDelete={() => setDeleteTarget(ticket)}
            onEdit={() =>
              navigation.navigate(ROUTES.services.supportTicketForm, {
                ticketId: ticket.id,
              })
            }
            onView={() =>
              navigation.navigate(ROUTES.services.supportTicketDetail, {
                ticketId: ticket.id,
              })
            }
            ticket={ticket}
          />
        ))
      ) : (
        <EmptyState
          description="Create a new ticket or change the active filter."
          title="No support tickets found"
        />
      )}
      <PlaceholderBlock
        description="Support uses static local state. Create, edit, close, resolve and delete tickets without API integration."
        title="Local Workflow"
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message={
          deleteTarget
            ? `Delete the local support ticket "${deleteTarget.subject}"?`
            : 'Delete this support ticket?'
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTicket(deleteTarget.id);
            showToast('Support ticket deleted locally.');
          }
          setDeleteTarget(null);
        }}
        title="Delete Support Ticket"
        visible={Boolean(deleteTarget)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTextSelected: {
    color: colors.white,
  },
});
