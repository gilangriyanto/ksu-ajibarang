import { useState, useEffect } from 'react';
import { supabase, ServiceFee, testSupabaseConnection } from '@/lib/supabase';

export const useServiceFees = () => {
  const [serviceFees, setServiceFees] = useState<ServiceFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceFees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching service fees from Supabase...');
      
      // Test connection first
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to Supabase');
      }
      
      const { data, error } = await supabase
        .from('app_1c0eac5202_service_fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Service fees fetch error:', error);
        throw error;
      }

      console.log('Service fees fetched successfully:', data?.length || 0);
      setServiceFees(data || []);
    } catch (err) {
      console.error('Error fetching service fees:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getServiceFeesByPeriod = (period: string) => {
    return serviceFees.filter(sf => sf.period === period);
  };

  useEffect(() => {
    fetchServiceFees();
  }, []);

  return {
    serviceFees,
    loading,
    error,
    getServiceFeesByPeriod,
    refetch: fetchServiceFees,
  };
};