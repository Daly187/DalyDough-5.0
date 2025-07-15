"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Bot, FileText, Newspaper, BarChart2, Settings, Scan, Wallet, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bots', label: 'Bots', icon: Bot },
  { href: '/autobot', label: 'Auto Bot', icon: Scan },
  { href: '/strength', label: 'Strength Index', icon: TrendingUp },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/analytics', label: 'Statistics', icon: BarChart2 },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={{ children: item.label }}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
