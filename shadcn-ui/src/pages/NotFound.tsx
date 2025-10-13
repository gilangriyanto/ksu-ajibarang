import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-gray-400 mb-4">404</div>
          <CardTitle>Halaman Tidak Ditemukan</CardTitle>
          <CardDescription>
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Beranda
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}