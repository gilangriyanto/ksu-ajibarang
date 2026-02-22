// src/hooks/useManagementUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { memberService, type Member, type MemberListParams, type PaginatedResponse } from '@/lib/api';

interface UseManagementUsersReturn {
  users: Member[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useManagementUsers(params?: MemberListParams): UseManagementUsersReturn {
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await memberService.getManagementUsers({ ...params, all: true });
      
      if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching management users:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data staff');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch,
  };
}
