import {apiRequest} from '@/api';
import {getMasterData} from '@/services/masterApi';
import {searchLocations} from '@/services/locationApi';
import {addProperty, normalizeProperty, updateProperty} from '@/services/propertyApi';
import type {AddPropertyPayload} from '@/types';

jest.mock('@/api', () => ({
  apiRequest: jest.fn(),
  uploadFile: jest.fn(),
}));
jest.mock('@/services/masterApi', () => ({
  buildQueryString: jest.fn(() => ''),
  getMasterData: jest.fn(),
  normalizeMasterPagination: jest.fn(),
  normalizeMasterRecord: jest.fn(),
}));
jest.mock('@/services/locationApi', () => ({
  searchLocations: jest.fn(),
}));
jest.mock('@/services/remoteData', () => ({
  getAllPages: jest.fn(),
}));

const response = {
  id: 55,
  status: 'pending',
  title: 'Family House',
  price: 2500000,
  area: {builtUpAreaSqft: 750},
  basic: {
    propertyType: {id: 2, name: 'House'},
    category: {id: 3, name: 'All'},
    listingType: {id: 1, name: 'Sell'},
    bhk: {id: 4, name: '2 BHK'},
    facing: {id: 5, name: 'East'},
    bathrooms: 2,
    details: {constructionYear: 2024},
  },
  location: {
    addressLine1: 'Main Road',
    pincode: null,
    state: {id: 9, name: 'Uttar Pradesh'},
    city: {id: 10, name: 'Lucknow'},
  },
  amenities: [],
  media: {images: [], videos: [], documents: []},
};

describe('Add Property API mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getMasterData as jest.Mock).mockImplementation(async (type: string) => {
      const itemByType: Record<string, {id: number; name: string}> = {
        'property-types': {id: 2, name: 'House'},
        'property-categories': {id: 3, name: 'All'},
        'listing-types': {id: 1, name: 'Sell'},
        'bhk-options': {id: 4, name: '2 BHK'},
        'facing-directions': {id: 5, name: 'East'},
      };
      return {items: itemByType[type] ? [itemByType[type]] : []};
    });
    (searchLocations as jest.Mock).mockImplementation(async ({type}: {type: string}) => ({
      items: [{id: type === 'state' ? 9 : 10, name: type === 'state' ? 'Uttar Pradesh' : 'Lucknow'}],
    }));
    (apiRequest as jest.Mock).mockResolvedValue(response);
  });

  it('sends selected House values and omits an empty pincode', async () => {
    const payload = {
      title: 'Family House',
      description: '',
      price: 2500000,
      areaSqFt: 750,
      propertyType: 'House',
      category: 'All',
      listingType: 'Sell',
      bhk: '2 BHK',
      bathrooms: 2,
      constructionYear: 2024,
      facing: 'East',
      roadWidthFt: 30,
      furnishing: 'Unfurnished',
      readyState: 'Resale',
      status: 'Pending',
      amenities: [],
      verified: false,
      ownerType: 'Owner',
      owner: {id: '1', name: 'User', mobile: '', role: 'buyer', city: ''},
      location: {state: 'Uttar Pradesh', city: 'Lucknow', area: '', address: 'Main Road', pincode: '  '},
      media: [],
      documents: [],
      createdAt: '',
      updatedAt: '',
    } as AddPropertyPayload;

    await addProperty(payload);

    const post = (apiRequest as jest.Mock).mock.calls.find(([options]) => options.method === 'POST')?.[0];
    expect(post.body).toMatchObject({
      propertyTypeId: 2,
      bhkTypeId: 4,
      bathrooms: 2,
      constructionYear: 2024,
      builtUpAreaSqft: 750,
      facingId: 5,
      roadWidth: 30,
      readyState: 'Resale',
      furnishing: 'Unfurnished',
      isPriceNegotiable: false,
      amenityIds: [],
      status: 'pending',
    });
    expect(post.body.location).toEqual({stateId: 9, cityId: 10, address: 'Main Road', pincode: undefined});
  });

  it('restores backend bathrooms and construction year into the property model', () => {
    const property = normalizeProperty(response as never);
    expect(property.bathrooms).toBe(2);
    expect(property.constructionYear).toBe(2024);
  });

  it('sends nulls when an edit clears incompatible floor values', async () => {
    await updateProperty('55', {
      floorNumber: undefined,
      totalFloors: undefined,
    });

    const patch = (apiRequest as jest.Mock).mock.calls.find(
      ([options]) => options.method === 'PATCH',
    )?.[0];
    expect(patch.body).toMatchObject({
      floorNumber: null,
      totalFloors: null,
    });
  });
});
