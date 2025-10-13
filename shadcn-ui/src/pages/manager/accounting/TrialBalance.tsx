import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export default function TrialBalance() {
  return (
    <Layout>
      <div className="space-y-6">
        <BackButton to="/manager" />
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neraca Saldo</h1>
          <p className="text-gray-600">Laporan neraca saldo koperasi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5" />
              <span>Neraca Saldo</span>
            </CardTitle>
            <CardDescription>
              Fitur neraca saldo akan segera tersedia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Halaman neraca saldo dalam pengembangan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}