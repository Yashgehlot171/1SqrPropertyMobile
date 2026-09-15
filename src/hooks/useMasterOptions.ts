import {useCallback, useEffect, useState} from 'react';

import {showApiError} from '@/api';
import {getMasterData} from '@/services/masterApi';
import type {MasterRecord, MasterType} from '@/services/masterApi';

/**
 * Fetches one GET /masters/:type list on mount and exposes it with the same
 * loading/error/retry shape used elsewhere in the app (see MyPropertiesScreen).
 * Used by the Add Property form screens to back option pickers (property type,
 * bhk, facing, amenities, ready state, ...) with live master data instead of
 * the hardcoded arrays in `@/constants/appConstants`.
 */
export function useMasterOptions(type: MasterType, errorMessage: string) {
  const [items, setItems] = useState<MasterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMasterData(type, {limit: 100});
      setItems(result.items);
    } catch (err) {
      showApiError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [type, errorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  return {items, isLoading, error, reload: load};
}
