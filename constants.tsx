
import { 
  Timer, 
  Hourglass, 
  Activity, 
  Clock, 
  Bell, 
  Watch
} from 'lucide-react';
import { ToolConfig } from './types';

export const TOOLS: ToolConfig[] = [
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    description: 'Measure elapsed time with precision',
    path: '/stopwatch',
    icon: Watch,
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-600',
  },
  {
    id: 'countdown',
    name: 'Countdown',
    description: 'Count down to any time you set',
    path: '/countdown',
    icon: Timer,
    color: 'green',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-500',
  },
  {
    id: 'laptimer',
    name: 'Lap Timer',
    description: 'Track splits and lap times',
    path: '/laptimer',
    icon: Hourglass,
    color: 'purple',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-600',
  },
  {
    id: 'interval',
    name: 'Interval Timer',
    description: 'HIIT and workout intervals',
    path: '/interval',
    icon: Activity,
    color: 'orange',
    bgColor: 'bg-orange-50',
    iconBg: 'bg-orange-500',
  },
  {
    id: 'clock',
    name: 'Digital Clock',
    description: 'Current local time and date',
    path: '/clock',
    icon: Clock,
    color: 'slate',
    bgColor: 'bg-slate-100',
    iconBg: 'bg-slate-600',
  },
  {
    id: 'alarm',
    name: 'Alarm Clock',
    description: 'Set simple browser-based alarms',
    path: '/alarm',
    icon: Bell,
    color: 'red',
    bgColor: 'bg-red-50',
    iconBg: 'bg-red-500',
  },
];
