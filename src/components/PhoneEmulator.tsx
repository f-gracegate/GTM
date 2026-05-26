/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, BookOpen, Bell, Plus, Folder, Calendar, ChevronLeft, 
  Trash2, Clock, ArrowRight, CheckCircle2, Circle, Settings, LayoutGrid, Check, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaskGroup, Project, Task } from '../types';
import { 
  SEED_TASK_GROUPS, 
  SEED_PROJECTS, 
  SEED_TASKS, 
  getSupabase 
} from '../lib/supabase';

interface PhoneEmulatorProps {
  onLogAdded: (msg: string) => void;
  onScreenChange: (screen: 'onboarding' | 'dashboard' | 'calendar' | 'project' | 'groups' | 'settings') => void;
  activeScreen: 'onboarding' | 'dashboard' | 'calendar' | 'project' | 'groups' | 'settings';
  onDataChange?: (groups: TaskGroup[], projects: Project[], tasks: Task[]) => void;
}

export default function PhoneEmulator({ onLogAdded, onScreenChange, activeScreen, onDataChange }: PhoneEmulatorProps) {
  // State for mobile interface
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Dark mode appearance state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on boot
  useEffect(() => {
    const savedTheme = localStorage.getItem('gracegate_dark_mode');
    if (savedTheme === 'true') {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    localStorage.setItem('gracegate_dark_mode', String(nextVal));
    onLogAdded(`Theme settings: switched interface appearance to ${nextVal ? 'DARK THEME' : 'LIGHT THEME'}.`);
  };

  // Helper theme styles mapping
  const t = {
    bg: isDarkMode ? 'bg-[#0c0520]' : 'bg-[#FAF9FF]',
    panelBg: isDarkMode ? 'bg-[#0f0724]' : 'bg-[#FAF9FF]',
    cardBg: isDarkMode ? 'bg-[#180e3c] border-purple-950/40' : 'bg-white border-purple-100',
    navBg: isDarkMode ? 'bg-[#12092e] border-purple-950/40' : 'bg-white border-purple-100/80',
    titleText: isDarkMode ? 'text-white' : 'text-[#1a0f3d]',
    primaryText: isDarkMode ? 'text-purple-100' : 'text-neutral-800',
    neutralText: isDarkMode ? 'text-purple-200/90' : 'text-neutral-700',
    subtitleText: isDarkMode ? 'text-purple-400/70' : 'text-neutral-400',
    inputBg: isDarkMode ? 'bg-[#1a0e3f] border-[#291b5c] text-white placeholder-purple-300/40' : 'bg-white border-purple-100 text-neutral-800',
    navHover: isDarkMode ? 'hover:bg-[#1a0e3f]' : 'hover:bg-purple-50',
    dateBtnInactive: isDarkMode ? 'bg-[#150a36] text-purple-200 border-[#251752] hover:border-purple-800' : 'bg-white text-neutral-700 border-purple-100 hover:border-purple-300',
    logoBtnInactive: isDarkMode ? 'bg-[#150a36] text-purple-200 border-[#251752] hover:border-purple-800' : 'bg-white text-neutral-600 border-purple-100 hover:border-purple-200',
  };

  // App UI contexts
  const [selectedDay, setSelectedDay] = useState(25); // 25 is default
  const [taskFilter, setTaskFilter] = useState<'All' | 'To do' | 'In Progress' | 'Completed'>('All');
  const [taskSort, setTaskSort] = useState<'Due Soon' | 'Highest Priority' | 'Recent'>('Recent');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showSyncSuccessOverlay, setShowSyncSuccessOverlay] = useState(false);

  // Form states for new task creation inside the modal
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoTime, setNewTodoTime] = useState('12:00 PM');
  const [newTodoProject, setNewTodoProject] = useState('');
  const [newTodoTag, setNewTodoTag] = useState('Market Research');
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Form states for new project screen
  const [selectedFormGroup, setSelectedFormGroup] = useState('g1');
  const [formProjName, setFormProjName] = useState('');
  const [formProjDesc, setFormProjDesc] = useState('');
  const [formStartDate, setFormStartDate] = useState('01 May, 2026');
  const [formEndDate, setFormEndDate] = useState('30 June, 2026');
  const [formLogo, setFormLogo] = useState('🛒 Grocery shop');

  // User details
  const userName = "Livia Vaccaro";

  // Load Initial Datasets (Local Storage with Seeding as fallback)
  useEffect(() => {
    const localGroups = localStorage.getItem('gracegate_task_groups');
    const localProjects = localStorage.getItem('gracegate_projects');
    const localTasks = localStorage.getItem('gracegate_tasks');

    let g = SEED_TASK_GROUPS;
    let p = SEED_PROJECTS;
    let t = SEED_TASKS;

    if (localGroups && localProjects && localTasks) {
      g = JSON.parse(localGroups);
      p = JSON.parse(localProjects);
      t = JSON.parse(localTasks);
      setTaskGroups(g);
      setProjects(p);
      setTasks(t);
      onLogAdded("Loaded offline dataset cache from LocalStorage successfully.");
    } else {
      setTaskGroups(SEED_TASK_GROUPS);
      setProjects(SEED_PROJECTS);
      setTasks(SEED_TASKS);
      
      localStorage.setItem('gracegate_task_groups', JSON.stringify(SEED_TASK_GROUPS));
      localStorage.setItem('gracegate_projects', JSON.stringify(SEED_PROJECTS));
      localStorage.setItem('gracegate_tasks', JSON.stringify(SEED_TASKS));
      onLogAdded("First-time boot. Sample database successfully seeded.");
    }

    if (onDataChange) {
      onDataChange(g, p, t);
    }
  }, []);

  // Listen for quick actions from the desktop Bento Grid
  useEffect(() => {
    const handleQuickTask = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (!customEvent.detail || !customEvent.detail.trim()) return;
      
      const title = customEvent.detail.trim();
      const defaultProj = projects[0]?.id || 'p1';
      const defaultProjName = projects[0]?.name || 'Grocery shopping app design';
      
      const newTaskId = `t${Date.now()}`;
      const newTodo: Task = {
        id: newTaskId,
        project_id: defaultProj,
        title,
        time: '01:00 PM',
        status: 'to-do',
        tag: defaultProjName
      };
      
      const updatedTasks = [...tasks, newTodo];
      
      // Update task groups count limit check
      const updatedGroups = taskGroups.map(g => {
        if (g.id === 'g1') { // Default to Office group
          return { ...g, total_tasks: g.total_tasks + 1 };
        }
        return g;
      });

      persistData(updatedGroups, projects, updatedTasks);
      pushToSupabaseIfNeeded(`Quick Task: ${title}`, updatedGroups, projects, updatedTasks);
      onLogAdded(`[Bento Terminal] Quick entry registered task object: "${title}"`);
    };

    window.addEventListener('gg_add_quick_task', handleQuickTask);
    return () => {
      window.removeEventListener('gg_add_quick_task', handleQuickTask);
    };
  }, [tasks, projects, taskGroups]);

  // Save current runtime states to LocalStorage
  const persistData = (updatedGroups: TaskGroup[], updatedProjects: Project[], updatedTasks: Task[]) => {
    setTaskGroups(updatedGroups);
    setProjects(updatedProjects);
    setTasks(updatedTasks);

    localStorage.setItem('gracegate_task_groups', JSON.stringify(updatedGroups));
    localStorage.setItem('gracegate_projects', JSON.stringify(updatedProjects));
    localStorage.setItem('gracegate_tasks', JSON.stringify(updatedTasks));

    if (onDataChange) {
      onDataChange(updatedGroups, updatedProjects, updatedTasks);
    }
  };

  // Sync with Supabase if connected
  const pushToSupabaseIfNeeded = async (
    actionName: string, 
    localGroups: TaskGroup[], 
    localProjects: Project[], 
    localTasks: Task[]
  ) => {
    const supabase = getSupabase();
    if (!supabase) {
      onLogAdded(`[Sync] Local write ok: ${actionName}. (No active Supabase configuration)`);
      return;
    }

    onLogAdded(`[Supabase Remote] Client identified. Starting synchronization for: ${actionName}...`);
    try {
      // 1. Sync groups
      onLogAdded("[Supabase Remote] Merging task_groups...");
      for (const group of localGroups) {
        const { error } = await supabase.from('task_groups').upsert({
          id: group.id,
          name: group.name,
          total_tasks: group.total_tasks,
          completed_tasks: group.completed_tasks,
          color: group.color,
          icon_name: group.icon_name
        });
        if (error) throw error;
      }

      // 2. Sync projects
      onLogAdded("[Supabase Remote] Merging projects schema...");
      for (const proj of localProjects) {
        const { error } = await supabase.from('projects').upsert({
          id: proj.id,
          group_id: proj.group_id,
          name: proj.name,
          description: proj.description,
          start_date: proj.start_date,
          end_date: proj.end_date,
          logo_url: proj.logo_url,
          status: proj.status
        });
        if (error) throw error;
      }

      // 3. Sync tasks
      onLogAdded("[Supabase Remote] Merging checklist tasks...");
      for (const task of localTasks) {
        const { error } = await supabase.from('tasks').upsert({
          id: task.id,
          project_id: task.project_id,
          title: task.title,
          time: task.time,
          status: task.status,
          tag: task.tag
        });
        if (error) throw error;
      }

      onLogAdded(`[Supabase Remote] Success! Full transaction synchronized securely on GraceGate database cloud.`);
      setShowSyncSuccessOverlay(true);
      setTimeout(() => setShowSyncSuccessOverlay(false), 2400);
    } catch (err: any) {
      console.error(err);
      onLogAdded(`[Supabase Error] Synchronization failed: ${err?.message || 'Unknown network error'}`);
    }
  };

  // Checkbox interactions
  const toggleTaskStatus = (taskId: string) => {
    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask) return;

    let newStatus: 'to-do' | 'in-progress' | 'done' = 'done';
    if (oldTask.status === 'done') {
      newStatus = 'to-do';
    } else if (oldTask.status === 'to-do') {
      newStatus = 'in-progress';
    } else {
      newStatus = 'done';
    }

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    onLogAdded(`Task "${oldTask.title}" status changed to [${newStatus}]`);

    // Recalculate group stats
    const updatedGroups = taskGroups.map(g => {
      // Find files under this group
      const groupProjIds = projects.filter(p => p.group_id === g.id).map(p => p.id);
      const groupTasks = updatedTasks.filter(t => groupProjIds.includes(t.project_id));
      const groupCompleted = groupTasks.filter(t => t.status === 'done').length;

      // Make sure total tasks reflect real task quantities, or use seeded multipliers
      return {
        ...g,
        completed_tasks: groupCompleted,
        total_tasks: Math.max(g.total_tasks, groupTasks.length)
      };
    });

    persistData(updatedGroups, projects, updatedTasks);
    pushToSupabaseIfNeeded(`Toggle Task Status (${oldTask.title})`, updatedGroups, projects, updatedTasks);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask) return;

    const updatedTasks = tasks.filter(t => t.id !== taskId);
    onLogAdded(`Deleted task "${oldTask.title}"`);

    // Recalculate stats
    const updatedGroups = taskGroups.map(g => {
      const groupProjIds = projects.filter(p => p.group_id === g.id).map(p => p.id);
      const groupTasks = updatedTasks.filter(t => groupProjIds.includes(t.project_id));
      const groupCompleted = groupTasks.filter(t => t.status === 'done').length;
      return {
        ...g,
        completed_tasks: groupCompleted,
        total_tasks: Math.max(0, g.total_tasks - 1)
      };
    });

    persistData(updatedGroups, projects, updatedTasks);
    pushToSupabaseIfNeeded(`Delete Task (${oldTask.title})`, updatedGroups, projects, updatedTasks);
  };

  // Handle new project submission
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjName.trim()) return;

    const newProjectId = `p${Date.now()}`;
    const newProject: Project = {
      id: newProjectId,
      group_id: selectedFormGroup,
      name: formProjName.trim(),
      description: formProjDesc.trim(),
      start_date: formStartDate,
      end_date: formEndDate,
      logo_url: formLogo,
      status: 'in-progress'
    };

    const updatedProjects = [...projects, newProject];
    onLogAdded(`Created new Project: "${formProjName}" inside GroupId: ${selectedFormGroup}`);

    // Update group stats count
    const updatedGroups = taskGroups.map(g => {
      if (g.id === selectedFormGroup) {
        return { ...g, total_tasks: g.total_tasks + 1 };
      }
      return g;
    });

    // Reset Form Fields
    setFormProjName('');
    setFormProjDesc('');
    
    persistData(updatedGroups, updatedProjects, tasks);
    pushToSupabaseIfNeeded(`Add Project: ${newProject.name}`, updatedGroups, updatedProjects, tasks);
    onScreenChange('dashboard'); // Transition back to dashboard
  };

  // Handle new task submission in bottom sheet modal
  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    // Use current selected project or first project as default
    const projId = newTodoProject || (projects[0]?.id || 'p1');
    const selectedProjName = projects.find(p => p.id === projId)?.name || 'General Task';

    const newTaskId = `t${Date.now()}`;
    const newTodo: Task = {
      id: newTaskId,
      project_id: projId,
      title: newTodoTitle.trim(),
      time: newTodoTime,
      status: 'to-do',
      tag: selectedProjName,
      priority: newTodoPriority,
      created_at: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTodo];
    onLogAdded(`Created newly assigned Todo: "${newTodo.title}" slotted for: ${newTodo.time} with [${newTodoPriority}] priority`);

    // Recalculate group counts
    const updatedGroups = taskGroups.map(g => {
      const groupProjIds = projects.map(p => p.group_id === g.id ? p.id : '');
      const hasProj = projects.find(p => p.id === projId && p.group_id === g.id);
      if (hasProj) {
        return { ...g, total_tasks: g.total_tasks + 1 };
      }
      return g;
    });

    setNewTodoTitle('');
    setNewTodoPriority('medium');
    setShowAddTaskModal(false);

    persistData(updatedGroups, projects, updatedTasks);
    pushToSupabaseIfNeeded(`Create Task: ${newTodo.title}`, updatedGroups, projects, updatedTasks);
  };

  // Calculate generic circular completion % to show on banner:
  const totalActCount = tasks.length;
  const completedActCount = tasks.filter(t => t.status === 'done').length;
  const generalProgressValue = totalActCount > 0 ? Math.round((completedActCount / totalActCount) * 100) : 85;

  return (
    <div className="relative mx-auto flex items-center justify-center p-4 lg:p-10 select-none">
      
      {/* Dynamic Sync Success Overlay */}
      <AnimatePresence>
        {showSyncSuccessOverlay && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 z-50 bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-full flex items-center gap-2 shadow-2xl border border-emerald-400/30 text-xs tracking-wide cursor-pointer"
            onClick={() => setShowSyncSuccessOverlay(false)}
          >
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-100" />
            <span>Supabase Cloud Sync Successful</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern High-Fidelity Mobile Device Shell */}
      <div className="relative w-[390px] h-[820px] rounded-[52px] bg-[#0c051d] p-3.5 shadow-2xl shadow-purple-950/40 border border-purple-900/40 select-none ring-12 ring-purple-950/25">
        
        {/* Notch details */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-[26px] bg-[#0c051d] rounded-b-[18px] z-50 flex items-center justify-center">
          {/* Speaker grill */}
          <div className="w-12 h-1 bg-neutral-800 rounded-full mb-2"></div>
          {/* Camera lens */}
          <div className="w-2.5 h-2.5 bg-neutral-900 border border-purple-950 rounded-full absolute right-8 top-1"></div>
        </div>

        {/* Dynamic Mobile Status Bar info */}
        <div className="absolute top-[21px] left-9 right-9 z-40 flex items-center justify-between pointer-events-none text-white font-sans text-[11px] font-semibold opacity-90">
          <span>09:41 AM</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.17 19.58 10.53 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
            </svg>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 22h20V2z"/>
            </svg>
            {/* Battery */}
            <div className="w-5.5 h-2.5 border border-white/80 rounded-sm p-[1px] flex items-center">
              <div className="w-full h-full bg-white rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Screen inner content */}
        <div className={`w-full h-full rounded-[38px] overflow-hidden relative flex flex-col font-sans border shadow-inner ${isDarkMode ? 'bg-[#0f0724] border-[#251752]/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]' : 'bg-[#FAF9FF] border-purple-100'}`}>
          
          <AnimatePresence mode="wait">
            {/* ONBOARDING PANEL */}
            {activeScreen === 'onboarding' && (
              <motion.div 
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex-1 flex flex-col justify-between p-6 pt-16 pb-12 text-neutral-900 ${isDarkMode ? 'bg-gradient-to-b from-[#11092b] via-[#160d36] to-[#0c051d] text-white' : 'bg-gradient-to-b from-[#FAF9FF] via-[#F4F1FF] to-[#ECE7FE] text-neutral-900'}`}
              >
                {/* Branding Badge Floating */}
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] border font-extrabold px-3 py-1 rounded-full tracking-wider uppercase ${isDarkMode ? 'bg-purple-950/40 border-purple-800/40 text-purple-300' : 'bg-purple-100 border border-purple-200 text-purple-600'}`}>
                    Sponsored by GraceGate
                  </span>
                  <span className={`text-[8px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-purple-400/80' : 'text-purple-500'}`}>
                    Powered by GraceGate Technologies
                  </span>
                </div>

                {/* 3D Generated Illustration Image Placement */}
                <div className="flex-1 flex items-center justify-center p-2">
                  <motion.img 
                    initial={{ y: 20, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    src="/src/assets/images/onboarding_illustration_1779407938001.png" 
                    alt="Onboarding Illustration" 
                    className="max-h-[300px] object-contain drop-shadow-xl animate-soft-pulse rounded-2xl"
                  />
                </div>

                {/* Typography copy match characters exactly */}
                <div className="space-y-4 text-center px-2 mb-6">
                  <h1 className={`text-3xl font-extrabold tracking-tight leading-tight font-display ${t.titleText}`}>
                    GraceGate <br />
                    <span className="text-purple-600 font-black">Task Management</span>
                  </h1>
                  
                  {/* The exact requested subtitle with GraceGate powered reference keeping character spacing */}
                  <p className={`font-sans text-xs leading-relaxed max-w-sm mx-auto ${t.subtitleText}`}>
                    The premium high-fidelity mobile workspace designed for modern productivity. Sponsored by GraceGate &amp; Powered by GraceGate Technologies.
                  </p>
                </div>

                {/* Onboard Next-trigger lets-go purple CTA banner */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onScreenChange('dashboard');
                    onLogAdded("Welcome wizard completed. Switched workspace view to dashboard registry.");
                  }}
                  className="w-full bg-[#6a42f4] hover:bg-[#5b34e4] text-white font-bold h-13 px-6 rounded-2xl flex items-center justify-between shadow-lg shadow-purple-600/30 cursor-pointer group"
                >
                  <span className="text-sm font-semibold tracking-wide">Let's Start</span>
                  <div className="bg-white/20 p-2 rounded-lg group-hover:translate-x-1 transition-transform duration-200">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* DASHBOARD PANEL */}
            {activeScreen === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex-1 overflow-y-auto no-scrollbar pt-14 pb-18 flex flex-col ${t.panelBg}`}
              >
                {/* Header widget hello row */}
                <div className="px-6 flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-purple-200 border-2 border-purple-400 overflow-hidden shadow">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                        alt="Profile avatar User" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className={`text-[10px] block uppercase tracking-wider font-semibold ${t.subtitleText}`}>Hello!</span>
                      <h2 className={`text-base font-bold tracking-tight ${t.titleText}`}>{userName}</h2>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className={`p-2.5 rounded-full transition cursor-pointer shadow-xs ${isDarkMode ? 'bg-[#180e3c] border border-purple-800/20 text-purple-400 hover:bg-purple-950' : 'bg-white border border-purple-100 text-purple-600 hover:bg-purple-50'}`}>
                      <Bell className="w-4 h-4" />
                    </button>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full"></span>
                  </div>
                </div>

                {/* Status completion ring purple billboard */}
                <div className="px-6 mb-6">
                  <div className="bg-[#592be1] rounded-[24px] p-5 text-white flex items-center justify-between shadow-xl shadow-purple-900/15 relative overflow-hidden">
                    {/* Visual vector rings */}
                    <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/5 rounded-full"></div>
                    <div className="absolute right-4 -top-8 w-20 h-20 bg-white/5 rounded-full"></div>

                    <div className="space-y-3.5 z-10">
                      <p className="text-white font-semibold text-sm leading-snug">
                        Your today's task <br />
                        almost done!
                      </p>
                      
                      <button 
                        onClick={() => {
                          onScreenChange('calendar');
                          onLogAdded("Action View Task: transitioned directly to weekly checklist planner.");
                        }}
                        className="bg-white hover:bg-purple-100 text-[#592be1] text-xs font-bold py-1.5 px-4 rounded-xl cursor-pointer shadow-md transition"
                      >
                        View Task
                      </button>
                    </div>

                    {/* Progress indicator loop */}
                    <div className="relative flex items-center justify-center w-18 h-18 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="36" cy="36" r="30" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" />
                        <motion.circle 
                          cx="36" 
                          cy="36" 
                          r="30" 
                          stroke="white" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 30}
                          initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - generalProgressValue / 100) }}
                          transition={{ duration: 1 }}
                        />
                      </svg>
                      <span className="absolute text-xs font-black">{generalProgressValue}%</span>
                    </div>
                  </div>
                </div>

                {/* In Progress Horizontal Carousel */}
                <div className="mb-6">
                  <div className="px-6 flex items-center justify-between mb-3.5">
                    <h3 className={`text-sm font-black tracking-tight ${t.titleText}`}>In Progress</h3>
                    <span className={`text-[10px] font-extrabold uppercase ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>&bull; Active &bull;</span>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar scroll-smooth snap-x">
                    {projects.map(proj => {
                      const groupName = taskGroups.find(g => g.id === proj.group_id)?.name || 'General';
                      return (
                        <div 
                          key={proj.id}
                          className={`w-[200px] snap-start border rounded-2xl p-4 shrink-0 flex flex-col justify-between h-[120px] shadow-sm transition ${isDarkMode ? 'bg-[#150a36] border-purple-950/40 text-white hover:border-purple-800' : 'bg-[#eef0ff] border-purple-200/50 text-neutral-800 hover:border-purple-300'}`}
                        >
                          <div>
                            <span className={`text-[9px] uppercase tracking-wider font-extrabold block mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              {groupName}
                            </span>
                            <h4 className={`text-xs font-bold line-clamp-2 leading-snug ${t.primaryText}`}>
                              {proj.name}
                            </h4>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2.5">
                            <span className={`text-[10px] font-mono ${t.subtitleText}`}>
                              {proj.logo_url}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${isDarkMode ? 'bg-amber-950/40 text-amber-450 border border-amber-900/30' : 'bg-amber-100 text-amber-700'}`}>
                              In Progress
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Task Groups Verticals count list */}
                <div className="px-6 flex-1 flex flex-col">
                  <div className="px-6 flex items-center justify-between mb-3.5 pl-0 pr-0">
                    <h3 className={`text-sm font-black tracking-tight ${t.titleText}`}>Task Groups</h3>
                    <button 
                      onClick={() => onScreenChange('project')}
                      className={`text-xs font-bold hover:underline cursor-pointer ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                    >
                      + Add Project
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {taskGroups.map(group => {
                      const percentage = group.total_tasks > 0 ? Math.round((group.completed_tasks / group.total_tasks) * 100) : 0;
                      return (
                        <div 
                          key={group.id} 
                          className={`border rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition ${t.cardBg}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${group.color.split(' ')[0] || 'bg-purple-100'} ${group.color.split(' ')[1] || 'text-purple-600'}`}>
                              {group.icon_name === 'Briefcase' && <Briefcase className="w-4.5 h-4.5" />}
                              {group.icon_name === 'User' && <User className="w-4.5 h-4.5" />}
                              {group.icon_name === 'BookOpen' && <BookOpen className="w-4.5 h-4.5" />}
                            </div>
                            <div>
                              <h4 className={`text-xs font-bold ${t.titleText}`}>{group.name}</h4>
                              <p className={`text-[11px] font-medium ${t.subtitleText}`}>{group.total_tasks} Tasks</p>
                            </div>
                          </div>

                          {/* Percent complete status pill */}
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[10px] font-mono font-bold ${t.subtitleText}`}>{percentage}%</span>
                            <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-purple-950' : 'bg-neutral-100'}`}>
                              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* CALENDAR & DAILY TASKS CHECKLIST PANEL */}
            {activeScreen === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex-1 overflow-y-auto no-scrollbar pt-14 pb-18 flex flex-col ${t.panelBg}`}
              >
                {/* Back button and calendar title */}
                <div className="px-6 flex items-center justify-between mb-4.5">
                  <button 
                    onClick={() => onScreenChange('dashboard')} 
                    className={`p-1.5 rounded-full transition cursor-pointer ${t.navHover} ${t.neutralText}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className={`text-base font-black ${t.titleText}`}>Today's Tasks</h2>
                  <div className="w-8 flex justify-end"></div> {/* Balance spacer */}
                </div>

                {/* Horizontal Date picker selections matching original */}
                <div className="px-6 flex justify-between gap-2.5 mb-5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { val: 23, name: 'Fri' },
                    { val: 24, name: 'Sat' },
                    { val: 25, name: 'Sun' },
                    { val: 26, name: 'Mon' },
                    { val: 27, name: 'Tue' }
                  ].map(day => (
                    <button
                      key={day.val}
                      onClick={() => {
                        setSelectedDay(day.val);
                        onLogAdded(`Planner focus switched to: June ${day.val}, 2026`);
                      }}
                      className={`flex-1 min-w-[50px] py-2.5 rounded-2xl flex flex-col items-center justify-center transition border ${
                        selectedDay === day.val
                          ? 'bg-[#592be1] text-white border-transparent shadow-md font-bold'
                          : t.dateBtnInactive
                      }`}
                    >
                      <span className="text-xs font-black">{day.val}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-85 mt-0.5">{day.name}</span>
                    </button>
                  ))}
                </div>

                {/* Filter chip rows (All, To do, In Progress, Completed) */}
                <div className="px-6 flex gap-1.5 mb-3.5 overflow-x-auto no-scrollbar">
                  {(['All', 'To do', 'In Progress', 'Completed'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`py-1.5 px-4.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition ${
                        taskFilter === f
                          ? 'bg-purple-600 text-white'
                          : isDarkMode 
                          ? 'bg-purple-950/45 text-purple-300 border border-purple-900/40 hover:bg-purple-950/70' 
                          : 'bg-purple-100/60 text-purple-700 border border-purple-200/40 hover:bg-purple-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Robust Sorting UI Tab */}
                <div className="px-6 mb-5">
                  <div className={`p-1 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-[#150a36] border-purple-900/20' : 'bg-purple-100/50 border-purple-200/30'}`}>
                    {(['Due Soon', 'Highest Priority', 'Recent'] as const).map(s => {
                      const isActive = taskSort === s;
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            setTaskSort(s);
                            onLogAdded(`List sorted by: ${s}`);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-purple-600 text-white shadow-xs' 
                              : isDarkMode 
                              ? 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-950/30' 
                              : 'text-purple-600/80 hover:text-[#1a0f3d] hover:bg-purple-100/20'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic List Render with checkboxes of actual schema */}
                <div className="px-6 flex-1 space-y-4">
                  {tasks
                    .filter(t => {
                      if (taskFilter === 'All') return true;
                      if (taskFilter === 'To do') return t.status === 'to-do';
                      if (taskFilter === 'In Progress') return t.status === 'in-progress';
                      if (taskFilter === 'Completed') return t.status === 'done';
                      return true;
                    })
                    .sort((a, b) => {
                      if (taskSort === 'Recent') {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        if (dateA !== dateB) return dateB - dateA;
                        return b.id.localeCompare(a.id);
                      }
                      if (taskSort === 'Highest Priority') {
                        const priorityWeight = { high: 3, medium: 2, low: 1 };
                        const weightA = priorityWeight[a.priority || 'low'] || 1;
                        const weightB = priorityWeight[b.priority || 'low'] || 1;
                        if (weightA !== weightB) return weightB - weightA;
                        return b.id.localeCompare(a.id); // fallback to recent
                      }
                      if (taskSort === 'Due Soon') {
                        const parseTimeString = (timeStr: string): number => {
                          if (!timeStr) return 12;
                          try {
                            const clean = timeStr.trim().toUpperCase();
                            const match = clean.match(/(\d+):(\d+)\s*(AM|PM)?/);
                            if (!match) return 12;
                            let hours = parseInt(match[1]);
                            const minutes = parseInt(match[2]);
                            const ampm = match[3];
                            if (ampm === 'PM' && hours < 12) hours += 12;
                            if (ampm === 'AM' && hours === 12) hours = 0;
                            return hours + minutes / 60;
                          } catch {
                            return 12;
                          }
                        };
                        const timeValA = parseTimeString(a.time);
                        const timeValB = parseTimeString(b.time);
                        if (timeValA !== timeValB) return timeValA - timeValB;
                        return b.id.localeCompare(a.id);
                      }
                      return 0;
                    })
                    .map(item => (
                      <div 
                        key={item.id}
                        className={`rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs group duration-200 relative border ${t.cardBg}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button 
                            onClick={() => toggleTaskStatus(item.id)}
                            className="text-purple-600 hover:text-purple-800 transition pt-0.5 shrink-0"
                          >
                            {item.status === 'done' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                            ) : item.status === 'in-progress' ? (
                              <Circle className="w-5 h-5 text-amber-500 fill-amber-50" />
                            ) : (
                              <Circle className={`w-5 h-5 ${isDarkMode ? 'text-purple-700 hover:text-purple-500' : 'text-purple-300 hover:text-purple-500'}`} />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <span className={`text-[8px] uppercase font-extrabold tracking-wider ${t.subtitleText}`}>
                              {item.tag}
                            </span>
                            <h4 className={`text-xs font-bold leading-snug break-words ${item.status === 'done' ? 'line-through text-neutral-500 opacity-60' : t.primaryText}`}>
                              {item.title}
                            </h4>
                          </div>

                          <button 
                            onClick={() => handleDeleteTask(item.id)}
                            className="text-neutral-300 hover:text-pink-600 transition shrink-0 self-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Card bottom info tag-stats matching the design aesthetics */}
                        <div className={`flex items-center justify-between border-t mt-2.5 pt-2 text-[10px] ${isDarkMode ? 'border-purple-950/45 text-purple-300' : 'border-purple-50/60 text-neutral-500'}`}>
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 font-mono text-[9px]">
                              <Clock className="w-3" />
                              {item.time}
                            </span>
                            {item.priority && (
                              <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded-sm ${
                                item.priority === 'high' 
                                  ? isDarkMode ? 'bg-rose-950/30 text-rose-450 border border-rose-900/10' : 'bg-[#ffeef2] text-rose-600 border border-rose-200/30' 
                                  : item.priority === 'medium'
                                  ? isDarkMode ? 'bg-amber-950/30 text-amber-400 border border-amber-900/10' : 'bg-[#fff7e6] text-amber-600 border border-amber-200/30'
                                  : isDarkMode ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/10' : 'bg-[#eefcf5] text-emerald-600 border border-emerald-200/30'
                              }`}>
                                {item.priority}
                              </span>
                            )}
                          </div>
                          
                          <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-md ${
                            item.status === 'done' 
                              ? isDarkMode ? 'bg-emerald-950/30 text-emerald-450 border border-emerald-900/10' : 'bg-emerald-100 text-emerald-700' 
                              : item.status === 'in-progress'
                              ? isDarkMode ? 'bg-amber-950/30 text-amber-450 border border-amber-900/10' : 'bg-amber-100 text-amber-700'
                              : isDarkMode ? 'bg-purple-950/40 text-purple-400 border border-purple-900/10' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.status === 'done' ? 'Completed' : item.status === 'in-progress' ? 'In Progress' : 'To do'}
                          </span>
                        </div>
                      </div>
                    ))}

                  {tasks.length === 0 && (
                    <div className="text-center py-16 text-neutral-400 text-xs">
                      No tasks fit your select filter criteria. Try clicking on other tags.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ADD PROJECT PANEL FORM SCREEN */}
            {activeScreen === 'project' && (
              <motion.div 
                key="project"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex-1 overflow-y-auto no-scrollbar pt-14 pb-18 flex flex-col ${t.panelBg}`}
              >
                {/* Back and Title Header */}
                <div className="px-6 flex items-center justify-between mb-4.5">
                  <button 
                    onClick={() => onScreenChange('dashboard')} 
                    className={`p-1.5 rounded-full transition ${t.navHover} ${t.neutralText}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className={`text-base font-black ${t.titleText}`}>Add Project</h2>
                  <div className="w-8"></div>
                </div>

                <form onSubmit={handleAddProject} className="px-6 space-y-4">
                  
                  {/* Category Group Selector dropdown simulation */}
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase block ${t.subtitleText}`}>Task Group Category</label>
                    <select 
                      value={selectedFormGroup} 
                      onChange={(e) => setSelectedFormGroup(e.target.value)}
                      className={`w-full text-xs rounded-xl p-3 focus:outline-shadow font-semibold border ${t.inputBg}`}
                    >
                      {taskGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project Title Text field */}
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase block font-display ${t.subtitleText}`}>Project Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Grocery Shopping App"
                      value={formProjName}
                      onChange={(e) => setFormProjName(e.target.value)}
                      className={`w-full text-xs rounded-xl p-3 focus:outline-shadow font-semibold border ${t.inputBg}`}
                      required
                    />
                  </div>

                  {/* Description text area */}
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase block font-display ${t.subtitleText}`}>Description Details</label>
                    <textarea 
                      placeholder="Enter specific features or guidelines of the project..."
                      rows={4}
                      value={formProjDesc}
                      onChange={(e) => setFormProjDesc(e.target.value)}
                      className={`w-full text-xs rounded-xl p-3 border resize-none leading-relaxed font-semibold ${t.inputBg}`}
                    />
                  </div>

                  {/* Starts and Ends date range fields */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className={`text-[10px] font-black uppercase block ${t.subtitleText}`}>Start Date</label>
                      <input 
                        type="text" 
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className={`w-full text-xs rounded-xl p-3 text-center border font-semibold ${t.inputBg}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[10px] font-black uppercase block ${t.subtitleText}`}>End Date</label>
                      <input 
                        type="text" 
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className={`w-full text-xs rounded-xl p-3 text-center border font-semibold ${t.inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Logo Emoji Selector Selection Row */}
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase block ${t.subtitleText}`}>Project Theme Logo representation</label>
                    <div className="flex gap-2">
                      {[
                        { icon: '🛒 Grocery shop', bg: 'bg-green-100 text-green-700' },
                        { icon: '🍔 Food Delivery', bg: 'bg-rose-100 text-[#592be1]' },
                        { icon: '✈️ Travel app', bg: 'bg-blue-100 text-blue-700' },
                        { icon: '📚 E-Learning', bg: 'bg-amber-100 text-amber-700' }
                      ].map(logo => (
                        <button
                          key={logo.icon}
                          type="button"
                          onClick={() => setFormLogo(logo.icon)}
                          className={`flex-1 py-2 px-1 text-[10px] rounded-xl font-bold flex flex-col items-center gap-1 border transition ${
                            formLogo === logo.icon
                              ? 'bg-purple-600 text-white border-transparent'
                              : t.logoBtnInactive
                          }`}
                        >
                          <span className="text-sm">{logo.icon.split(' ')[0]}</span>
                          <span className="scale-90 font-mono text-[8px] whitespace-nowrap">{logo.icon.split(' ')[1] || ''}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Huge purple action submit button */}
                  <button
                    type="submit"
                    className="w-full bg-[#6a42f4] hover:bg-[#5b34e4] text-white text-xs font-bold py-3.5 rounded-2xl cursor-pointer shadow-lg shadow-purple-200 mt-5 uppercase tracking-wider"
                  >
                    Add Project
                  </button>
                </form>
              </motion.div>
            )}

            {/* GROUPS STATUS VIEW */}
            {activeScreen === 'groups' && (
              <motion.div 
                key="groups"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex-1 overflow-y-auto no-scrollbar pt-14 pb-18 flex flex-col ${t.panelBg}`}
              >
                {/* Title */}
                <div className="px-6 flex items-center justify-between mb-4.5">
                  <h2 className={`text-base font-black ${t.titleText}`}>GraceGate Workgroups</h2>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono ${isDarkMode ? 'bg-purple-950 text-purple-300 border border-purple-900/10' : 'bg-purple-100 text-purple-700'}`}>
                    Overview
                  </span>
                </div>

                <div className="px-6 space-y-4">
                  <p className={`text-xs leading-relaxed ${t.subtitleText}`}>
                    Welcome to GraceGate client workspaces database. View summary of project statistics connected dynamically to Supabase logic.
                  </p>

                  <div className="space-y-4">
                    {taskGroups.map(g => {
                      const percentage = g.total_tasks > 0 ? Math.round((g.completed_tasks / g.total_tasks) * 100) : 0;
                      return (
                        <div key={g.id} className={`rounded-2xl p-5 space-y-3 shadow-xs border ${t.cardBg}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-extrabold ${t.titleText}`}>{g.name}</span>
                            <span className={`font-mono text-[10px] font-bold ${isDarkMode ? 'text-purple-400 font-black' : 'text-purple-600'}`}>{percentage}% completed</span>
                          </div>

                          {/* Progress slider bar colored */}
                          <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-purple-950/40' : 'bg-purple-50'}`}>
                            <div className="h-full bg-[#6a42f4]" style={{ width: `${percentage}%` }}></div>
                          </div>

                          {/* Detail info grids */}
                          <div className={`grid grid-cols-2 gap-4 text-[11px] pt-1.5 border-t ${isDarkMode ? 'border-purple-950/45' : 'border-purple-50'}`}>
                            <div>
                              <span className={`block uppercase text-[8px] font-black ${t.subtitleText}`}>Open Tasks</span>
                              <span className={`font-bold ${t.primaryText}`}>{Math.max(0, g.total_tasks - g.completed_tasks)} Open items</span>
                            </div>
                            <div>
                              <span className={`block uppercase text-[8px] font-black ${t.subtitleText}`}>Finished</span>
                              <span className={`font-bold ${t.primaryText}`}>{g.completed_tasks} Completed</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`p-4 rounded-2xl flex items-start gap-2.5 text-[11px] border ${isDarkMode ? 'bg-[#180e3c]/20 border-purple-950/40 text-purple-300' : 'bg-purple-50/50 border border-purple-100 text-[#592be1]'}`}>
                    <Clock className="w-4 h-4 mt-0.5 shrink-0 animate-pulse" />
                    <p className="leading-relaxed">
                      Need custom custom labels or teams? Write them directly using our Supabase panel SQL code runner to synchronize columns in real-time.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SETTINGS PANEL WITH THEME TOGGLE */}
            {activeScreen === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex-1 overflow-y-auto no-scrollbar pt-14 pb-18 flex flex-col ${t.panelBg}`}
              >
                {/* Header widget */}
                <div className="px-6 flex items-center justify-between mb-4.5">
                  <button 
                    onClick={() => onScreenChange('dashboard')} 
                    className={`p-1.5 rounded-full transition cursor-pointer ${t.navHover} ${t.neutralText}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className={`text-base font-black ${t.titleText}`}>Settings</h2>
                  <div className="w-8"></div>
                </div>

                {/* Profile Overview */}
                <div className="px-6 mb-5">
                  <div className={`p-4 rounded-2xl flex items-center gap-3.5 border ${t.cardBg}`}>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/40">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                        alt="Profile avatar User" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className={`text-xs font-black ${t.titleText}`}>{userName}</h3>
                      <p className={`text-[10px] font-medium ${t.subtitleText}`}>gracefrancis0895@gmail.com</p>
                      <span className="inline-block mt-1 text-[8px] bg-purple-600 text-white font-extrabold px-1.5 py-0.5 rounded font-sans uppercase">
                        Lead Designer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appearance Settings Container */}
                <div className="px-6 mb-5">
                  <div className={`p-4 rounded-2xl border space-y-3.5 ${t.cardBg}`}>
                    <label className={`text-[10px] font-black uppercase tracking-wider ${t.subtitleText}`}>Appearance</label>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[#592be1] h-8 w-8 rounded-full flex items-center justify-center transition ${isDarkMode ? 'text-purple-400 bg-purple-950/40' : 'bg-purple-100'}`}>
                          {isDarkMode ? '🌙' : '☀️'}
                        </span>
                        <div>
                          <span className={`text-[11px] font-bold block ${t.primaryText}`}>Dark Slate Theme</span>
                          <span className={`text-[9px] block ${t.subtitleText}`}>Dim background and card palettes</span>
                        </div>
                      </div>

                      {/* Premium Toggle Switch Button */}
                      <button 
                        type="button"
                        onClick={toggleTheme}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer flex items-center ${isDarkMode ? 'bg-purple-600 justify-end' : 'bg-neutral-200 justify-start'}`}
                      >
                        <motion.div 
                          layout
                          className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                        >
                          <span className="text-[8px]">{isDarkMode ? '🌙' : '☀️'}</span>
                        </motion.div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* General Settings Switches */}
                <div className="px-6 mb-5">
                  <div className={`p-4 rounded-2xl border space-y-3.5 ${t.cardBg}`}>
                    <label className={`text-[10px] font-black uppercase tracking-wider ${t.subtitleText}`}>Preferences</label>

                    {/* Sync indicator */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className={`text-[11px] font-bold block ${t.primaryText}`}>Persistent Cache</span>
                        <span className={`text-[9px] block ${t.subtitleText}`}>Keep data stored locally across reloads</span>
                      </div>
                      <span className="text-[8px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-md uppercase font-sans">
                        ACTIVE
                      </span>
                    </div>

                    <div className="border-t border-purple-950/20 my-2"></div>

                    {/* Sound toggle simulator */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-[11px] font-bold block ${t.primaryText}`}>Play Sound Effects</span>
                        <span className={`text-[9px] block ${t.subtitleText}`}>Audio feedback on completion events</span>
                      </div>
                      <button className="w-9 h-5 rounded-full bg-purple-600/30 p-0.5 flex items-center justify-end">
                        <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Specs Settings Container */}
                <div className="px-6 mb-6">
                  <div className={`p-4 rounded-2xl border space-y-3.5 ${t.cardBg}`}>
                    <label className={`text-[10px] font-black uppercase tracking-wider ${t.subtitleText}`}>Developer Node Details</label>
                    <div className="text-[10px] space-y-1.5 font-mono leading-relaxed">
                      <div className="flex justify-between">
                        <span className={t.subtitleText}>Engine:</span>
                        <span className={`font-semibold ${t.neutralText}`}>React 18 + Vite SPA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={t.subtitleText}>Prototype ID:</span>
                        <span className={`font-semibold ${t.neutralText}`}>GraceGate_Mobile_v2.6</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={t.subtitleText}>DB Adapter:</span>
                        <span className={`font-semibold ${t.neutralText}`}>PostgreSQL Supabase API</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Log Out CTA inside Settings screen */}
                <div className="px-6">
                  <button
                    type="button"
                    onClick={() => {
                      onScreenChange('onboarding');
                      onLogAdded("Welcome wizard started. Switched workspace view to onboarding registry.");
                    }}
                    className="w-full bg-[#fae8ff] hover:bg-[#f5d0fe] text-fuchsia-700 text-xs font-black py-3 rounded-2xl cursor-pointer transition uppercase tracking-wider text-center"
                  >
                    Log Out Workstation
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* SATELLITE FLOATING TAB BAR NAVIGATION SYSTEM MATCHING DESIGN */}
          {activeScreen !== 'onboarding' && (
            <div className={`absolute bottom-0 left-0 right-0 h-16 border-t px-4.5 flex items-center justify-between z-30 shadow-2xl transition-colors duration-200 ${t.navBg}`}>
              
              <button 
                onClick={() => {
                  onScreenChange('dashboard');
                  onLogAdded("Bottom nav: switched workspace registry view to primary Dashboard.");
                }}
                className={`py-1.5 px-3 flex flex-col items-center cursor-pointer transition ${
                  activeScreen === 'dashboard' ? 'text-purple-600 font-bold font-sans' : isDarkMode ? 'text-purple-400/80 hover:text-purple-300' : 'text-neutral-400 hover:text-purple-400'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="text-[8px] font-semibold mt-0.5">Home</span>
              </button>

              <button 
                onClick={() => {
                  onScreenChange('calendar');
                  onLogAdded("Bottom nav: switched workspace registry view to Today's Tasks & Calendar.");
                }}
                className={`py-1.5 px-3 flex flex-col items-center cursor-pointer transition ${
                  activeScreen === 'calendar' ? 'text-purple-600 font-bold font-sans' : isDarkMode ? 'text-purple-400/80 hover:text-purple-300' : 'text-neutral-400 hover:text-purple-400'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[8px] font-semibold mt-0.5">Calendar</span>
              </button>

              {/* Floating Center purple big Add button plus! */}
              <div className="relative -top-3">
                <button 
                  onClick={() => {
                    setShowAddTaskModal(true);
                    onLogAdded("Overlay widget trigger: launched central task generator sheets screen.");
                  }}
                  className="w-11.5 h-11.5 rounded-full bg-[#592be1] hover:bg-[#6a42f4] active:scale-95 text-white flex items-center justify-center cursor-pointer shadow-lg shadow-purple-500/30 transition-all border border-purple-400/10 hover:shadow-purple-500/50"
                  id="btm-floating-plus"
                >
                  <Plus className="w-5 h-5 text-white stroke-[3.5]" />
                </button>
              </div>

              <button 
                onClick={() => {
                  onScreenChange('groups');
                  onLogAdded("Bottom nav: switched registry preview focus to general TaskGroups stats summary.");
                }}
                className={`py-1.5 px-3 flex flex-col items-center cursor-pointer transition ${
                  activeScreen === 'groups' ? 'text-purple-600 font-bold font-sans' : isDarkMode ? 'text-purple-400/80 hover:text-purple-300' : 'text-neutral-400 hover:text-purple-400'
                }`}
              >
                <Folder className="w-5 h-5" />
                <span className="text-[8px] font-semibold mt-0.5">Groups</span>
              </button>

              <button 
                onClick={() => {
                  onScreenChange('settings');
                  onLogAdded("Bottom nav: switched workspace registry focus to settings customization.");
                }}
                className={`py-1.5 px-3 flex flex-col items-center cursor-pointer transition ${
                  activeScreen === 'settings' ? 'text-purple-600 font-bold font-sans' : isDarkMode ? 'text-purple-400/80 hover:text-purple-300' : 'text-neutral-400 hover:text-purple-400'
                }`}
                title="Settings & Theme Configuration"
              >
                <Settings className="w-5 h-5" />
                <span className="text-[8px] font-semibold mt-0.5">Settings</span>
              </button>

            </div>
          )}

          {/* Slide-Up Task Creator Modal Form Sheets */}
          <AnimatePresence>
            {showAddTaskModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end"
              >
                {/* Backdrop dismiss touch targets */}
                <div className="flex-1" onClick={() => setShowAddTaskModal(false)}></div>
                
                {/* Visual Form Panel sheets sheets */}
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="bg-white rounded-t-[32px] p-6 space-y-4 max-h-[85%] overflow-y-auto no-scrollbar border-t border-purple-100"
                >
                  <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                    <h3 className="text-sm font-black text-[#1a0f3d]">Create New Task</h3>
                    <button 
                      onClick={() => setShowAddTaskModal(false)}
                      className="p-1 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                    >
                      <X className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateTodo} className="space-y-4.5 text-xs">
                    
                    {/* Task Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-400 uppercase block">What is to be done?</label>
                      <input 
                        type="text"
                        placeholder="e.g. Design checklist wireframes"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        className="w-full bg-white border border-purple-100 p-2.5 rounded-xl text-neutral-800 text-xs font-semibold focus:outline-shadow"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Associated project dropdown selectors */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-400 uppercase block">Assign to Project Project</label>
                      <select 
                        value={newTodoProject}
                        defaultValue={projects[0]?.id || ''}
                        onChange={(e) => {
                          const id = e.target.value;
                          setNewTodoProject(id);
                          const projName = projects.find(p => p.id === id)?.name || 'General';
                          setNewTodoTag(projName);
                        }}
                        className="w-full bg-white border border-purple-100 p-2.5 rounded-xl text-neutral-700 font-semibold"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority Level Selection Row */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-400 uppercase block">Priority Level</label>
                      <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map(prio => (
                          <button
                            key={prio}
                            type="button"
                            onClick={() => setNewTodoPriority(prio)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase text-center border transition-all cursor-pointer ${
                              newTodoPriority === prio
                                ? prio === 'high'
                                  ? 'bg-[#ffeef2] text-rose-600 border-rose-300 shadow-xs shadow-rose-200/20'
                                  : prio === 'medium'
                                  ? 'bg-[#fff7e6] text-amber-600 border-amber-300 shadow-xs shadow-amber-200/20'
                                  : 'bg-[#eefcf5] text-emerald-600 border-emerald-300 shadow-xs shadow-emerald-200/20'
                                : 'bg-white text-neutral-500 border-purple-100 hover:border-purple-200'
                            }`}
                          >
                            {prio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Scheduled Time widget */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase block">Alert Time</label>
                        <input 
                          type="text"
                          placeholder="e.g. 10:00 AM"
                          value={newTodoTime}
                          onChange={(e) => setNewTodoTime(e.target.value)}
                          className="w-full bg-white border border-purple-100 p-2.5 rounded-xl text-neutral-700 text-center font-bold"
                        />
                      </div>

                      {/* Helper icon button submit */}
                      <div className="flex items-end text-neutral-400">
                        <span className="text-[9px] block text-center leading-snug">
                          Your progress statistics will calculate immediately upon completion.
                        </span>
                      </div>
                    </div>

                    {/* Actions button */}
                    <button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11.5 rounded-xl text-xs uppercase tracking-wider"
                    >
                      Assign Task
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom virtual home screen gesture identifier */}
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/60 rounded-full z-45 pointer-events-none"></div>

        </div>

      </div>

    </div>
  );
}
