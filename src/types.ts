/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TaskGroup {
  id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  color: string; // Tailwind color class or hex
  icon_name: string; // Lucide icon name
  created_at?: string;
}

export interface Project {
  id: string;
  group_id: string; // links to TaskGroup
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  logo_url: string; // representation of brand/selection index or logo emoji/icon
  status: 'planning' | 'in-progress' | 'completed';
  created_at?: string;
}

export interface Task {
  id: string;
  project_id: string; // links to Project
  title: string;
  time: string; // e.g., '10:00 AM'
  status: 'to-do' | 'in-progress' | 'done';
  tag: string; // e.g., 'Market Research'
  priority?: 'high' | 'medium' | 'low';
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
