import { Home, Users, Wallet, FileText, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

export const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/borrowers', icon: Users, label: 'Borrowers' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];
