import type {Lead} from '@/types';

import {buyerUsers} from './mockUsers';
import {mockProperties} from './mockProperties';

export const mockLeads: Lead[] = Array.from({length: 10}, (_, index) => {
  const property = mockProperties[index % mockProperties.length];
  const buyer = buyerUsers[index % buyerUsers.length];
  const statuses: Lead['status'][] = [
    'New',
    'Contacted',
    'Interested',
    'Site Visit',
    'Negotiation',
    'Closed',
    'Lost',
  ];
  const status = statuses[index % statuses.length];

  return {
    id: `lead-${index + 1}`,
    buyer,
    property: {
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
    },
    status,
    lastRemark: `${buyer.name} asked for updated pricing and availability.`,
    followUpDate: `2026-06-${String((index % 9) + 11).padStart(2, '0')}`,
    remarks: [
      {
        id: `lead-${index + 1}-remark-1`,
        text: 'Initial inquiry received from app.',
        addedBy: 'Sales Desk',
        date: '2026-05-20T10:00:00.000Z',
      },
    ],
    history: [
      {
        id: `lead-${index + 1}-history-1`,
        status,
        updatedBy: 'Sales Desk',
        updatedAt: '2026-05-20T10:00:00.000Z',
      },
    ],
    createdAt: '2026-05-20T10:00:00.000Z',
  };
});
