
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Bot, FileText, Newspaper, BarChart2, Settings, Scan, Wallet, Columns3, GraduationCap, Microscope, Database, Tornado } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/d-score-detailed', label: 'D-Score Detailed', icon: Columns3 },
  { href: '/market-detailed', label: 'Market Detailed', icon: Microscope },
  { href: '/bots', label: 'Bots', icon: Bot },
  { href: '/autobot', label: 'Auto Bot', icon: Scan },
  { href: '/learning', label: 'Learning', icon: GraduationCap },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/analytics', label: 'Statistics', icon: BarChart2 },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/db-inspector', label: 'DB Inspector', icon: Database },
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
