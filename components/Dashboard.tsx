import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, Subject, Priority, TestRecord, DailyLog, TestType } from '../types';
import { EXAM_DATE } from '../constants';
import { Clock, Plus, Target, Calendar as CalendarIcon, Trash2, X, Edit2, ArrowRight, Save, History, Upload, Download, ClipboardCheck, TrendingUp, Zap, Award } from 'lucide-react';
import { formatDateDDMMYY, parseLocalDate, getLocalISOString, getDaysDifference, getTodayISOString } from '../utils/dateUtils';
import { calculateOverallStats, getTestTypeDotColor } from '../utils/testUtils';
import { Timeline } from './Timeline';
import ConfirmationModal from './ConfirmationModal';
import TestModal from './TestModal';

interface DashboardProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onNavigate: (view: string) => void;
  onExport: () => void;
}

const KpiCard = ({ title, value, icon: Icon }: { title: string, value: number | string, icon: React.ElementType }) => {
    const isNumber = typeof value === 'number';

    return (
        <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center gap-2">
                <Icon className="text-slate-400" size={16} />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            </div>
            <div className="mt-4 flex items-center min-h-[4rem]">
                <span className={isNumber ? 
                    "text-5xl font-black text-slate-800 dark:text-white" :
                    "text-lg font-bold text-slate-500 dark:text-slate-400"
                }>
                    {value}
                </span>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ state, onUpdateState, onNavigate, onExport }) => {
  // Daily Log State
  const [logDate, setLogDate] = useState(getTodayISOString());
  const [logData, setLogData] = useState({ p: 0, c: 0, m: 0, time: 0, remarks: '' });
  const [showLogHistory, setShowLogHistory] = useState(false);

  // Modals & Other
  const [testModalData, setTestModalData] = useState<TestRecord | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  // Delete Confirm State
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  
  // Time Calc
  const today = parseLocalDate(getTodayISOString());
  const exam = parseLocalDate(EXAM_DATE);
  const remainingDays = getDaysDifference(today, exam);

  // Load log data when date changes
  useEffect(() => {
    const existingLog = state.logs.find(l => l.date === logDate);
    if (existingLog) {
      setLogData({
        p: existingLog.physicsQ,
        c: existingLog.chemistryQ,
        m: existingLog.mathQ,
        time: existingLog.studyTime,
        remarks: existingLog.remarks || ''
      });
    } else {
      setLogData({ p: 0, c: 0, m: 0, time: 0, remarks: '' });
    }
  }, [logDate, state.logs]);
  
  const kpiData = useMemo(() => {
      const allTests = state.tests;
      const sortedTests = [...allTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const count = allTests.length;
      if (count === 0) return { count: 0, avgScore: 0, bestScore: 0, last5Avg: 0 };
      
      let totalMarksSum = 0;
      let bestScore = 0;
      allTests.forEach(t => {
          const { totalMarks } = calculateOverallStats(t.scores);
          totalMarksSum += totalMarks;
          if (totalMarks > bestScore) bestScore = totalMarks;
      });

      const last5Tests = sortedTests.slice(0, 5);
      const last5TotalMarks = last5Tests.reduce((sum, t) => sum + calculateOverallStats(t.scores).totalMarks, 0);
      
      return { 
          count, 
          avgScore: Math.round(totalMarksSum / (count || 1)), 
          bestScore, 
          last5Avg: Math.round(last5TotalMarks / (last5Tests.length || 1)) 
      };
  }, [state.tests]);

  const handleSaveLog = () => {
    const existingIndex = state.logs.findIndex(l => l.date === logDate);
    const newLog: DailyLog = {
      id: existingIndex >= 0 ? state.logs[existingIndex].id : Date.now().toString(),
      date: logDate,
      physicsQ: logData.p,
      chemistryQ: logData.c,
      mathQ: logData.m,
      studyTime: logData.time,
      remarks: logData.remarks
    };

    let newLogs = [...state.logs];
    if (existingIndex >= 0) {
      newLogs[existingIndex] = newLog;
    } else {
      newLogs.push(newLog);
    }
    
    newLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdateState({...state, logs: newLogs});
    alert('Log saved!');
  };
  
  const getSubjectStats = (subject: Subject) => {
    const chapters = state.chapters.filter(c => c.subject === subject);
    
    let totalScore = 0;
    let totalConfidence = 0;

    chapters.forEach(c => {
        const checkedPYQs = c.pyqs.filter(p => p.completed).length;
        const chapterScore = (checkedPYQs / 5) * 100;
        totalScore += chapterScore;
        totalConfidence += c.confidence;
    });

    const avgCompletion = chapters.length > 0 ? Math.round(totalScore / chapters.length) : 0;
    const avgConfidence = chapters.length > 0 ? Math.round(totalConfidence / chapters.length) : 0;

    return { 
      name: subject, 
      avgCompletion,
      avgConfidence,
      totalChapters: chapters.length
    };
  };

  const subjectStats = [
    getSubjectStats(Subject.PHYSICS),
    getSubjectStats(Subject.CHEMISTRY),
    getSubjectStats(Subject.MATHEMATICS),
  ];
  
  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case Subject.PHYSICS: return 'bg-indigo-500';
      case Subject.CHEMISTRY: return 'bg-emerald-500';
      case Subject.MATHEMATICS: return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const confirmDeleteTest = () => {
      if (testToDelete) {
          const newTests = state.tests.filter(t => t.id !== testToDelete);
          onUpdateState({ ...state, tests: newTests });
          setTestToDelete(null);
      }
  };

  const handleSaveTest = (test: TestRecord) => {
     let newTests = [...state.tests];
     const idx = newTests.findIndex(t => t.id === test.id);
     if (idx >= 0) {
         newTests[idx] = test;
     } else {
         newTests.push(test);
     }
     onUpdateState({...state, tests: newTests});
     setIsTestModalOpen(false);
  };

  const gridDays = useMemo(() => {
    const days = [];
    const startDate = parseLocalDate('2025-10-21');
    const endDate = exam;

    const dayCount = getDaysDifference(startDate, endDate) + 1;

    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [exam]);

  const getEventsForDate = (date: Date) => {
    const dateStr = getLocalISOString(date);
    const isToday = date.toDateString() === today.toDateString();
    const isExam = dateStr === EXAM_DATE;
    const tests = state.tests.filter(t => t.date === dateStr);
    return { isToday, isExam, tests };
  };
  
  const legendItems = [
      { label: 'Today', color: 'ring-2 ring-inset ring-indigo-500' },
      { label: 'Exam', color: 'bg-red-500' },
      { label: 'Full', color: getTestTypeDotColor(TestType.FULL_SYLLABUS) },
      { label: 'Part', color: getTestTypeDotColor(TestType.PART_TEST) },
      { label: 'Chapter', color: getTestTypeDotColor(TestType.CHAPTER_WISE) },
      { label: 'PYQ', color: getTestTypeDotColor(TestType.PYQ_MOCK) },
  ];
  
  const priorityOrder: { [key in Priority]: number } = {
    [Priority.A]: 1,
    [Priority.B]: 2,
    [Priority.C]: 3,
    [Priority.D]: 4,
  };

  const focusChapters = state.chapters
    .filter(c => (c.priority === Priority.A && c.confidence < 60) || (c.priority === Priority.B && c.confidence < 50))
    .sort((a, b) => {
        if (a.priority !== b.priority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.confidence - b.confidence;
    })
    .slice(0, 6);

  return (
    <div className="h-full p-6 overflow-y-auto space-y-6">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
          <Clock size={120} className="text-slate-900 dark:text-white" />
        </div>
        
        <div className="flex flex-wrap justify-between items-center mb-6 relative z-10">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center">
                <span className="bg-indigo-600 w-2 h-8 mr-3 rounded-full"></span> DAILY LOG
            </h2>
            <div className="flex items-center gap-3">
                <input 
                    type="date" 
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white text-sm focus:border-indigo-500 outline-none"
                />
                <button 
                    onClick={() => setShowLogHistory(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors"
                >
                    <History size={16} /> View Log
                </button>
                <button 
                    onClick={handleSaveLog}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Save size={16} /> Save
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {[
            { label: 'Physics Qs', key: 'p', color: 'text-indigo-500 dark:text-indigo-400' },
            { label: 'Chemistry Qs', key: 'c', color: 'text-emerald-500 dark:text-emerald-400' },
            { label: 'Maths Qs', key: 'm', color: 'text-rose-500 dark:text-rose-400' },
            { label: 'Study Time (min)', key: 'time', color: 'text-amber-500 dark:text-amber-400' }
          ].map((item) => (
             <div key={item.key} className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
               <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${item.color}`}>{item.label}</label>
               <input 
                 type="number" 
                 min="0"
                 className="w-full bg-transparent text-2xl font-mono text-slate-900 dark:text-white outline-none placeholder-slate-400 focus:border-b border-slate-300 dark:border-slate-700"
                 placeholder="0"
                 value={(logData as any)[item.key]}
                 onChange={e => setLogData({...logData, [item.key]: e.target.value === '' ? '' : parseInt(e.target.value)})}
               />
             </div>
          ))}
          <div className="md:col-span-4 mt-2">
            <textarea
                placeholder="Remarks: What went well? What needs improvement?"
                rows={2}
                value={logData.remarks}
                onChange={e => setLogData({...logData, remarks: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none resize-none"
            />
          </div>
        </div>
      </section>

      <section className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300`}>
        <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <CalendarIcon size={20} className="text-slate-400" /> Journey Tracker
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                <span className="text-indigo-600 dark:text-white font-bold">{remainingDays} days</span> until JEE Main
                </p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-500">
                    {legendItems.map(item => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-sm ${item.color}`}></span> {item.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="transition-all duration-500">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(0.875rem,1fr))] gap-1 p-1">
            {gridDays.map((date, idx) => {
              const { isToday, isExam, tests } = getEventsForDate(date);
              
              const tooltipContent = [
                  formatDateDDMMYY(getLocalISOString(date)),
                  isExam ? 'JEE MAIN EXAM' : null,
                  ...tests.map(t => `- ${t.name} (${t.type})`)
              ].filter(Boolean).join('\n');
              
              const hasEvents = isExam || tests.length > 0;
              
              let cellBgColor = 'bg-slate-100 dark:bg-slate-800/50';
              if (isExam) {
                  cellBgColor = 'bg-red-500';
              } else if (tests.length > 0) {
                  // If multiple tests, just show color of the first one
                  cellBgColor = getTestTypeDotColor(tests[0].type);
              }

              return (
                <div key={idx} className="relative group">
                  <div 
                    className={`w-4 h-4 rounded-sm transition-transform group-hover:scale-125 group-hover:z-10 relative ${cellBgColor} ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
                    aria-label={tooltipContent}
                    tabIndex={0}
                  />
                  {hasEvents && (
                     <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs p-2 rounded-lg w-48 text-left opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-20 pointer-events-none whitespace-pre-line leading-relaxed shadow-lg">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">{formatDateDDMMYY(getLocalISOString(date))}</p>
                        {isExam && <p className="text-red-400 font-bold">JEE MAIN EXAM</p>}
                        {tests.map(t => <p key={t.id} className="truncate">&bull; {t.name}</p>)}
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ClipboardCheck size={20} className="text-indigo-500" />
                        Test Stats
                    </h3>
                    <button onClick={() => onNavigate('tests')} className="text-xs text-indigo-500 flex items-center hover:underline">
                        Full Analysis <ArrowRight size={12} className="ml-1"/>
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <KpiCard title="Tests Given" value={kpiData.count} icon={TrendingUp} />
                    <KpiCard title="Avg Score" value={kpiData.count === 0 ? "Not Given Yet" : kpiData.avgScore} icon={Zap} />
                    <KpiCard title="Best Score" value={kpiData.count === 0 ? "Not Given Yet" : kpiData.bestScore} icon={Award} />
                    <KpiCard title="Last 5 Avg" value={kpiData.count === 0 ? "Not Given Yet" : kpiData.last5Avg} icon={Zap} />
                </div>
            </section>
            
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-[240px]">
                 <div className="flex justify-between items-center mb-2 flex-shrink-0">
                     <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">Upcoming Revision Plan</h3>
                     <button onClick={() => onNavigate('revision')} className="text-xs text-indigo-500 flex items-center hover:underline">Full View <ArrowRight size={12} className="ml-1"/></button>
                 </div>
                 <div className="flex-1 overflow-hidden relative border border-slate-200 dark:border-slate-800 rounded-xl">
                      <Timeline tiles={state.revisionTiles || []} chapters={state.chapters} readOnly={true} compact={true} />
                 </div>
            </section>
        </div>

        <div className="flex flex-col gap-4">
          {subjectStats.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
               <div className="flex justify-between items-center mb-3">
                 <h3 className={`text-lg font-black uppercase tracking-tight ${
                    stat.name === Subject.PHYSICS ? 'text-indigo-500 dark:text-indigo-400' : 
                    stat.name === Subject.CHEMISTRY ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                 }`}>
                   {stat.name}
                 </h3>
                 <span className="text-xs font-bold text-slate-400">{stat.totalChapters} Chapters</span>
               </div>
               
               <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                 <div 
                   className={`h-full ${getSubjectColor(stat.name)} transition-all duration-1000 ease-out`}
                   style={{ width: `${stat.avgCompletion}%` }}
                 />
               </div>
               <div className="mt-3 flex justify-between items-end">
                  <div>
                    <div className="text-xs text-slate-500 font-bold mb-1">AVG. CONFIDENCE</div>
                    <div className={`text-2xl font-black ${stat.avgConfidence > 75 ? 'text-green-500' : stat.avgConfidence > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {stat.avgConfidence}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">{stat.avgCompletion}%</span>
                    <span className="text-slate-500 text-[10px] ml-1 font-bold block">SYLLABUS DONE</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
             <Target className="mr-2 text-red-500" size={20} /> Priority Focus Area
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {focusChapters.map(c => (
                 <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border-l-4 border-red-500 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[10px] uppercase font-bold text-slate-500">{c.subject}</div>
                      <div className="text-red-500 font-mono text-xs font-bold">Conf: {c.confidence}%</div>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-white leading-tight">{c.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{c.unit}</div>
                 </div>
               ))
             }
             {focusChapters.length === 0 && (
               <div className="col-span-full text-slate-500 text-sm text-center py-4">Great job! No critical high-priority gaps detected.</div>
             )}
          </div>
        </section>

      {isTestModalOpen && (
        <TestModal 
          initialData={testModalData}
          chapters={state.chapters}
          onSave={handleSaveTest}
          onClose={() => setIsTestModalOpen(false)} 
        />
      )}
      
      <ConfirmationModal 
        isOpen={!!testToDelete}
        title="Delete Test Record"
        message="Are you sure you want to delete this test? This will remove it from your records."
        onConfirm={confirmDeleteTest}
        onCancel={() => setTestToDelete(null)}
      />

      {showLogHistory && (
          <LogHistoryModal 
            logs={state.logs} 
            onClose={() => setShowLogHistory(false)}
            onImport={(logs) => {
                const mergedLogs = [...state.logs];
                logs.forEach(newLog => {
                    const idx = mergedLogs.findIndex(l => l.date === newLog.date);
                    if(idx >= 0) mergedLogs[idx] = newLog;
                    else mergedLogs.push(newLog);
                });
                onUpdateState({...state, logs: mergedLogs});
                alert('Logs imported successfully');
            }}
          />
      )}
    </div>
  );
};

const LogHistoryModal = ({ logs, onClose, onImport }: { logs: DailyLog[], onClose: () => void, onImport: (l: DailyLog[]) => void }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const handleExport = () => {
        const header = "Date,Physics,Chemistry,Mathematics,StudyTime,Remarks\n";
        const rows = logs.map(l => `${l.date},${l.physicsQ},${l.chemistryQ},${l.mathQ},${l.studyTime},"${(l.remarks||'').replace(/"/g, '""')}"`).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "study_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const lines = text.split('\n');
            const newLogs: DailyLog[] = [];
            for(let i=1; i<lines.length; i++) {
                if(!lines[i].trim()) continue;
                const matches = lines[i].match(/([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),(.*)/);
                if(matches) {
                   const [_, date, p, c, m, time, remarks] = matches;
                   newLogs.push({
                       id: Date.now().toString() + i,
                       date: date.trim(),
                       physicsQ: parseInt(p) || 0,
                       chemistryQ: parseInt(c) || 0,
                       mathQ: parseInt(m) || 0,
                       studyTime: parseInt(time) || 0,
                       remarks: remarks.replace(/^"|"$/g, '').replace(/""/g, '"')
                   });
                }
            }
            if(newLogs.length > 0) onImport(newLogs);
            e.target.value = '';
        };
        reader.readAsText(file);
    };
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><History size={20}/> Log History</h3>
                    <div className="flex gap-2">
                        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-bold transition-colors"><Upload size={14} /> Import CSV</button>
                        <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-bold transition-colors"><Download size={14} /> Export CSV</button>
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X size={20}/></button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                            <tr className="text-xs text-slate-500 font-bold uppercase">
                                <th className="p-4">Date</th>
                                <th className="p-4 text-center">Physics</th>
                                <th className="p-4 text-center">Chem</th>
                                <th className="p-4 text-center">Math</th>
                                <th className="p-4 text-center">Time (m)</th>
                                <th className="p-4 w-1/3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 font-mono text-sm text-slate-800 dark:text-slate-200">{formatDateDDMMYY(log.date)}</td>
                                    <td className="p-4 text-center text-indigo-500 font-bold">{log.physicsQ}</td>
                                    <td className="p-4 text-center text-emerald-500 font-bold">{log.chemistryQ}</td>
                                    <td className="p-4 text-center text-rose-500 font-bold">{log.mathQ}</td>
                                    <td className="p-4 text-center text-amber-500 font-bold">{log.studyTime}</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs" title={log.remarks}>{log.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <input type="file" ref={fileRef} accept=".csv" className="hidden" onChange={handleFileChange} />
        </div>
    );
};

export default Dashboard;