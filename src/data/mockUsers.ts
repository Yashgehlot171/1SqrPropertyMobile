import type {UserProfile, UserSummary} from '@/types';

export const buyerUsers: UserSummary[] = [
  {
    id: 'buyer-1',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@example.com',
    role: 'buyer',
    city: 'Lucknow',
  },
  {
    id: 'buyer-2',
    name: 'Priya Verma',
    mobile: '9876543211',
    email: 'priya.verma@example.com',
    role: 'buyer',
    city: 'Kanpur',
  },
  {
    id: 'buyer-3',
    name: 'Ankit Singh',
    mobile: '9876543212',
    email: 'ankit.singh@example.com',
    role: 'buyer',
    city: 'Noida',
  },
  {
    id: 'buyer-4',
    name: 'Neha Gupta',
    mobile: '9876543213',
    email: 'neha.gupta@example.com',
    role: 'buyer',
    city: 'Ghaziabad',
  },
  {
    id: 'buyer-5',
    name: 'Vivek Mishra',
    mobile: '9876543214',
    email: 'vivek.mishra@example.com',
    role: 'buyer',
    city: 'Varanasi',
  },
];

export const sellerUsers: UserSummary[] = [
  {
    id: 'seller-1',
    name: 'Sanjay Tiwari',
    mobile: '9811111111',
    email: 'sanjay.tiwari@example.com',
    role: 'seller',
    city: 'Lucknow',
  },
  {
    id: 'seller-2',
    name: 'Poonam Yadav',
    mobile: '9811111112',
    email: 'poonam.yadav@example.com',
    role: 'seller',
    city: 'Ayodhya',
  },
  {
    id: 'seller-3',
    name: 'Amit Saxena',
    mobile: '9811111113',
    email: 'amit.saxena@example.com',
    role: 'seller',
    city: 'Kanpur',
  },
  {
    id: 'seller-4',
    name: 'Ritika Jain',
    mobile: '9811111114',
    email: 'ritika.jain@example.com',
    role: 'seller',
    city: 'Noida',
  },
  {
    id: 'seller-5',
    name: 'Mohit Kapoor',
    mobile: '9811111115',
    email: 'mohit.kapoor@example.com',
    role: 'seller',
    city: 'Agra',
  },
];

export const brokerUsers: UserSummary[] = [
  {
    id: 'broker-1',
    name: 'Arjun Realty',
    mobile: '9822222221',
    email: 'arjun.realty@example.com',
    role: 'broker',
    city: 'Lucknow',
  },
  {
    id: 'broker-2',
    name: 'Metro Homes',
    mobile: '9822222222',
    email: 'metro.homes@example.com',
    role: 'broker',
    city: 'Noida',
  },
  {
    id: 'broker-3',
    name: 'Shree Property Hub',
    mobile: '9822222223',
    email: 'shree.property@example.com',
    role: 'broker',
    city: 'Kanpur',
  },
  {
    id: 'broker-4',
    name: 'Urban Axis Realty',
    mobile: '9822222224',
    email: 'urban.axis@example.com',
    role: 'broker',
    city: 'Ghaziabad',
  },
  {
    id: 'broker-5',
    name: 'KeySpace Partners',
    mobile: '9822222225',
    email: 'keyspace@example.com',
    role: 'broker',
    city: 'Varanasi',
  },
];

export const appUsers: UserProfile[] = buyerUsers.map(user => ({
  id: user.id,
  name: user.name,
  mobile: user.mobile,
  email: user.email ?? '',
  city: user.city,
  role: user.role,
}));

export const primaryProfile: UserProfile = {
  id: 'user-current',
  name: 'Aarav Khanna',
  mobile: '9998887776',
  email: 'aarav.khanna@example.com',
  city: 'Lucknow',
  role: 'buyer',
};
