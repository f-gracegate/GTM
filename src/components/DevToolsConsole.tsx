/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, Code, Terminal, Copy, Check, Info, Lightbulb, Play, RefreshCw, AlertCircle
} from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../lib/supabase';

interface DevToolsConsoleProps {
  supabaseConfig: { url: string; anonKey: string; isConnected: boolean };
  onConfigChange: (url: string, anonKey: string) => void;
  syncLogs: string[];
  currentScreen: 'onboarding' | 'dashboard' | 'calendar' | 'project' | 'groups';
}

export default function DevToolsConsole({ 
  supabaseConfig, 
  onConfigChange, 
  syncLogs, 
  currentScreen 
}: DevToolsConsoleProps) {
  const [activeTab, setActiveTab] = useState<'supabase' | 'flutter' | 'sql'>('supabase');
  const [copiedText, setCopiedText] = useState(false);
  const [urlInput, setUrlInput] = useState(supabaseConfig.url === 'MY_SUPABASE_URL' ? '' : supabaseConfig.url);
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey === 'MY_SUPABASE_ANON_KEY' ? '' : supabaseConfig.anonKey);
  const [customLogs, setCustomLogs] = useState<string[]>([]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange(urlInput, keyInput);
    addLog(`Supabase parameters updated. Attempting to connect to ${urlInput || 'local database'}`);
  };

  const addLog = (msg: string) => {
    setCustomLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const triggerMockSync = () => {
    addLog("Syncing Task Groups schema check... OK");
    addLog("Pushing task differences to Supabase... OK");
    addLog("Pulling latest remote database objects... Sync Complete!");
  };

  const allLogs = [...customLogs, ...syncLogs];

  const getFlutterCodeForScreen = () => {
    switch(currentScreen) {
      case 'onboarding':
        return `// FLUTTER: WelcomeOnboarding Screen
// Powered by GraceGate Technologies

import 'package:flutter/material.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFFAF9FF), Color(0xFFF1EEFF)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(height: 20),
                // Generated GraceGate 3D Illustration space
                Image.network(
                  'https://example.com/onboarding_illustration.png',
                  height: 320,
                  fit: BoxFit.contain,
                ),
                Column(
                  children: [
                    const Text(
                      'GraceGate\\nTask Management',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'SpaceGrotesk',
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E1B4B),
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'This productive tool is designed to help you better manage your task project-wise conveniently!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1), // Purple
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16.0),
                      ),
                    ),
                    onPressed: () { 
                      Navigator.pushReplacementNamed(context, '/dashboard');
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text('Let\\'s Start', style: TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold)),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, color: Colors.white),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}`;
      case 'dashboard':
        return `// FLUTTER: Dashboard Screen
// Powered by GraceGate Technologies
// Integrating Supabase Real-Time stream

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _projects = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProjects();
  }

  Future<void> _fetchProjects() async {
    try {
      final data = await supabase
          .from('projects')
          .select('*, task_groups(name, color)');
      setState(() {
        _projects = List<Map<String, dynamic>>.from(data);
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching projects: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Hello! Livia Vaccaro', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined, color: Colors.purple), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Today's Progress Card
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.deepPurple,
                  borderRadius: BorderRadius.circular(24.0),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Your today\\'s task\\nalmost done!', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.white),
                          onPressed: () {},
                          child: const Text('View Task', style: TextStyle(color: Colors.deepPurple)),
                        ),
                      ],
                    ),
                    CircularProgressIndicator(value: 0.85, color: Colors.white, strokeWidth: 6.0),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('In Progress', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              // Project ListView here...
            ],
          ),
        ),
      ),
    );
  }
}`;
      case 'calendar':
        return `// FLUTTER: Calendar & Daily Tasks View
// Powered by GraceGate Technologies

import 'package:flutter/material.dart';

class CalendarTasksScreen extends StatelessWidget {
  const CalendarTasksScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: const BackButton(color: Colors.black),
        title: const Text("Today's Tasks", style: TextStyle(color: Colors.black)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Weekly Calendar View
          Container(
            height: 90,
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildDateItem("23", "Fri", false),
                _buildDateItem("24", "Sat", false),
                _buildDateItem("25", "Sun", true), // Selected
                _buildDateItem("26", "Mon", false),
                _buildDateItem("27", "Tue", false),
              ],
            ),
          ),
          // Tasks filters & list...
        ],
      ),
    );
  }

  Widget _buildDateItem(String day, String weekday, bool isSelected) {
    return Container(
      width: 55,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: isSelected ? Colors.deepPurple : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(day, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.black)),
          Text(weekday, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white70 : Colors.grey)),
        ],
      ),
    );
  }
}`;
      case 'project':
        return `// FLUTTER: Add Project Form Screen
// Powered by GraceGate Technologies

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AddProjectScreen extends StatefulWidget {
  const AddProjectScreen({Key? key}) : super(key: key);

  @override
  State<AddProjectScreen> createState() => _AddProjectScreenState();
}

class _AddProjectScreenState extends State<AddProjectScreen> {
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedGroup = 'g1';

  Future<void> _submitProject() async {
    final supabase = Supabase.instance.client;
    await supabase.from('projects').insert({
      'group_id': _selectedGroup,
      'name': _nameController.text,
      'description': _descController.text,
      'start_date': '01 May, 2026',
      'end_date': '30 June, 2026',
      'logo_url': '🛒 Grocery shop',
      'status': 'in-progress'
    });
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Project')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Project Name')),
            TextField(controller: _descController, decoration: const InputDecoration(labelText: 'Description')),
            ElevatedButton(onPressed: _submitProject, child: const Text('Add Project')),
          ],
        ),
      ),
    );
  }
}`;
      case 'groups':
        return `// FLUTTER: Work Groups Status View
// Powered by GraceGate Technologies

import 'package:flutter/material.dart';

class TaskGroupsScreen extends StatelessWidget {
  const TaskGroupsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Work & Task Groups')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildGroupTile('Office Project', 25, 0.70, Colors.deepPurple),
          _buildGroupTile('Personal Project', 30, 0.52, Colors.pink),
          _buildGroupTile('Daily Study', 30, 0.87, Colors.amber),
        ],
      ),
    );
  }

  Widget _buildGroupTile(String name, int tasks, double percent, Color color) {
    return Card(
      child: ListTile(
        title: Text(name),
        subtitle: Text('$tasks Tasks'),
        trailing: CircularProgressIndicator(value: percent, color: color),
      ),
    );
  }
}`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0715] text-[#d1c9f3] border-l border-purple-900 font-sans shadow-2xl overflow-hidden" id="dev-console">
      {/* Console Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0d0a1b] border-b border-purple-900/60 font-display">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm tracking-wide text-white">GRACEGATE DEVELOPER LOGS</span>
        </div>
        <div className="flex items-center gap-1.5 bg-purple-950/40 px-2 py-1 rounded-md text-[10px] text-purple-300 border border-purple-900/40">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${supabaseConfig.isConnected ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${supabaseConfig.isConnected ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
          </span>
          {supabaseConfig.isConnected ? 'SUPABASE SYNCED' : 'LOCAL DEV ENGINE'}
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-purple-900/60 bg-[#090614]">
        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all duration-200 ${
            activeTab === 'supabase'
              ? 'border-purple-500 text-white bg-purple-950/20'
              : 'border-transparent text-purple-400 hover:text-white hover:bg-purple-950/10'
          }`}
          id="tab-supabase"
        >
          <Database className="w-3.5 h-3.5" />
          Supabase Sync
        </button>
        <button
          onClick={() => setActiveTab('flutter')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all duration-200 ${
            activeTab === 'flutter'
              ? 'border-purple-500 text-white bg-purple-950/20'
              : 'border-transparent text-purple-400 hover:text-white hover:bg-purple-950/10'
          }`}
          id="tab-flutter"
        >
          <Code className="w-3.5 h-3.5" />
          Flutter Widget Tree
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all duration-200 ${
            activeTab === 'sql'
              ? 'border-purple-500 text-white bg-purple-950/20'
              : 'border-transparent text-purple-400 hover:text-white hover:bg-purple-950/10'
          }`}
          id="tab-sql"
        >
          <Terminal className="w-3.5 h-3.5" />
          Bootstrap SQL
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {activeTab === 'supabase' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 bg-purple-950/20 rounded-xl border border-purple-900/50">
              <h3 className="text-white font-bold mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Active GraceGate Data Layer
              </h3>
              <p className="text-purple-300 leading-relaxed text-[11px]">
                By default, this application parses mock data locally. Add your custom Supabase DB configurations below to make it save, reload, and stream tasks dynamically!
              </p>
            </div>

            {/* Supabase Config Form */}
            <form onSubmit={handleSaveConfig} className="bg-[#0e0b1f] border border-purple-900/60 rounded-xl p-4 space-y-3.5 shadow-lg">
              <legend className="text-xs uppercase font-semibold text-purple-400 tracking-wider font-display border-b border-purple-950 pb-2">
                Supabase Connection Settings
              </legend>
              
              <div className="space-y-1">
                <label className="text-purple-400 text-[10px] block font-semibold">SUPABASE PROJECT URL</label>
                <input 
                  type="url"
                  placeholder="https://yourprojectid.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-[#16122c] border border-purple-900/50 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-purple-400 text-[10px] block font-semibold">SUPABASE ANON / API CLIENT KEY</label>
                <input 
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-[#16122c] border border-purple-900/50 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-2 rounded-lg cursor-pointer transition text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Connect Database
                </button>
                <button 
                  type="button"
                  onClick={triggerMockSync}
                  className="bg-[#1b1535] hover:bg-[#251e47] border border-purple-900/60 text-purple-200 aspect-square p-2 rounded-lg transition"
                  title="Simulate push synch"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Live Sync Logs */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-purple-400 tracking-widest flex items-center justify-between">
                <span>Real-Time Sync Log Stream</span>
                <span className="text-[9px] lowercase text-purple-500 font-mono">(realtime updates)</span>
              </h4>
              <div className="bg-black/40 border border-purple-950 rounded-xl p-3 h-48 overflow-y-auto font-mono text-[10px] text-purple-300 space-y-1.5 no-scrollbar flex flex-col-reverse">
                {allLogs.length === 0 ? (
                  <div className="text-center text-purple-600/60 py-10 flex flex-col items-center gap-1">
                    <AlertCircle className="w-5 h-5 text-purple-800" />
                    <span>Idle local workspace events.</span>
                  </div>
                ) : (
                  allLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-purple-950/20 pb-1 leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flutter' && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-950/25 rounded-xl border border-indigo-900/50 flex items-start gap-2.5 text-xs">
              <Info className="text-sky-400 w-4.5 h-4.5 mt-0.5 shrink-0" />
              <div>
                <b className="text-white block">Active Emulator Tracking Code</b>
                <span className="text-indigo-200 text-[11px]">
                  Showing the genuine Flutter widget mapping for character exact mockup! Feel free to copy and compile in your local Flutter environment.
                </span>
              </div>
            </div>

            <div className="relative rounded-xl border border-purple-950 bg-black/40 overflow-hidden font-mono text-[11px] text-purple-300 flex flex-col h-[32rem]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#0e091e] border-b border-purple-950/80">
                <span className="text-gray-400 text-[10px]">main.dart &rarr; Scaffold ({currentScreen})</span>
                <button
                  onClick={() => handleCopy(getFlutterCodeForScreen())}
                  className="text-purple-400 hover:text-white transition flex items-center gap-1 text-[10px]"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedText ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="flex-1 p-4 overflow-auto no-scrollbar whitespace-pre text-left">
                <code>{getFlutterCodeForScreen()}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="p-3 bg-[#110e25] rounded-xl border border-purple-900/50 flex items-start gap-2.5 text-xs">
              <Info className="text-purple-400 w-4.5 h-4.5 mt-0.5 shrink-0" />
              <div>
                <b className="text-white block">Supabase Table Definitions</b>
                <span className="text-purple-300 text-[11px]">
                  Copy this SQL and run it in your Supabase project SQL Editor to create the tables exactly as the app queries them.
                </span>
              </div>
            </div>

            <div className="relative rounded-xl border border-purple-950 bg-black/40 overflow-hidden font-mono text-[11px] text-purple-300 flex flex-col h-[32rem]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#0e091e] border-b border-purple-950/80">
                <span className="text-gray-400 text-[10px]">database_schema.sql</span>
                <button
                  onClick={() => handleCopy(SUPABASE_SETUP_SQL)}
                  className="text-purple-400 hover:text-white transition flex items-center gap-1 text-[10px]"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedText ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="flex-1 p-4 overflow-auto no-scrollbar whitespace-pre text-left">
                <code>{SUPABASE_SETUP_SQL}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Retro branding footer */}
      <div className="px-5 py-4 border-t border-purple-900/60 bg-[#070511] flex items-center justify-between text-[10px]">
        <span className="text-purple-500 font-mono">APPLET INTEGRATION ID: 3a6f9804</span>
        <span className="text-purple-400 font-bold font-display tracking-wider uppercase">
          GraceGate Technologies &reg;
        </span>
      </div>
    </div>
  );
}
