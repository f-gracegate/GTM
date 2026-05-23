/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TaskGroup, Project, Task } from '../types';

let supabaseInstance: SupabaseClient | null = null;

// Initialize Supabase. Returns null if parameters are not provided.
export function initSupabase(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey || url === 'MY_SUPABASE_URL' || anonKey === 'MY_SUPABASE_ANON_KEY') {
    supabaseInstance = null;
    return null;
  }
  try {
    // Sanitize URL
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();
    supabaseInstance = createClient(cleanUrl, cleanKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabaseInstance = null;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

// Seed mock data for storage when Supabase is not connected
export const SEED_TASK_GROUPS: TaskGroup[] = [
  { id: 'g1', name: 'Office Project', total_tasks: 25, completed_tasks: 18, color: 'bg-purple-100 text-purple-600 border-purple-200', icon_name: 'Briefcase' },
  { id: 'g2', name: 'Personal Project', total_tasks: 30, completed_tasks: 15, color: 'bg-pink-100 text-pink-600 border-pink-200', icon_name: 'User' },
  { id: 'g3', name: 'Daily Study', total_tasks: 30, completed_tasks: 26, color: 'bg-amber-100 text-amber-600 border-amber-200', icon_name: 'BookOpen' }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'p1',
    group_id: 'g1',
    name: 'Grocery shopping app design',
    description: 'This application is designed for super shops. By using this application they can enlist all their products in one place and can deliver. Customers will get a one-stop solution for their daily shopping.',
    start_date: '2026-05-01',
    end_date: '2026-06-30',
    logo_url: '🛒 Grocery shop',
    status: 'in-progress'
  },
  {
    id: 'p2',
    group_id: 'g2',
    name: 'Uber Eats redesign challenge',
    description: 'A UI redesign attempt for Uber Eats modern checkouts, tracking widgets, and visual identity overhauls matching 2026 standards.',
    start_date: '2026-05-15',
    end_date: '2026-07-15',
    logo_url: '🍔 Food Delivery',
    status: 'in-progress'
  }
];

export const SEED_TASKS: Task[] = [
  { id: 't1', project_id: 'p1', title: 'Market Research', time: '10:00 AM', status: 'done', tag: 'Grocery shopping app design', priority: 'high', created_at: '2026-05-23T06:00:00Z' },
  { id: 't2', project_id: 'p1', title: 'Competitive Analysis', time: '12:00 PM', status: 'in-progress', tag: 'Grocery shopping app design', priority: 'medium', created_at: '2026-05-23T07:00:00Z' },
  { id: 't3', project_id: 'p2', title: 'Create Low-fidelity Wireframe', time: '07:00 PM', status: 'to-do', tag: 'Uber Eats redesign challenge', priority: 'high', created_at: '2026-05-23T08:00:00Z' },
  { id: 't4', project_id: 'p1', title: 'How to pitch a Design Sprint', time: '09:00 PM', status: 'to-do', tag: 'About design sprint', priority: 'low', created_at: '2026-05-23T09:00:00Z' }
];

// Helper to copy / query database tables in Supabase:
export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor to bootstrap your database:

-- 1. Create task_groups table
CREATE TABLE IF NOT EXISTS task_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  color TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT REFERENCES task_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'in-progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time TEXT,
  status TEXT DEFAULT 'to-do',
  tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) or disable as needed for direct preview:
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (optional for simple demonstrations)
CREATE POLICY "Allow public select" ON task_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON task_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON task_groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON task_groups FOR DELETE USING (true);

CREATE POLICY "Allow public select" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON projects FOR DELETE USING (true);

CREATE POLICY "Allow public select" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON tasks FOR DELETE USING (true);

-- Insert sample initial seeds:
INSERT INTO task_groups (id, name, total_tasks, completed_tasks, color, icon_name) VALUES
('g1', 'Office Project', 25, 18, 'bg-purple-100 text-purple-600 border-purple-200', 'Briefcase'),
('g2', 'Personal Project', 30, 15, 'bg-pink-100 text-pink-600 border-pink-200', 'User'),
('g3', 'Daily Study', 30, 26, 'bg-amber-100 text-amber-600 border-amber-200', 'BookOpen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, group_id, name, description, start_date, end_date, logo_url, status) VALUES
('p1', 'g1', 'Grocery shopping app design', 'This application is designed for super shops. By using this application they can enlist all their products in one place and can deliver.', '2026-05-01', '2026-06-30', '🛒 Grocery shop', 'in-progress'),
('p2', 'g2', 'Uber Eats redesign challenge', 'A UI redesign attempt for Uber Eats modern checkouts, tracking widgets, and visual identity overhauls matching 2026 standards.', '2026-05-15', '2026-07-15', '🍔 Food Delivery', 'in-progress')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, project_id, title, time, status, tag) VALUES
('t1', 'p1', 'Market Research', '10:00 AM', 'done', 'Grocery shopping app design'),
('t2', 'p1', 'Competitive Analysis', '12:00 PM', 'in-progress', 'Grocery shopping app design'),
('t3', 'p2', 'Create Low-fidelity Wireframe', '07:00 PM', 'to-do', 'Uber Eats redesign challenge'),
('t4', 'p1', 'How to pitch a Design Sprint', '09:00 PM', 'to-do', 'About design sprint')
ON CONFLICT (id) DO NOTHING;
`;
