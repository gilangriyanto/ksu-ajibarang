import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Building2,
  Users,
  CreditCard,
  PiggyBank,
  BarChart3,
  Settings,
  Bell,
  Menu,
  LogOut,
  User,
  Calculator,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Shield,
  Briefcase,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Safe function to get initials
  const getInitials = (name?: string) => {
    if (!name || typeof name !== "string") return "U";
    try {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    } catch (error) {
      return "U";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    if (user?.role === "manager") {
      return [
        { name: "Dashboard", href: "/manager", icon: BarChart3 },
        { name: "Anggota", href: "/manager/members", icon: Users },
        { name: "Pinjaman", href: "/manager/loans", icon: CreditCard },
        { name: "Simpanan", href: "/manager/savings", icon: PiggyBank },
        {
          name: "Monitoring Pembayaran",
          href: "/manager/payment-monitoring",
          icon: TrendingUp,
        },
        { name: "Aset", href: "/manager/assets", icon: Briefcase },
        {
          name: "Akuntansi",
          href: "/manager/accounting",
          icon: Calculator,
          children: [
            {
              name: "Bagan Akun",
              href: "/manager/accounting/coa",
              icon: FileText,
            },
            {
              name: "Jurnal Umum",
              href: "/manager/accounting/journal-entries",
              icon: FileText,
            },
            {
              name: "Jurnal Manual",
              href: "/manager/accounting/manual-journal",
              icon: FileText,
            },
            {
              name: "Periode Akuntansi",
              href: "/manager/accounting/periods",
              icon: Calendar,
            },
            {
              name: "Neraca",
              href: "/manager/accounting/balance-sheet",
              icon: BarChart3,
            },
            {
              name: "Laba Rugi",
              href: "/manager/accounting/income-statement",
              icon: TrendingUp,
            },
            {
              name: "Arus Kas",
              href: "/manager/accounting/cash-flow",
              icon: DollarSign,
            },
            {
              name: "Neraca Saldo",
              href: "/manager/accounting/trial-balance",
              icon: Calculator,
            },
            {
              name: "Laporan Keuangan",
              href: "/manager/accounting/reports",
              icon: FileText,
            },
          ],
        },
        { name: "User Management", href: "/manager/users", icon: Shield },
        { name: "Notifikasi", href: "/manager/notifications", icon: Bell },
        { name: "Pengaturan", href: "/manager/settings", icon: Settings },
      ];
    } else {
      return [
        { name: "Dashboard", href: "/member", icon: BarChart3 },
        { name: "Pinjaman Saya", href: "/member/loans", icon: CreditCard },
        { name: "Simpanan Saya", href: "/member/savings", icon: PiggyBank },
        { name: "Profil", href: "/member/profile", icon: User },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href: string, children?: NavigationItem[]) => {
    if (children) {
      return children.some((child) => location.pathname === child.href);
    }
    return location.pathname === href;
  };

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-3 p-6 border-b">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="font-bold text-lg">Koperasi RS</h1>
          <p className="text-sm text-gray-500">
            {user?.role === "manager" ? "Manager Panel" : "Member Panel"}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <div>
                  <div
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActiveLink(item.href, item.children)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <ul className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link
                          to={child.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${
                            location.pathname === child.href
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <child.icon className="h-4 w-4" />
                          <span>{child.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActiveLink(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <NavigationContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <NavigationContent />
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
