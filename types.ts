import { LucideIcon } from 'lucide-react';

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color: string; // Tailwind class for text/bg base (e.g., "blue")
  bgColor: string; // Specific hex or class for the card background
  iconBg: string; // Specific class for icon background
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}