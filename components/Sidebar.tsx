import React, { useState } from 'react';
import { Subject } from '../types';
import { LayoutDashboard, Atom, FlaskConical, Calculator, CalendarClock, Download, Upload, Moon, Sun, ChevronLeft, ChevronRight, BookOpen, ClipboardCheck, CalendarDays } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onExport: () => void;
  onImport: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onExport, onImport, theme, toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-slate-200' },
    { id: Subject.PHYSICS, label: 'Physics', icon: Atom, color: 'text-indigo-400' },
    { id: Subject.CHEMISTRY, label: 'Chemistry', icon: FlaskConical, color: 'text-emerald-400' },
    { id: Subject.MATHEMATICS, label: 'Mathematics', icon: Calculator, color: 'text-rose-400' },
    { id: 'tests', label: 'Tests', icon: ClipboardCheck, color: 'text-indigo-400' },
    { id: 'weekly-planner', label: 'Weekly Planner', icon: CalendarDays, color: 'text-purple-400' },
    { id: 'revision', label: 'Revision', icon: CalendarClock, color: 'text-amber-400' },
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white/5 dark:bg-slate-900/40 backdrop-blur-lg border-r border-white/10 dark:border-slate-800/50 flex flex-col h-full transition-all duration-300 relative`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-slate-700/50 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-md z-50 text-slate-300 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`p-6 flex items-center ${collapsed ? 'justify-center flex-col gap-1' : ''}`}>
        {collapsed ? (
            <>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    M
                </div>
                <span className="text-[10px] font-black text-slate-400">JEE</span>
            </>
        ) : (
            <div>
                <h1 className="text-2xl font-black font-mono uppercase tracking-widest whitespace-nowrap">
                    <span className="text-red-500">Maximus</span>
                    <span className="text-red-500"> JEE</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono mt-1 whitespace-nowrap uppercase tracking-widest">
                    Now or Never
                </p>
            </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : ''}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 rounded-xl transition-all duration-200 group relative ${
              currentView === item.id 
                ? 'bg-white/10 dark:bg-white/10 shadow-lg' 
                : 'text-slate-400 hover:bg-white/5 dark:hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {currentView === item.id && <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full ${item.color.replace('text-','bg-')}`}></div>}
            <item.icon size={20} className={`${currentView === item.id ? item.color : 'text-slate-400 group-hover:text-slate-300'}`} />
            {!collapsed && <span className={`font-semibold text-sm whitespace-nowrap ${currentView === item.id ? 'text-white' : ''}`}>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {!collapsed ? (
            <>
                <div className="flex gap-2">
                    <button onClick={onExport} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg text-xs font-bold transition-colors">
                        <Download size={14} /> Export
                    </button>
                    <button onClick={onImport} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg text-xs font-bold transition-colors">
                        <Upload size={14} /> Import
                    </button>
                </div>
                <button onClick={toggleTheme} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg text-xs font-bold transition-colors">
                    {theme === 'dark' ? <><Sun size={14} /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}
                </button>
            </>
        ) : (
             <div className="flex flex-col gap-2">
                <button onClick={onExport} title="Export" className="flex items-center justify-center bg-white/5 p-2 rounded-lg text-slate-300"><Download size={16} /></button>
                <button onClick={onImport} title="Import" className="flex items-center justify-center bg-white/5 p-2 rounded-lg text-slate-300"><Upload size={16} /></button>
                <button onClick={toggleTheme} title="Toggle Theme" className="flex items-center justify-center bg-white/5 p-2 rounded-lg text-slate-300">
                     {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
             </div>
        )}
        {!collapsed && (
            <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                    Created by <span className="font-semibold">Dhruv</span> & <span className="font-semibold">Utkarsh</span>
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;