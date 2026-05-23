/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  initSupabase, getSupabase 
} from './lib/supabase';
import { SupabaseConfig, Task, Project, TaskGroup } from './types';
import PhoneEmulator from './components/PhoneEmulator';
import DevToolsConsole from './components/DevToolsConsole';
import { 
  Sparkles, Terminal, HelpCircle, Smartphone, Laptop, Database, Globe, 
  Layers, Users, Plus, Check, Play, ChevronRight, Zap, Target, Settings, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Global Supabase and Developer State Management
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    isConnected: false
  });

  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'dashboard' | 'calendar' | 'project' | 'groups'>('onboarding');

  // Shared statistics for Bento widgets
  const [liveGroups, setLiveGroups] = useState<TaskGroup[]>([]);
  const [liveProjects, setLiveProjects] = useState<Project[]>([]);
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);

  // Form states for Quick Bento Task input
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  // Load custom Supabase credentials from LocalStorage if they have been entered before
  useEffect(() => {
    const savedUrl = localStorage.getItem('gracegate_supabase_url');
    const savedKey = localStorage.getItem('gracegate_supabase_key');
    
    if (savedUrl && savedKey) {
      const client = initSupabase(savedUrl, savedKey);
      setSupabaseConfig({
        url: savedUrl,
        anonKey: savedKey,
        isConnected: client !== null
      });
      addLog(`Re-established saved Supabase endpoint connection: ${savedUrl}`);
    } else {
      addLog("Local developer storage initialized. Direct offline LocalStorage DB in-play.");
    }
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSyncLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // Called whenever PhoneEmulator changes tasks, projects or groups
  const handleDataChange = (groups: TaskGroup[], projects: Project[], tasks: Task[]) => {
    setLiveGroups(groups);
    setLiveProjects(projects);
    setLiveTasks(tasks);
  };

  // Callback when user updates Supabase configurations
  const handleConfigChange = (url: string, anonKey: string) => {
    if (!url || !anonKey) {
      localStorage.removeItem('gracegate_supabase_url');
      localStorage.removeItem('gracegate_supabase_key');
      setSupabaseConfig({ url: '', anonKey: '', isConnected: false });
      initSupabase('', ''); // remove active client
      addLog("Database credentials cleared. Returned to local emulator storage engine.");
      return;
    }

    const client = initSupabase(url, anonKey);
    const isConn = client !== null;
    
    setSupabaseConfig({
      url,
      anonKey,
      isConnected: isConn
    });

    if (isConn) {
      localStorage.setItem('gracegate_supabase_url', url);
      localStorage.setItem('gracegate_supabase_key', anonKey);
      addLog(`Successfully initialized Supabase Client. Listening for real-time changes...`);
      addLog(`Database connected: [${url}]`);
    } else {
      addLog("Error: Could not establish connection. Invalid credentials URL structure.");
    }
  };

  // Dispatch live task inside Mobile Emulator
  const handleQuickBentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    // Dispatch custom event to PhoneEmulator
    window.dispatchEvent(new CustomEvent('gg_add_quick_task', { 
      detail: quickTaskTitle.trim() 
    }));
    
    setQuickTaskTitle('');
  };

  // Trigger preset task injection
  const triggerPresetTask = (title: string) => {
    window.dispatchEvent(new CustomEvent('gg_add_quick_task', { 
      detail: title 
    }));
  };

  // Calculate live sprint statistics for the Analytics Bento card
  const totalTasksCount = liveTasks.length;
  const completedTasksCount = liveTasks.filter(t => t.status === 'done').length;
  const inProgressTasksCount = liveTasks.filter(t => t.status === 'in-progress').length;
  const pendingTasksCount = liveTasks.filter(t => t.status === 'to-do').length;
  const sprintProgressPercent = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 78;

  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070214] text-purple-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-purple-600 selection:text-white" id="root-app">
      
      {/* Decorative ambient blurred backing gradients to enhance high-end mobile prototype simulation */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8s]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-fuchsia-900/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse duration-[12s]"></div>

      {/* 1. Sleek minimal responsive header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-purple-950/40 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/10 hover:scale-105 duration-200 cursor-pointer">
            <span className="font-black text-white text-xs tracking-tight">GG</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase font-display">
              GraceGate Task Management
            </h1>
            <p className="text-[10px] text-purple-400">
              Sponsored by GraceGate &amp; Powered by GraceGate Technologies
            </p>
          </div>
        </div>

        {/* Database Status Button / Settings Trigger */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setIsConsoleOpen(true)}
            className="bg-[#130b2d] hover:bg-[#1a0f3d] border border-purple-800/40 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-inner text-xs cursor-pointer transition active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${supabaseConfig.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${supabaseConfig.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[10px] font-semibold text-purple-300 tracking-wider">
              {supabaseConfig.isConnected ? 'DATABASE SYNCED' : 'LOCAL OFFLINE'}
            </span>
          </button>
        </div>
      </header>

      {/* 2. Main Center Hero Stage: High-Fidelity Simulator Display */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center p-2 sm:p-4 z-10" id="workspace-container">
        <div className="relative scale-95 md:scale-100 transition-all duration-300">
          <PhoneEmulator 
            onLogAdded={addLog}
            onScreenChange={setCurrentScreen}
            activeScreen={currentScreen}
            onDataChange={handleDataChange}
          />
        </div>
      </main>

      {/* 3. Sliding Panel for Database Configuration parameters & Sync console logs */}
      <AnimatePresence>
        {isConsoleOpen && (
          <>
            {/* Backdrop shadow mask overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConsoleOpen(false)}
              className="fixed inset-0 bg-[#020107] z-40 cursor-pointer"
            />
            {/* Beautiful config drawer sidebar on the right */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#11092b] border-l border-purple-800/40 shadow-2xl z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
                  <div>
                    <h3 className="text-white font-bold text-base">Database connection</h3>
                    <p className="text-purple-400 text-[10px] uppercase tracking-wider mt-0.5">Custom credentials configuration</p>
                  </div>
                  <button 
                    onClick={() => setIsConsoleOpen(false)}
                    className="p-1.5 rounded-lg bg-purple-950/80 text-purple-400 hover:text-white hover:bg-purple-900 cursor-pointer transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* DB Sync details */}
                <div className="bg-[#180e3c] border border-purple-800/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Database className="w-4.5 h-4.5 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Sync Specifications</span>
                  </div>
                  <p className="text-[11px] text-purple-300 leading-relaxed">
                    This offline-first Flutter clone lets you bind a real Supabase backend table structure manually! Check the schema layout and logs inside this config widget to synchronize live changes instantly.
                  </p>
                  <div className="pt-2 flex justify-between gap-2.5 text-center text-[10px] uppercase font-mono tracking-wider">
                    <div className="bg-[#11092b]/50 p-2 rounded-xl flex-1 border border-purple-900/30">
                      <span className="text-emerald-400 font-bold block">{completedTasksCount}</span>
                      <span className="text-purple-400/60 block text-[8px] mt-0.5">COMPLETED</span>
                    </div>
                    <div className="bg-[#11092b]/50 p-2 rounded-xl flex-1 border border-purple-900/30">
                      <span className="text-amber-400 font-bold block">{inProgressTasksCount}</span>
                      <span className="text-purple-400/60 block text-[8px] mt-0.5">IN PROGRESS</span>
                    </div>
                    <div className="bg-[#11092b]/50 p-2 rounded-xl flex-1 border border-purple-900/30">
                      <span className="text-purple-300 font-bold block">{totalTasksCount}</span>
                      <span className="text-purple-400/60 block text-[8px] mt-0.5">TOTAL ITEMS</span>
                    </div>
                  </div>
                </div>

                {/* Insert standard devtools console widget within scroll block wrapping credentials and logs */}
                <div className="flex-1 flex flex-col min-h-[380px]">
                  <DevToolsConsole 
                    supabaseConfig={supabaseConfig}
                    onConfigChange={handleConfigChange}
                    syncLogs={syncLogs}
                    currentScreen={currentScreen}
                  />
                </div>
              </div>

              <div className="border-t border-purple-900/40 pt-4 mt-4 text-[10px] text-purple-500 font-mono text-center">
                GraceGate Technologies &bull; Prototype Controller v2.6
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Elegant Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-purple-950/40 text-[10px] text-purple-500 font-mono z-20 shrink-0 gap-2">
        <span className="flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          MOBILE PLATFORM &bull; REALTIME SYNC CAPABLE
        </span>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setIsConsoleOpen(true)}
            className="hover:text-purple-300 transition flex items-center gap-1 font-mono uppercase cursor-pointer"
          >
            <Settings className="w-3 h-3 text-purple-400" />
            Database Setup / Logs
          </button>
          <span>&copy; GraceGate Technologies</span>
        </div>
      </footer>

    </div>
  );
}
