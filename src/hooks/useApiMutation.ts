import {useCallback, useState} from 'react';

import {normalizeApiError} from '@/api';

export function useApiMutation<TArgs extends unknown[], TResult>(
  mutation: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const execute = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(undefined);

      try {
        return await mutation(...args);
      } catch (caught) {
        const normalized = normalizeApiError(caught);
        setError(normalized.message);
        throw normalized;
      } finally {
        setLoading(false);
      }
    },
    [mutation],
  );

  return {execute, loading, error};
}
