// src/hooks/useMembers.ts
import { useState, useEffect, useCallback } from 'react';
import { memberService, type Member, type MemberListParams, type MemberStatistics, type UpdateMemberRequest } from '@/lib/api';

interface UseMembersReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  statistics: MemberStatistics | null;
  refetch: () => Promise<void>;
  addMember: (member: any) => Promise<Member>;
  updateMember: (id: number, data: UpdateMemberRequest) => Promise<Member>;
  deleteMember: (id: number) => Promise<void>;
  getTotalSavings: (memberId: string) => number;
}

export function useMembers(params?: MemberListParams): UseMembersReturn {
  const [members, setMembers] = useState<Member[]>([]);
  const [statistics, setStatistics] = useState<MemberStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch members dengan parameter all=true untuk mendapatkan semua data tanpa pagination
      const response = await memberService.getMembers({ ...params, all: true });
      
      // Jika response adalah array (all=true), set langsung
      if (Array.isArray(response)) {
        setMembers(response);
      } else {
        // Jika response adalah paginated, ambil data-nya
        setMembers(response.data);
      }

    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data anggota');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await memberService.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Don't set error state for statistics, just log it
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchStatistics();
  }, [fetchMembers, fetchStatistics]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchMembers(), fetchStatistics()]);
  }, [fetchMembers, fetchStatistics]);

  // Create new member
  const addMember = useCallback(async (memberData: any): Promise<Member> => {
    try {
      const newMember = await memberService.createMember({
        full_name: memberData.name,
        employee_id: memberData.member_id,
        email: memberData.email || undefined,
        password: 'Password123!', // Default password, user should change later
        password_confirmation: 'Password123!',
        phone_number: memberData.phone || undefined,
        address: memberData.address || undefined,
        status: 'active',
        joined_date: memberData.join_date
      });
      
      await refetch();
      return newMember;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Gagal menambahkan anggota');
    }
  }, [refetch]);

  const updateMember = useCallback(async (id: number, data: UpdateMemberRequest): Promise<Member> => {
    try {
      const updatedMember = await memberService.updateMember(id, data);
      await refetch();
      return updatedMember;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Gagal mengupdate anggota');
    }
  }, [refetch]);

  // Note: Backend belum ada endpoint untuk delete member
  // Ini adalah placeholder
  const deleteMember = useCallback(async (id: number): Promise<void> => {
    try {
      // TODO: Implement ketika backend sudah menyediakan endpoint DELETE /members/{id}
      throw new Error('Endpoint untuk menghapus anggota belum tersedia');
      
      // Ketika endpoint tersedia, implementasinya akan seperti ini:
      // await memberService.deleteMember(id);
      // await refetch();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Gagal menghapus anggota');
    }
  }, [refetch]);

  // Helper function untuk mendapatkan total savings dari member_id
  // Note: Ini perlu disesuaikan dengan struktur data yang sebenarnya dari backend
  const getTotalSavings = useCallback((memberId: string): number => {
    // TODO: Implement dengan data real dari financial summary
    // Untuk sementara return 0
    return 0;
  }, []);

  return {
    members,
    loading,
    error,
    statistics,
    refetch,
    addMember,
    updateMember,
    deleteMember,
    getTotalSavings,
  };
}