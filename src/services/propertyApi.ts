import {apiRequest, ApiError, uploadFile} from '@/api';
import type {UploadFileInput} from '@/api';
import {ApiRouteService} from '@/config/app-reference';
import {
  buildQueryString,
  getMasterData,
  type MasterType,
} from '@/services/masterApi';
import {searchLocations} from '@/services/locationApi';
import type {
  AddPropertyPayload,
  LocationInfo,
  Property,
  PropertyCategory,
  PropertyFilterState,
  PropertyLifecycleStatus,
  PropertyMedia,
  PropertyReadyState,
  PropertyType,
  UploadedDocument,
  UserRole,
  UserSummary,
} from '@/types';

// ---------------------------------------------------------------------------
// Backend response shapes (from property.service.ts's presentProperty()).
// Loosely typed on purpose: nested master records (propertyType, category,
// facing, etc.) only ever need `id`/`name` here, so a narrow shared shape
// is used instead of redefining every backend model.
// ---------------------------------------------------------------------------

interface BackendNamedRef {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface BackendFile {
  id?: number | string;
  originalName?: string | null;
  url?: string | null;
  mimeType?: string | null;
  fileType?: string | null;
}

// title/mediaType/sortOrder/isPrimary/documentType/isVerified verified against
// property.service.ts's presentProperty() media mapping (images/videos/documents
// array item shape) — needed so updateProperty's partial-media merge (below) can
// echo an untouched half's existing items back to the backend using their real
// fileId, not just display them.
interface BackendPropertyImage {
  id: number | string;
  title?: string | null;
  mediaType?: 'image' | '360_image' | 'floor_plan' | null;
  sortOrder?: number | null;
  isPrimary?: boolean | null;
  file: BackendFile | null;
}

interface BackendPropertyVideo {
  id: number | string;
  title?: string | null;
  mediaType?: 'video' | 'walkthrough' | null;
  sortOrder?: number | null;
  file: BackendFile | null;
  thumbnail: BackendFile | null;
}

interface BackendPropertyDocument {
  id: number | string;
  title?: string | null;
  documentType?: 'registry' | 'ownership_proof' | 'property_tax' | 'floor_plan' | 'other' | null;
  isVerified?: boolean | null;
  file: BackendFile | null;
}

interface BackendUserSummary {
  id: number | string;
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
  selectedRole?: string | null;
}

interface BackendPropertyLocation {
  addressLine1?: string | null;
  pincode?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  state?: BackendNamedRef | null;
  city?: BackendNamedRef | null;
  area?: BackendNamedRef | null;
}

interface BackendProperty {
  id: number | string;
  title?: string | null;
  description?: string | null;
  status: string;
  price?: number | null;
  area?: {
    carpetAreaSqft?: number | null;
    builtUpAreaSqft?: number | null;
    plotAreaSqft?: number | null;
  } | null;
  basic?: {
    propertyType?: BackendNamedRef | null;
    category?: BackendNamedRef | null;
    listingType?: BackendNamedRef | null;
    bhk?: BackendNamedRef | null;
    facing?: BackendNamedRef | null;
    floorNumber?: number | null;
    totalFloors?: number | null;
    details?: Record<string, unknown> | null;
  } | null;
  location?: BackendPropertyLocation | null;
  amenities?: BackendNamedRef[] | null;
  media?: {
    images?: BackendPropertyImage[] | null;
    videos?: BackendPropertyVideo[] | null;
    documents?: BackendPropertyDocument[] | null;
  } | null;
  ownerSummary?: BackendUserSummary | null;
  brokerSummary?: BackendUserSummary | null;
  verificationStatus?: string | null;
  isFeatured?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface BackendPropertyListResponse {
  items?: BackendProperty[];
  pagination?: {page: number; limit: number; total: number; totalPages: number};
  nextCursor?: string | null;
}

// ---------------------------------------------------------------------------
// Status mapping.
//
// The DB enum (prisma/schema.prisma PropertyStatus) has 11 values; presentProperty()
// lowercases them (e.g. PENDING_REVIEW -> "pending_review"). The mock's
// PropertyLifecycleStatus only has 5 (Active/Pending/Sold/Rejected/Draft), so this is
// a lossy many-to-one mapping. Reasoning per bucket:
//   draft            -> Draft     (not yet submitted)
//   pending_review    -> Pending   (awaiting first review)
//   under_review      -> Pending   (mid-review, still not decided)
//   active            -> Active    (live listing)
//   approved          -> Active    (approved implies live/visible)
//   rented            -> Active    (still an active listing in the mock model; there is
//                                   no distinct "rented" bucket)
//   rejected          -> Rejected
//   blocked           -> Rejected  (closest fit: admin has disallowed the listing, same
//                                   as a rejection from the user's point of view)
//   sold              -> Sold
//   inactive          -> Draft     (no longer publicly visible but not rejected/sold;
//                                   closest analogue is an unpublished draft)
//   archived          -> Draft     (same reasoning as inactive)
// Any unrecognized value defaults to 'Pending' rather than silently claiming 'Active'.
// ---------------------------------------------------------------------------
const STATUS_MAP: Record<string, PropertyLifecycleStatus> = {
  draft: 'Draft',
  pending_review: 'Pending',
  under_review: 'Pending',
  active: 'Active',
  approved: 'Active',
  rented: 'Active',
  rejected: 'Rejected',
  blocked: 'Rejected',
  sold: 'Sold',
  inactive: 'Draft',
  archived: 'Draft',
};

function mapStatus(status: string): PropertyLifecycleStatus {
  return STATUS_MAP[status] ?? 'Pending';
}

// Seed-verified value sets (prisma/seed.ts). "Shop" exists in the mock's PropertyType
// union but was not found in the backend's seeded property-types list — if the backend
// never returns that name, filtering/normalizing by "Shop" will not match anything.
const PROPERTY_TYPE_VALUES: PropertyType[] = [
  'Plot',
  'House',
  'Flat',
  'Agriculture Land',
  'Commercial Plot',
  'Commercial House',
  'Shop',
  'Office',
  'Warehouse',
];
const PROPERTY_CATEGORY_VALUES: PropertyCategory[] = [
  'All',
  'New Launches',
  'Owner',
  'Ready To Move',
  'Verified',
];
const READY_STATE_VALUES: PropertyReadyState[] = [
  'Ready To Move',
  'Under Construction',
  'New Launch',
  'Resale',
];
const USER_ROLE_VALUES: UserRole[] = ['buyer', 'seller', 'broker'];

function matchEnumValue<T extends string>(values: T[], name?: string | null): T | undefined {
  if (!name) {
    return undefined;
  }
  return values.find(value => value.toLowerCase() === name.toLowerCase());
}

function toPropertyType(name?: string | null): PropertyType {
  return matchEnumValue(PROPERTY_TYPE_VALUES, name) ?? 'Plot';
}

function toPropertyCategory(name?: string | null): PropertyCategory {
  return matchEnumValue(PROPERTY_CATEGORY_VALUES, name) ?? 'All';
}

function toListingType(name?: string | null): 'Sell' | 'Rent' {
  return (name ?? '').toLowerCase() === 'rent' ? 'Rent' : 'Sell';
}

function toReadyState(value: unknown): PropertyReadyState {
  const name = typeof value === 'string' ? value : undefined;
  return matchEnumValue(READY_STATE_VALUES, name) ?? 'Resale';
}

function toUserRole(value?: string | null): UserRole {
  return matchEnumValue(USER_ROLE_VALUES, value) ?? 'buyer';
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

// Known gap: GET /properties and GET /properties/:propertyId return ownerSummary/
// brokerSummary as { id, fullName, email, mobile, selectedRole } with NO city field at
// all, but the mock's UserSummary type requires city: string (non-optional). Defaulting
// to '' here rather than inventing a fake city — this is a real data gap, not a bug.
const FALLBACK_OWNER: UserSummary = {
  id: '',
  name: '',
  mobile: '',
  role: 'buyer',
  city: '',
};

function normalizeUserSummary(user?: BackendUserSummary | null): UserSummary | undefined {
  if (!user) {
    return undefined;
  }

  return {
    id: String(user.id),
    name: user.fullName ?? '',
    mobile: user.mobile ?? '',
    email: user.email ?? undefined,
    role: toUserRole(user.selectedRole),
    city: '',
    avatar: undefined,
  };
}

function normalizeLocation(location?: BackendPropertyLocation | null): LocationInfo {
  return {
    city: location?.city?.name ?? '',
    state: location?.state?.name ?? '',
    area: location?.area?.name ?? undefined,
    address: location?.addressLine1 ?? undefined,
    pincode: location?.pincode ?? undefined,
    latitude: toOptionalNumber(location?.latitude),
    longitude: toOptionalNumber(location?.longitude),
  };
}

function normalizeMedia(raw: BackendProperty): PropertyMedia[] {
  const images: PropertyMedia[] = (raw.media?.images ?? []).map(image => ({
    id: String(image.id),
    type: 'image',
    uri: image.file?.url ?? '',
  }));

  const videos: PropertyMedia[] = (raw.media?.videos ?? []).map(video => ({
    id: String(video.id),
    type: 'video',
    uri: video.file?.url ?? '',
    thumbnail: video.thumbnail?.url ?? undefined,
  }));

  return [...images, ...videos];
}

function toDocumentType(mimeType?: string | null, fileType?: string | null): 'PDF' | 'JPG' | 'PNG' {
  const value = (fileType ?? mimeType ?? '').toLowerCase();
  if (value.includes('pdf')) {
    return 'PDF';
  }
  if (value.includes('png')) {
    return 'PNG';
  }
  return 'JPG';
}

function normalizeDocuments(raw: BackendProperty): UploadedDocument[] {
  return (raw.media?.documents ?? []).map(document => ({
    id: String(document.id),
    name: document.title ?? document.file?.originalName ?? 'Document',
    type: toDocumentType(document.file?.mimeType, document.file?.fileType),
    uri: document.file?.url ?? '',
    uploadedAt: raw.createdAt ?? '',
    status: 'uploaded',
  }));
}

export function normalizeProperty(raw: BackendProperty): Property {
  const details = raw.basic?.details ?? {};

  return {
    id: String(raw.id),
    title: raw.title ?? '',
    description: raw.description ?? '',
    price: raw.price ?? 0,
    // The mock model has a single flat areaSqFt field; the backend has three
    // (carpet/built-up/plot). Prefer built-up (most commonly displayed for
    // residential listings), then carpet, then plot area.
    areaSqFt:
      raw.area?.builtUpAreaSqft ?? raw.area?.carpetAreaSqft ?? raw.area?.plotAreaSqft ?? 0,
    propertyType: toPropertyType(raw.basic?.propertyType?.name),
    category: toPropertyCategory(raw.basic?.category?.name),
    listingType: toListingType(raw.basic?.listingType?.name),
    bhk: raw.basic?.bhk?.name,
    facing: raw.basic?.facing?.name,
    roadWidthFt: toOptionalNumber(details.roadWidth),
    furnishing: typeof details.furnishing === 'string' ? details.furnishing : undefined,
    constructionYear: toOptionalNumber(details.constructionYear),
    floorNumber: raw.basic?.floorNumber ?? undefined,
    totalFloors: raw.basic?.totalFloors ?? undefined,
    readyState: toReadyState(details.readyState),
    status: mapStatus(raw.status),
    amenities: (raw.amenities ?? []).map(amenity => amenity.name),
    verified: raw.verificationStatus === 'APPROVED',
    ownerType: toUserRole(raw.ownerSummary?.selectedRole) === 'broker' ? 'Broker' : 'Owner',
    owner: normalizeUserSummary(raw.ownerSummary) ?? FALLBACK_OWNER,
    location: normalizeLocation(raw.location),
    media: normalizeMedia(raw),
    documents: normalizeDocuments(raw),
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
    featured: raw.isFeatured ?? false,
  };
}

// ---------------------------------------------------------------------------
// Filter -> query param resolution.
//
// PropertyFilterState (mock) uses display names (city, propertyType, bhk, facing);
// the backend needs numeric ids (cityId, propertyTypeId, bhkTypeId, facingId). Names
// are resolved via Module 2's masterApi/locationApi and cached in-memory per name so
// repeated getProperties() calls with the same filter don't re-fetch the full master
// list every time. This is intentionally simple (no TTL/invalidation) for this
// sub-piece.
// ---------------------------------------------------------------------------

const DEFAULT_LIST_LIMIT = 100; // backend's propertySearchSchema max; getProperties has no pagination params to forward.

const masterListCache = new Map<MasterType, Promise<{id: number; name: string}[]>>();

function getMasterList(type: MasterType): Promise<{id: number; name: string}[]> {
  let cached = masterListCache.get(type);
  if (!cached) {
    cached = getMasterData(type, {limit: 100}).then(result => result.items);
    masterListCache.set(type, cached);
  }
  return cached;
}

async function resolveMasterIdByName(
  type: MasterType,
  name?: string,
): Promise<number | undefined> {
  if (!name) {
    return undefined;
  }
  const items = await getMasterList(type);
  return items.find(item => item.name.toLowerCase() === name.toLowerCase())?.id;
}

const cityIdCache = new Map<string, Promise<number | undefined>>();

function resolveCityId(cityName?: string): Promise<number | undefined> {
  if (!cityName) {
    return Promise.resolve(undefined);
  }
  const key = cityName.toLowerCase();
  let cached = cityIdCache.get(key);
  if (!cached) {
    cached = searchLocations({search: cityName, type: 'city'}).then(result => {
      const match =
        result.items.find(item => item.name.toLowerCase() === key) ?? result.items[0];
      return match?.id;
    });
    cityIdCache.set(key, cached);
  }
  return cached;
}

// Siblings of resolveCityId above, added for the write-side (create/update) location
// body, which needs stateId and (optionally) areaId in addition to cityId. Same
// search-by-name-take-first-match pattern and per-name in-memory cache, deliberately
// not generalized into resolveCityId itself to keep this diff additive.
const stateIdCache = new Map<string, Promise<number | undefined>>();

function resolveStateId(stateName?: string): Promise<number | undefined> {
  if (!stateName) {
    return Promise.resolve(undefined);
  }
  const key = stateName.toLowerCase();
  let cached = stateIdCache.get(key);
  if (!cached) {
    cached = searchLocations({search: stateName, type: 'state'}).then(result => {
      const match =
        result.items.find(item => item.name.toLowerCase() === key) ?? result.items[0];
      return match?.id;
    });
    stateIdCache.set(key, cached);
  }
  return cached;
}

const areaIdCache = new Map<string, Promise<number | undefined>>();

function resolveAreaId(areaName?: string): Promise<number | undefined> {
  if (!areaName) {
    return Promise.resolve(undefined);
  }
  const key = areaName.toLowerCase();
  let cached = areaIdCache.get(key);
  if (!cached) {
    cached = searchLocations({search: areaName, type: 'area'}).then(result => {
      const match =
        result.items.find(item => item.name.toLowerCase() === key) ?? result.items[0];
      return match?.id;
    });
    areaIdCache.set(key, cached);
  }
  return cached;
}

// resolveMasterIdByName/resolveCityId resolve to `undefined` when a name can't be
// matched, which is fine for optional filter/enrichment fields. propertyTypeId,
// propertyCategoryId, listingTypeId, stateId and cityId are all REQUIRED by
// createPropertySchema/updatePropertySchema though, so an unresolved required field
// must fail loudly here rather than silently sending an invalid/undefined id that the
// backend would reject with a less useful 400.
async function resolveRequiredMasterId(
  type: MasterType,
  name: string,
  label: string,
): Promise<number> {
  const id = await resolveMasterIdByName(type, name);
  if (id === undefined) {
    throw new Error(
      `Unable to resolve ${label} "${name}" to a backend id via master type "${type}"`,
    );
  }
  return id;
}

async function resolveRequiredCityId(cityName: string): Promise<number> {
  const id = await resolveCityId(cityName);
  if (id === undefined) {
    throw new Error(`Unable to resolve city "${cityName}" to a backend cityId`);
  }
  return id;
}

async function resolveRequiredStateId(stateName: string): Promise<number> {
  const id = await resolveStateId(stateName);
  if (id === undefined) {
    throw new Error(`Unable to resolve state "${stateName}" to a backend stateId`);
  }
  return id;
}

// Amenity names that don't resolve to a known master record are dropped rather than
// failing the whole create/update: amenities are enrichment data, unlike propertyType/
// category/listingType/location which are required identifying fields the backend
// cannot create a property without.
async function resolveAmenityIds(amenities: string[]): Promise<number[]> {
  const resolved = await Promise.all(
    amenities.map(name => resolveMasterIdByName('amenities', name)),
  );
  return resolved.filter((id): id is number => id !== undefined);
}

interface CreateOrUpdateLocationBody {
  stateId: number;
  cityId: number;
  areaId?: number;
  address: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
}

async function buildLocationBody(
  location: LocationInfo,
): Promise<CreateOrUpdateLocationBody> {
  // location.address is a required, non-optional field on the backend's
  // propertyLocationSchema (`address: z.string().trim().min(1).max(255)`) — this is
  // genuinely the create/update input field name, distinct from `addressLine1` which
  // is only how GET responses expose it (see BackendPropertyLocation above).
  if (!location.address) {
    throw new Error(
      'location.address is required by the backend but missing from the payload',
    );
  }

  const [stateId, cityId, areaId] = await Promise.all([
    resolveRequiredStateId(location.state),
    resolveRequiredCityId(location.city),
    resolveAreaId(location.area),
  ]);

  return {
    stateId,
    cityId,
    areaId,
    address: location.address,
    latitude: location.latitude,
    longitude: location.longitude,
    pincode: location.pincode,
  };
}

// ---------------------------------------------------------------------------
// Media/document upload step.
//
// AddPropertyPayload's `media`/`documents` carry local device uris that have not been
// uploaded yet. createPropertySchema/updatePropertySchema's `media` field instead needs
// fileId references returned by POST /uploads. This function is kept separate from
// addProperty/updateProperty so it is independently unit-testable.
//
// Known limitation: an item whose `uri` is already an http(s) URL is assumed to be
// existing, already-uploaded media coming back through normalizeProperty() (e.g. when
// editing a property fetched from the backend), not a local file pending upload.
// normalizeMedia()/normalizeDocuments() above only carry the PropertyImage/
// PropertyVideo/PropertyDocument join-row id (raw.media.images[].id etc.), never the
// underlying File's fileId, so THIS FUNCTION has no way to recover a fileId for such
// an item — it is skipped (dropped) rather than re-uploaded or guessed at. That
// remains true for any direct caller of uploadPropertyMedia that hands it a bare
// PropertyMedia/UploadedDocument with only a URI (e.g. addProperty always deals with
// freshly picked local files, so it isn't affected in practice; a caller that
// deliberately round-trips existing remote items through this function still is).
//
// This does NOT apply to updateProperty's own partial-update merge (the caller-
// untouched half of media/documents when only one of the two is supplied): that half
// is reconstructed directly from the raw backend response's real fileId
// (echoRawImages/echoRawVideos/echoRawDocuments below), bypassing this function
// entirely, so it is not subject to the drop behavior described here.
// ---------------------------------------------------------------------------

function isRemoteUri(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

function basename(uri: string): string {
  const clean = uri.split('?')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1] || 'file';
}

function inferExtension(uri: string): string | undefined {
  const match = /\.([a-zA-Z0-9]+)$/.exec(uri.split('?')[0]);
  return match?.[1]?.toLowerCase();
}

// Extensions verified against the backend's own allow-lists
// (1SqrPropertyBackend/src/utils/mimeTypes.ts: IMAGE_EXTENSIONS/VIDEO_EXTENSIONS).
const IMAGE_MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const VIDEO_MIME_BY_EXT: Record<string, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
};
const DOCUMENT_MIME_BY_TYPE: Record<UploadedDocument['type'], string> = {
  PDF: 'application/pdf',
  JPG: 'image/jpeg',
  PNG: 'image/png',
};

function inferImageMimeType(uri: string): string {
  const ext = inferExtension(uri);
  return (ext && IMAGE_MIME_BY_EXT[ext]) || 'image/jpeg';
}

function inferVideoMimeType(uri: string): string {
  const ext = inferExtension(uri);
  return (ext && VIDEO_MIME_BY_EXT[ext]) || 'video/mp4';
}

function toUploadFileInput(uri: string, mimeType: string): UploadFileInput {
  return {uri, name: basename(uri), type: mimeType};
}

export interface PropertyMediaUploadResult {
  images: Array<{
    fileId: number;
    sortOrder: number;
    isPrimary: boolean;
    mediaType: 'image' | '360_image' | 'floor_plan';
  }>;
  videos: Array<{
    fileId: number;
    sortOrder: number;
    thumbnailFileId?: number;
    mediaType: 'video' | 'walkthrough';
  }>;
  documents: Array<{
    fileId: number;
    title?: string;
    sortOrder: number;
    documentType: 'registry' | 'ownership_proof' | 'property_tax' | 'floor_plan' | 'other';
    isVerified: boolean;
  }>;
}

export async function uploadPropertyMedia(
  media: PropertyMedia[],
  documents: UploadedDocument[],
  entityId?: string,
): Promise<PropertyMediaUploadResult> {
  const imageItems = media.filter(item => item.type === 'image' && !isRemoteUri(item.uri));
  const videoItems = media.filter(item => item.type === 'video' && !isRemoteUri(item.uri));
  const documentItems = documents.filter(item => !isRemoteUri(item.uri));

  const [uploadedImages, uploadedVideos, uploadedThumbnails, uploadedDocuments] =
    await Promise.all([
      Promise.all(
        imageItems.map(item =>
          uploadFile(toUploadFileInput(item.uri, inferImageMimeType(item.uri)), {
            module: 'property',
            entityId,
          }),
        ),
      ),
      Promise.all(
        videoItems.map(item =>
          uploadFile(toUploadFileInput(item.uri, inferVideoMimeType(item.uri)), {
            module: 'property',
            entityId,
          }),
        ),
      ),
      Promise.all(
        videoItems.map(item =>
          item.thumbnail && !isRemoteUri(item.thumbnail)
            ? uploadFile(toUploadFileInput(item.thumbnail, inferImageMimeType(item.thumbnail)), {
                module: 'property',
                entityId,
              })
            : Promise.resolve(undefined),
        ),
      ),
      Promise.all(
        documentItems.map(item =>
          uploadFile(
            {uri: item.uri, name: item.name || basename(item.uri), type: DOCUMENT_MIME_BY_TYPE[item.type]},
            {module: 'property', entityId},
          ),
        ),
      ),
    ]);

  return {
    images: uploadedImages.map((result, index) => ({
      fileId: Number(result.fileId),
      sortOrder: index,
      // The mock's PropertyMedia carries no isPrimary flag; the first uploaded image is
      // treated as the primary/cover photo, matching the common listing-form default.
      isPrimary: index === 0,
      mediaType: 'image',
    })),
    videos: uploadedVideos.map((result, index) => ({
      fileId: Number(result.fileId),
      sortOrder: index,
      thumbnailFileId: uploadedThumbnails[index]
        ? Number(uploadedThumbnails[index]!.fileId)
        : undefined,
      mediaType: 'video',
    })),
    documents: uploadedDocuments.map((result, index) => ({
      fileId: Number(result.fileId),
      title: documentItems[index]?.name,
      sortOrder: index,
      documentType: 'other',
      isVerified: false,
    })),
  };
}

// ---------------------------------------------------------------------------
// updateProperty's partial-media-merge helpers.
//
// When a caller supplies only one of `updates.media`/`updates.documents`, the other
// (untouched) half must be echoed back to the backend as-is or `replaceRelations()`
// (property.service.ts) will wipe it (an empty `[]` is still truthy there, so e.g.
// `if (input.media?.images) replaceImages(id, [])` still runs and deletes everything).
// The untouched half must come from the RAW backend response, not the normalized
// `Property`: normalizeMedia()/normalizeDocuments() only keep the join-row id, never
// the underlying File's fileId that createPropertySchema/updatePropertySchema's
// `media.images[].fileId` etc. require, and nothing needs re-uploading here anyway —
// it's already-uploaded media, so its existing fileId is simply echoed back.
// Field names below are verified against property.service.ts's presentProperty().
// ---------------------------------------------------------------------------

function echoRawImages(raw: BackendProperty | undefined): PropertyMediaUploadResult['images'] {
  return (raw?.media?.images ?? [])
    .filter(image => image.file?.id !== undefined && image.file?.id !== null)
    .map(image => ({
      fileId: Number(image.file!.id),
      sortOrder: image.sortOrder ?? 0,
      isPrimary: image.isPrimary ?? false,
      mediaType: image.mediaType ?? 'image',
    }));
}

function echoRawVideos(raw: BackendProperty | undefined): PropertyMediaUploadResult['videos'] {
  return (raw?.media?.videos ?? [])
    .filter(video => video.file?.id !== undefined && video.file?.id !== null)
    .map(video => ({
      fileId: Number(video.file!.id),
      sortOrder: video.sortOrder ?? 0,
      thumbnailFileId:
        video.thumbnail?.id !== undefined && video.thumbnail?.id !== null
          ? Number(video.thumbnail.id)
          : undefined,
      mediaType: video.mediaType ?? 'video',
    }));
}

function echoRawDocuments(
  raw: BackendProperty | undefined,
): PropertyMediaUploadResult['documents'] {
  return (raw?.media?.documents ?? [])
    .filter(document => document.file?.id !== undefined && document.file?.id !== null)
    .map(document => ({
      fileId: Number(document.file!.id),
      title: document.title ?? undefined,
      // presentProperty()'s document mapping doesn't expose sortOrder (nor does
      // propertyDocumentRepository.replaceDocuments's input type use it); the schema
      // default (0) is used, matching what an omitted sortOrder would resolve to.
      sortOrder: 0,
      documentType: document.documentType ?? 'other',
      isVerified: document.isVerified ?? false,
    }));
}

// ---------------------------------------------------------------------------
// Mock (Title-Case, 5-value) -> backend (lowercase-snake, 11-value) status mapping for
// create/update. Opposite direction from STATUS_MAP above (which maps backend -> mock
// for reads). Only the 5 values the mock model can produce need a mapping; anything
// else defaults to "draft" (the schema's own default) rather than guessing.
// ---------------------------------------------------------------------------
const REVERSE_STATUS_MAP: Record<PropertyLifecycleStatus, string> = {
  Draft: 'draft',
  Pending: 'pending',
  Active: 'active',
  Sold: 'sold',
  Rejected: 'rejected',
};

async function buildPropertySearchQuery(
  filters?: Partial<PropertyFilterState>,
): Promise<Record<string, unknown>> {
  if (!filters) {
    return {limit: DEFAULT_LIST_LIMIT};
  }

  const [propertyTypeId, cityId, bhkTypeId, facingId] = await Promise.all([
    resolveMasterIdByName('property-types', filters.propertyType),
    resolveCityId(filters.city),
    resolveMasterIdByName('bhk-options', filters.bhk),
    resolveMasterIdByName('facing-directions', filters.facing),
  ]);

  return {
    search: filters.search || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minArea: filters.minArea,
    maxArea: filters.maxArea,
    propertyTypeId,
    cityId,
    bhkTypeId,
    facingId,
    readyState: filters.readyToMoveOnly ? 'Ready To Move' : undefined,
    verified: filters.verifiedOnly ? true : undefined,
    limit: DEFAULT_LIST_LIMIT,
  };
}

export async function getProperties(
  filters?: Partial<PropertyFilterState>,
): Promise<Property[]> {
  const query = await buildPropertySearchQuery(filters);
  const endpoint = `${ApiRouteService.properties.list}${buildQueryString(query)}`;

  const response = await apiRequest<BackendPropertyListResponse>({
    endpoint,
    method: 'GET',
    auth: 'none',
  });

  const items = (response.items ?? []).map(normalizeProperty);

  // ownerOnly has no backend query-param equivalent (ownerId/brokerId filter to a
  // specific user, not "posted by an owner rather than a broker" in general), so it's
  // applied client-side against the normalized ownerType instead.
  if (filters?.ownerOnly) {
    return items.filter(item => item.ownerType === 'Owner');
  }

  return items;
}

// Shared by getPropertyById (normalized) and updateProperty's partial-media merge
// (which needs the raw fileId fields normalizeProperty() discards — see
// echoRawImages/echoRawVideos/echoRawDocuments above).
async function fetchRawProperty(id: string): Promise<BackendProperty | undefined> {
  const endpoint = ApiRouteService.properties.detail.replace(':propertyId', id);

  try {
    const response = await apiRequest<BackendProperty>({
      endpoint,
      method: 'GET',
      auth: 'access',
    });

    return response ?? undefined;
  } catch (error) {
    // Matches the original mock's `properties.find(...)` contract: a missing property
    // resolves to `undefined` rather than rejecting. The backend throws a 404 AppError
    // for a not-found (or not-visible-to-this-user) property, and apiRequest/
    // parseApiResponse turn that into a rejected promise, not a falsy resolved value —
    // so that specific case must be caught and translated here. Any other failure
    // (network error, 401, 500, etc.) is a real error and should still reject.
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const raw = await fetchRawProperty(id);
  return raw ? normalizeProperty(raw) : undefined;
}

export async function addProperty(payload: AddPropertyPayload): Promise<Property> {
  const [
    propertyTypeId,
    propertyCategoryId,
    listingTypeId,
    bhkTypeId,
    facingId,
    amenityIds,
    location,
    media,
  ] = await Promise.all([
    resolveRequiredMasterId('property-types', payload.propertyType, 'propertyType'),
    resolveRequiredMasterId('property-categories', payload.category, 'category'),
    resolveRequiredMasterId('listing-types', payload.listingType, 'listingType'),
    resolveMasterIdByName('bhk-options', payload.bhk),
    resolveMasterIdByName('facing-directions', payload.facing),
    resolveAmenityIds(payload.amenities),
    buildLocationBody(payload.location),
    uploadPropertyMedia(payload.media, payload.documents),
  ]);

  const body = {
    title: payload.title,
    description: payload.description || undefined,
    propertyTypeId,
    propertyCategoryId,
    listingTypeId,
    price: payload.price,
    // The mock model has a single flat areaSqFt field; the backend has three
    // (carpet/built-up/plot). Mirrors normalizeProperty()'s read-side preference order
    // (built-up first) by writing areaSqFt back into builtUpAreaSqft.
    builtUpAreaSqft: payload.areaSqFt || undefined,
    bhkTypeId,
    facingId,
    floorNumber: payload.floorNumber,
    totalFloors: payload.totalFloors,
    constructionYear: payload.constructionYear,
    roadWidth: payload.roadWidthFt,
    readyState: payload.readyState,
    furnishing: payload.furnishing,
    isPriceNegotiable: false,
    amenityIds,
    location,
    media,
    status: REVERSE_STATUS_MAP[payload.status] ?? 'draft',
  };

  const response = await apiRequest<BackendProperty, typeof body>({
    endpoint: ApiRouteService.properties.create,
    method: 'POST',
    body,
    auth: 'access',
  });

  return normalizeProperty(response);
}

export async function updateProperty(
  propertyId: string,
  updates: Partial<Property>,
): Promise<Property | undefined> {
  const body: Record<string, unknown> = {};
  const pending: Promise<void>[] = [];

  if (updates.title !== undefined) body.title = updates.title;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.price !== undefined) body.price = updates.price;
  if (updates.areaSqFt !== undefined) body.builtUpAreaSqft = updates.areaSqFt;
  if (updates.floorNumber !== undefined) body.floorNumber = updates.floorNumber;
  if (updates.totalFloors !== undefined) body.totalFloors = updates.totalFloors;
  if (updates.constructionYear !== undefined) body.constructionYear = updates.constructionYear;
  if (updates.roadWidthFt !== undefined) body.roadWidth = updates.roadWidthFt;
  if (updates.readyState !== undefined) body.readyState = updates.readyState;
  if (updates.furnishing !== undefined) body.furnishing = updates.furnishing;
  if (updates.status !== undefined) {
    body.status = REVERSE_STATUS_MAP[updates.status] ?? 'draft';
  }

  if (updates.propertyType !== undefined) {
    pending.push(
      resolveRequiredMasterId('property-types', updates.propertyType, 'propertyType').then(
        id => {
          body.propertyTypeId = id;
        },
      ),
    );
  }
  if (updates.category !== undefined) {
    pending.push(
      resolveRequiredMasterId('property-categories', updates.category, 'category').then(id => {
        body.propertyCategoryId = id;
      }),
    );
  }
  if (updates.listingType !== undefined) {
    pending.push(
      resolveRequiredMasterId('listing-types', updates.listingType, 'listingType').then(id => {
        body.listingTypeId = id;
      }),
    );
  }
  if (updates.bhk !== undefined) {
    pending.push(
      resolveMasterIdByName('bhk-options', updates.bhk).then(id => {
        body.bhkTypeId = id;
      }),
    );
  }
  if (updates.facing !== undefined) {
    pending.push(
      resolveMasterIdByName('facing-directions', updates.facing).then(id => {
        body.facingId = id;
      }),
    );
  }
  if (updates.amenities !== undefined) {
    pending.push(
      resolveAmenityIds(updates.amenities).then(ids => {
        body.amenityIds = ids;
      }),
    );
  }
  if (updates.location !== undefined) {
    pending.push(
      buildLocationBody(updates.location).then(location => {
        body.location = location;
      }),
    );
  }

  // The backend's `media` field replaces images/videos/documents together as one unit
  // (there is no separate PATCH for just images or just documents). Property's `media`
  // and `documents` are two separate top-level fields on the mock model though, so if
  // the caller only supplied one of them, the untouched half must be carried forward
  // explicitly — an empty array is still truthy to replaceRelations()
  // (property.service.ts), so omitting it here would silently wipe it out on the
  // backend, not leave it alone.
  //
  // The untouched half is reconstructed from the RAW backend response (fetchRawProperty),
  // not the normalized one (getPropertyById) — normalizeMedia()/normalizeDocuments()
  // discard the underlying File's fileId, and uploadPropertyMedia() would in turn drop
  // any such item as an assumed-already-remote URI (see its "Known limitation" comment
  // above), silently emptying the untouched half. Nothing in the untouched half needs
  // re-uploading anyway — it's already-uploaded media, so its existing fileId is just
  // echoed back via echoRawImages/echoRawVideos/echoRawDocuments.
  //
  // The caller-supplied half, by contrast, is authoritative and fully replaces whatever
  // existed before (it still goes through uploadPropertyMedia, since it may contain a
  // mix of freshly-picked local files and caller-intended-remote items).
  if (updates.media !== undefined || updates.documents !== undefined) {
    pending.push(
      (async () => {
        const suppliedMedia = updates.media;
        const suppliedDocuments = updates.documents;

        if (suppliedMedia !== undefined && suppliedDocuments !== undefined) {
          body.media = await uploadPropertyMedia(suppliedMedia, suppliedDocuments, propertyId);
          return;
        }

        const [uploaded, raw] = await Promise.all([
          uploadPropertyMedia(suppliedMedia ?? [], suppliedDocuments ?? [], propertyId),
          fetchRawProperty(propertyId),
        ]);

        body.media = {
          images: suppliedMedia !== undefined ? uploaded.images : echoRawImages(raw),
          videos: suppliedMedia !== undefined ? uploaded.videos : echoRawVideos(raw),
          documents: suppliedDocuments !== undefined ? uploaded.documents : echoRawDocuments(raw),
        };
      })(),
    );
  }

  await Promise.all(pending);

  if (Object.keys(body).length === 0) {
    // Nothing changed; updatePropertySchema requires at least one field, so there is
    // nothing valid to send. Return the current property unchanged.
    return getPropertyById(propertyId);
  }

  const endpoint = ApiRouteService.properties.update.replace(':propertyId', propertyId);

  try {
    const response = await apiRequest<BackendProperty, typeof body>({
      endpoint,
      method: 'PATCH',
      body,
      auth: 'access',
    });

    return response ? normalizeProperty(response) : undefined;
  } catch (error) {
    // Same missing-resource-is-not-exceptional reasoning as getPropertyById above.
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function deleteProperty(propertyId: string): Promise<boolean> {
  const endpoint = ApiRouteService.properties.delete.replace(':propertyId', propertyId);

  try {
    await apiRequest<unknown>({
      endpoint,
      method: 'DELETE',
      auth: 'access',
    });
    return true;
  } catch (error) {
    // A 404 (already deleted / never existed) resolves to `false` rather than
    // rejecting, mirroring the "missing resource is a normal outcome" pattern used by
    // getPropertyById/updateProperty above. Any other failure (403 permission denial,
    // 409 conflict, network error, etc.) is a real error and still rejects.
    if (error instanceof ApiError && error.status === 404) {
      return false;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Module 3, sub-piece 3a: "My Properties" / "Saved (Favourites)" /
// "Recently Viewed" read-only lists, plus view-tracking.
//
// GET /me/properties, GET /me/saved-properties and GET /me/recent-properties
// (myPropertyRouter, property.routes.ts) all return the exact same
// `{ items, pagination }` envelope as GET /properties above — same
// `presentProperty()` shape on the backend — so they reuse the existing
// BackendPropertyListResponse type and normalizeProperty() verbatim rather than
// defining anything new. None of the three read any query params besides
// page/limit (property.service.ts's myProperties/saved/recent).
// ---------------------------------------------------------------------------

async function fetchNormalizedPropertyList(
  endpointTemplate: string,
  params?: {page?: number; limit?: number},
): Promise<Property[]> {
  const endpoint = `${endpointTemplate}${buildQueryString(params)}`;

  const response = await apiRequest<BackendPropertyListResponse>({
    endpoint,
    method: 'GET',
    auth: 'access',
  });

  return (response.items ?? []).map(normalizeProperty);
}

export async function getMyProperties(params?: {
  page?: number;
  limit?: number;
}): Promise<Property[]> {
  return fetchNormalizedPropertyList(ApiRouteService.properties.mine, params);
}

export async function getSavedProperties(params?: {
  page?: number;
  limit?: number;
}): Promise<Property[]> {
  return fetchNormalizedPropertyList(ApiRouteService.properties.saved, params);
}

export async function getRecentProperties(params?: {
  page?: number;
  limit?: number;
}): Promise<Property[]> {
  return fetchNormalizedPropertyList(ApiRouteService.properties.recent, params);
}

// ---------------------------------------------------------------------------
// Module 3, sub-piece 3b: save/unsave (favourite) a property for real.
//
// POST /properties/:propertyId/save and DELETE /properties/:propertyId/save
// (propertyRouter, gated by `propertyRouter.use(authenticate)` — auth: 'access').
// Verified against 1SqrPropertyBackend/src/validators/property.validator.ts:
// propertyLeadActionSchema is reused for the save body (propertyController.save
// forwards req.body straight into leadService.createFromPropertyAction) and every
// field on it is optional (contactName/contactMobile/contactEmail/message/
// budgetMin/budgetMax/visitDate), so an empty object satisfies it — none of those
// fields are meaningful for a simple heart-tap.
//
// Response bodies are not consumed here: a non-throwing POST returns the raw
// PropertyFavourite row ({id, userId, propertyId, createdAt}), a non-throwing
// DELETE returns {deleted: true} and is idempotent server-side. Callers (the
// savedStore) only care whether the call threw.
//
// ensureExists() on the backend only considers a property "existing" for save/
// unsave when its status is ACTIVE or APPROVED, so calling this against a DRAFT
// property correctly rejects with a 404 — that is expected backend behavior, not
// a bug in this function.
// ---------------------------------------------------------------------------

export async function saveProperty(propertyId: string): Promise<void> {
  const endpoint = ApiRouteService.properties.save.replace(':propertyId', propertyId);

  await apiRequest<unknown, Record<string, never>>({
    endpoint,
    method: 'POST',
    body: {},
    auth: 'access',
  });
}

export async function unsaveProperty(propertyId: string): Promise<void> {
  const endpoint = ApiRouteService.properties.unsave.replace(':propertyId', propertyId);

  await apiRequest<unknown>({
    endpoint,
    method: 'DELETE',
    auth: 'access',
  });
}

// View-tracking only, not a critical user-facing action: POST /properties/:propertyId/recent
// (propertyRouter, gated by `propertyRouter.use(authenticate)` — see property.routes.ts
// line 25, which runs before this route is registered) requires an EMPTY body
// (recordRecentPropertySchema's `body: emptyBodySchema` in property.validator.ts) — any
// unexpected field fails validation, so no body is sent at all. A failure here (network
// blip, transient 401, etc.) must never disrupt the property detail screen, so it is
// caught and logged rather than rethrown.
export async function recordPropertyView(propertyId: string): Promise<void> {
  const endpoint = ApiRouteService.properties.trackRecent.replace(
    ':propertyId',
    propertyId,
  );

  try {
    await apiRequest<unknown>({
      endpoint,
      method: 'POST',
      auth: 'access',
    });
  } catch (error) {
    console.warn('recordPropertyView failed', error);
  }
}

// ---------------------------------------------------------------------------
// Property lead-action tracking: call / whatsapp / interested / contact / share.
//
// POST /properties/:propertyId/call, /whatsapp and /interested (propertyRouter,
// gated by `propertyRouter.use(authenticate)` — auth: 'access') all validate against
// propertyLeadActionSchema (property.validator.ts): contactName/contactMobile/
// contactEmail/message/budgetMin/budgetMax/visitDate are ALL optional, so `{}` is a
// valid body — none of them are needed for a plain button tap.
//
// Live-verified (2026-09-07) against http://3.109.54.6/api/v1/properties/1/{call,
// whatsapp,interested} with a fresh buyer session: all three returned
// 201 `{ contact: {...}, lead: {...} }`. Calling call -> whatsapp -> interested on the
// SAME property from the SAME user returned the SAME `lead.id` every time —
// leadService.createFromPropertyAction finds-or-updates one lead per (user, property)
// pair rather than creating a new lead per action. Only `lead.id`/`lead.leadNo` are
// surfaced via PropertyLeadActionResult below; the rest of `contact`/`lead` is
// backend-internal CRM detail this app has no current use for, so it is intentionally
// not fully normalized.
//
// call/whatsapp accompany a native intent (utils/propertyActions.ts's
// callPropertyOwner/openWhatsAppForProperty, which open tel:/wa.me links via
// Linking.openURL) that succeeds or fails independently of this tracking call, so a
// tracking failure here is logged and swallowed rather than surfaced — same reasoning
// as recordPropertyView above: it must never disrupt a native action the user already
// took. interested has no such native fallback (this call IS the user-facing action),
// so it propagates errors for the caller to catch and surface.
//
// NOTE: these are distinct from utils/propertyActions.ts's `callPropertyOwner`/
// `openWhatsAppForProperty`/`shareProperty`, which open the native dialer/WhatsApp/
// share sheet and are NOT renamed or touched here.
// ---------------------------------------------------------------------------

export interface PropertyLeadActionInput {
  contactName?: string;
  contactMobile?: string;
  contactEmail?: string;
  message?: string;
  budgetMin?: number;
  budgetMax?: number;
  // ISO 8601 date string; propertyLeadActionSchema's `visitDate: z.coerce.date()`
  // accepts a string and coerces it, so no client-side Date object is required.
  visitDate?: string;
}

export interface PropertyLeadActionResult {
  leadId: string;
  leadNo?: string;
}

interface BackendLeadActionResponse {
  lead?: {id: number | string; leadNo?: string | null} | null;
}

function normalizeLeadActionResult(
  response: BackendLeadActionResponse | undefined,
): PropertyLeadActionResult | undefined {
  if (!response?.lead) {
    return undefined;
  }
  return {
    leadId: String(response.lead.id),
    leadNo: response.lead.leadNo ?? undefined,
  };
}

async function postPropertyLeadAction<TBody extends object>(
  endpointTemplate: string,
  propertyId: string,
  body: TBody,
): Promise<PropertyLeadActionResult | undefined> {
  const endpoint = endpointTemplate.replace(':propertyId', propertyId);
  const response = await apiRequest<BackendLeadActionResponse, TBody>({
    endpoint,
    method: 'POST',
    body,
    auth: 'access',
  });
  return normalizeLeadActionResult(response);
}

export async function trackPropertyCall(
  propertyId: string,
  input: PropertyLeadActionInput = {},
): Promise<void> {
  try {
    await postPropertyLeadAction(ApiRouteService.properties.call, propertyId, input);
  } catch (error) {
    console.warn('trackPropertyCall failed', error);
  }
}

export async function trackPropertyWhatsapp(
  propertyId: string,
  input: PropertyLeadActionInput = {},
): Promise<void> {
  try {
    await postPropertyLeadAction(ApiRouteService.properties.whatsapp, propertyId, input);
  } catch (error) {
    console.warn('trackPropertyWhatsapp failed', error);
  }
}

// The "I'm Interested" action itself — no accompanying native intent, so unlike
// trackPropertyCall/trackPropertyWhatsapp above, failures are NOT swallowed here; the
// caller (PropertyDetailScreen) awaits this and shows a success/failure toast.
export async function markPropertyInterested(
  propertyId: string,
  input: PropertyLeadActionInput = {},
): Promise<PropertyLeadActionResult | undefined> {
  return postPropertyLeadAction(ApiRouteService.properties.interested, propertyId, input);
}

// ---------------------------------------------------------------------------
// POST /properties/:propertyId/contact — contactPropertySchema. Same optional
// contact/message fields as propertyLeadActionSchema above, plus `activityType`
// (call/whatsapp/email/interested, defaults to "interested" server-side if omitted).
// Live-verified (2026-09-07, property 1) with
// { activityType: "email", message: "..." } -> 201 `{ contact: {...}, lead: {...} }`,
// same lead-per-(user,property) reuse as call/whatsapp/interested above.
//
// No distinct "contact form" UI currently exists in PropertyDetailScreen or elsewhere
// under src/screens (verified by search) that would call this — it is added ahead of
// that screen being built, matching this module's established pattern of building
// service functions ahead of screen wiring (see uploadPropertyMedia/getMyProperties
// from earlier sub-pieces). Like markPropertyInterested, this has no accompanying
// native intent, so it also propagates errors rather than swallowing them.
// ---------------------------------------------------------------------------

export interface PropertyContactInput extends PropertyLeadActionInput {
  activityType?: 'call' | 'whatsapp' | 'email' | 'interested';
}

export async function trackPropertyContact(
  propertyId: string,
  input: PropertyContactInput = {},
): Promise<PropertyLeadActionResult | undefined> {
  return postPropertyLeadAction(ApiRouteService.properties.contact, propertyId, input);
}

// ---------------------------------------------------------------------------
// POST /properties/:propertyId/share — sharePropertySchema. `channel` (1-50 chars) is
// the only REQUIRED field across all five lead-action endpoints on this page;
// `recipient` is optional. Live-verified (2026-09-07, property 1) with
// { channel: "whatsapp" } -> 201 `{ share: {...}, lead: {...} }`.
//
// Accompanies the native share sheet (utils/propertyActions.ts's `shareProperty`,
// which calls `Share.share(...)`) — React Native's Share.share() result does not
// reliably report which app the user picked, so the caller passes a generic channel
// value (e.g. "share") rather than a real per-app channel. Like call/whatsapp above,
// a tracking failure here is swallowed rather than surfaced: the share sheet itself
// is not gated on this call succeeding.
// ---------------------------------------------------------------------------

export async function trackPropertyShare(
  propertyId: string,
  channel: string,
  recipient?: string,
): Promise<void> {
  const endpoint = ApiRouteService.properties.share.replace(':propertyId', propertyId);

  try {
    await apiRequest<BackendLeadActionResponse, {channel: string; recipient?: string}>({
      endpoint,
      method: 'POST',
      body: {channel, recipient},
      auth: 'access',
    });
  } catch (error) {
    console.warn('trackPropertyShare failed', error);
  }
}
