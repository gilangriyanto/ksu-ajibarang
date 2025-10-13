import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Bell, User, Settings, LogOut, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const routeLabels: Record<string, string> = {
  '/member': 'Dashboard',
  '/member/loans': 'Pinjaman',
  '/member/savings': 'Simpanan',
  '/member/profile': 'Profile',
  '/manager': 'Dashboard',
  '/manager/members': 'Manajemen Anggota',
  '/manager/loans': 'Manajemen Pinjaman',
  '/manager/payment-monitoring': 'Monitoring Pembayaran',
  '/manager/savings': 'Manajemen Simpanan',
  '/manager/accounting': 'Akuntansi',
  '/manager/accounting/coa': 'Chart of Accounts',
  '/manager/accounting/journal-entries': 'Jurnal Entries',
  '/manager/accounting/manual-journal': 'Input Jurnal Manual',
  '/manager/accounting/reports': 'Laporan Keuangan',
  '/manager/assets': 'Manajemen Aset',
  '/manager/users': 'Manajemen Pengguna',
  '/manager/settings': 'Settings',
};

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const label = routeLabels[currentPath] || segments[i];
    
    breadcrumbs.push({
      label,
      path: currentPath,
      isLast: i === segments.length - 1,
    });
  }
  
  return breadcrumbs;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu + Breadcrumbs */}
        <div className="flex items-center space-x-4">
          {/* Hamburger menu for mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="font-medium">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.path} className="text-gray-600 hover:text-gray-900">
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!crumb.isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right side - Notifications + User menu */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}