import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function Periods() {
  return (
    <Layout>
      <div className="space-y-6">
        <BackButton to="/manager" />
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Periode</h1>
          <p className="text-gray-600">Kelola periode akuntansi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Manajemen Periode</span>
            </CardTitle>
            <CardDescription>
              Fitur manajemen periode akan segera tersedia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Halaman manajemen periode dalam pengembangan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}