import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';

import { RESPONSE_STATUSES } from '../utils/responses';

const UNAUTHORIZED_REQUEST_CODE = 401;

export function useRequestManager() {
  const router = useRouter()
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const onCheckResponse = useCallback((response) => {
    switch (response.status) {
      case RESPONSE_STATUSES.ERROR:
        if (response.data.code === UNAUTHORIZED_REQUEST_CODE) {
          router.push('/login');
        } else {
          setError(response);
        }
        break;
      case RESPONSE_STATUSES.SUCCESS:
        setData(response.data);
        break;
      default:
    }
  }, [router]);

  return { data, error, onCheckResponse, setError };
}
