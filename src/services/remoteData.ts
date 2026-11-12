import {apiRequest} from '@/api';

/** Follow the backend pagination metadata; never silently truncate to page one. */
export async function getAllPages<T>(endpoint: string, auth: 'access' | 'none' = 'access'): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await apiRequest<{items: T[]; pagination?: {totalPages: number}}>({
      endpoint: endpoint + (endpoint.includes('?') ? '&' : '?') + 'limit=100&page=' + page,
      auth,
    });
    items.push(...result.items);
    totalPages = result.pagination?.totalPages ?? page;
    page += 1;
  } while (page <= totalPages);
  return items;
}
