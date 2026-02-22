import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  CreditCard,
  PiggyBank,
  BarChart3,
  Calculator,
  Building,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
  Edit,
  Calendar,
  TrendingUp,
  DollarSign,
  CheckSquare,
  Wallet, // ✅ NEW for Manajemen Kas
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const memberNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/member",
    icon: Home,
  },
  {
    title: "Pinjaman",
    icon: CreditCard,
    children: [
      { title: "Overview", href: "/member/loans", icon: CreditCard },
      {
        title: "Pengajuan Baru",
        href: "/member/loan-application",
        icon: FileText,
      },
      { title: "Riwayat", href: "/member/loan-history", icon: BookOpen },
    ],
  },
  {
    title: "Simpanan",
    icon: PiggyBank,
    children: [
      { title: "Overview", href: "/member/savings", icon: PiggyBank },
      { title: "Setoran", href: "/member/savings-deposit", icon: TrendingUp },
    ],
  },
  {
    title: "Profile",
    href: "/member/profile",
    icon: Users,
  },
];

const managerNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/manager",
    icon: Home,
  },
  {
    title: "Manajemen Anggota",
    href: "/manager/members",
    icon: Users,
  },
  // ✅ NEW: Manajemen Kas Menu
  {
    title: "Manajemen Kas",
    icon: Wallet,
    children: [
      { 
        title: "Daftar Kas", 
        href: "/manager/kas", 
        icon: Wallet 
      },
      { 
        title: "Pengelola Kas", 
        href: "/manager/cash-managers", 
        icon: Users 
      },
    ],
  },
  {
    title: "Manajemen Pinjaman",
    href: "/manager/loans",
    icon: CreditCard,
  },
  {
    title: "Monitoring Pembayaran",
    href: "/manager/payment-monitoring",
    icon: BarChart3,
  },
  {
    title: "Manajemen Simpanan",
    href: "/manager/savings",
    icon: PiggyBank,
  },
  {
    title: "Akuntansi",
    icon: Calculator,
    children: [
      {
        title: "Chart of Accounts",
        href: "/manager/accounting/coa",
        icon: BookOpen,
      },
      {
        title: "Jurnal Entries",
        href: "/manager/accounting/journal-entries",
        icon: FileText,
      },
      {
        title: "Input Jurnal Manual",
        href: "/manager/accounting/manual-journal",
        icon: Edit,
      },
      {
        title: "Manajemen Periode",
        href: "/manager/accounting/periods",
        icon: Calendar,
      },
      {
        title: "Laporan Keuangan",
        href: "/manager/accounting/reports",
        icon: BarChart3,
      },
      {
        title: "Neraca",
        href: "/manager/accounting/balance-sheet",
        icon: Building,
      },
      {
        title: "Laba Rugi",
        href: "/manager/accounting/income-statement",
        icon: TrendingUp,
      },
      {
        title: "Arus Kas",
        href: "/manager/accounting/cash-flow",
        icon: DollarSign,
      },
      {
        title: "Neraca Saldo",
        href: "/manager/accounting/trial-balance",
        icon: CheckSquare,
      },
    ],
  },
  {
    title: "Manajemen Aset",
    href: "/manager/assets",
    icon: Building,
  },
  {
    title: "Manajemen Pengguna",
    href: "/manager/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/manager/settings",
    icon: Settings,
  },
];

function NavItemComponent({
  item,
  level = 0,
}: {
  item: NavItem;
  level?: number;
}) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? location.pathname === item.href : false;
  const hasActiveChild =
    hasChildren &&
    item.children?.some((child) => location.pathname === child.href);

  React.useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const itemClasses = cn(
    "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
    level === 0
      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50",
    isActive && "bg-blue-100 text-blue-700",
    hasActiveChild && "text-blue-700"
  );

  const IconComponent = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button onClick={handleClick} className={itemClasses}>
          <div className="flex items-center">
            <IconComponent
              className={cn("mr-3 h-4 w-4", level > 0 && "h-3 w-3")}
            />
            {item.title}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map((child, index) => (
              <NavItemComponent key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link to={item.href!} className={itemClasses}>
      <div className="flex items-center">
        <IconComponent className={cn("mr-3 h-4 w-4", level > 0 && "h-3 w-3")} />
        {item.title}
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuth();

  const navigation =
    user?.role === "anggota" ? memberNavigation : managerNavigation;

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navigation.map((item, index) => (
        <NavItemComponent key={index} item={item} />
      ))}
    </nav>
  );
}