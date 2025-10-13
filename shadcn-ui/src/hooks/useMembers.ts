import { useState, useEffect } from 'react';
import { supabase, Member } from '@/lib/supabase';

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching members from Supabase...');
      console.log('📡 Supabase URL:', supabase.supabaseUrl);
      
      const { data, error: supabaseError } = await supabase
        .from('app_1c0eac5202_members')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Supabase response:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('❌ Supabase fetch error:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Members fetched successfully:', data?.length || 0, 'records');
      console.log('👥 Members data:', data);
      setMembers(data || []);
    } catch (err) {
      console.error('💥 Error fetching members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (memberData: {
    member_id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    status: 'active' | 'inactive';
    join_date: string;
  }) => {
    try {
      console.log('🚀 Adding member to Supabase...');
      console.log('📝 Member payload:', memberData);
      
      const insertData = {
        member_id: memberData.member_id,
        name: memberData.name,
        email: memberData.email || null,
        phone: memberData.phone || null,
        address: memberData.address || null,
        status: memberData.status,
        join_date: memberData.join_date,
      };

      console.log('📤 Insert data:', insertData);

      const { data, error: supabaseError } = await supabase
        .from('app_1c0eac5202_members')
        .insert([insertData])
        .select()
        .single();

      console.log('📥 Supabase insert response:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('❌ Supabase insert error:', supabaseError);
        console.error('🔍 Error details:', {
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code
        });
        throw supabaseError;
      }

      console.log('✅ Member added successfully:', data);
      setMembers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('💥 Error adding member:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    try {
      console.log('🔄 Updating member:', id, updates);
      
      const { data, error: supabaseError } = await supabase
        .from('app_1c0eac5202_members')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      console.log('📥 Update response:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('❌ Supabase update error:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Member updated successfully:', data);
      setMembers(prev => prev.map(member => member.id === id ? data : member));
      return data;
    } catch (err) {
      console.error('💥 Error updating member:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update member');
    }
  };

  const deleteMember = async (id: string) => {
    try {
      console.log('🗑️ Deleting member:', id);
      
      const { error: supabaseError } = await supabase
        .from('app_1c0eac5202_members')
        .delete()
        .eq('id', id);

      console.log('📥 Delete response:', { error: supabaseError });

      if (supabaseError) {
        console.error('❌ Supabase delete error:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Member deleted successfully');
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error('💥 Error deleting member:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
};