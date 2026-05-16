import type { Me } from '@repo/schemas/auth';

import { useGetMe } from '@/api/auth/use-get-me';

export interface UseAuthResult {
  user: Me['user'] | null;
  tenantId: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const useAuth = (): UseAuthResult => {
  const query = useGetMe();
  const me = query.data;

  return {
    user: me?.user ?? null,
    tenantId: me?.tenantId ?? null,
    roles: me?.roles ?? [],
    isAuthenticated: !!me,
    isLoading: query.isPending,
    isError: query.isError,
  };
};
