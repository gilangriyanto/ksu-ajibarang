import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function IncomeStatement() {
  return (
    <Layout>
      <div className="space-y-6">
        <BackButton to="/manager" />
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laba Rugi</h1>
          <p className="text-gray-600">Laporan laba rugi koperasi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Laba Rugi</span>
            </CardTitle>
            <CardDescription>
              Fitur laba rugi akan segera tersedia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Halaman laba rugi dalam pengembangan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}