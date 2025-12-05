import React, { useState, useEffect, useRef } from 'react';
import { AppState, ChatMessage, Chapter, Priority, Subject, TestRecord, RevisionTile, DailyLog, TestType } from '../types';
import { getStudyAdvice } from '../services/geminiService';
import { getTodayISOString } from '../utils/dateUtils';
import { Sparkles, BrainCircuit, X, Send } from 'lucide-react';
import { emptyScores } from '../utils/testUtils';

interface AICoachModalProps {
    state: AppState;
    history: ChatMessage[];
    setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    onUpdateState: (s: AppState) => void;
    onExportData: () => void;
    onClose: () => void;
}

const AICoachModal: React.FC<AICoachModalProps> = ({ state, history, setHistory, onUpdateState, onExportData, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, loading]);

  const normalizePriority = (p: string): Priority => {
      const upper = (p || '').toUpperCase().replace('PRIORITY', '').trim();
      if (upper === 'A') return Priority.A;
      if (upper === 'B') return Priority.B;
      if (upper === 'C') return Priority.C;
      if (upper === 'D') return Priority.D;
      return Priority.C; // Default to C
  };

  const normalizeSubject = (s: string): Subject => {
      const lower = (s || '').toLowerCase();
      if (lower.includes('physics')) return Subject.PHYSICS;
      if (lower.includes('chemistry')) return Subject.CHEMISTRY;
      if (lower.includes('math')) return Subject.MATHEMATICS;
      return Subject.PHYSICS; // Default
  };

  const normalizeTestType = (t: string): TestType => {
      const lower = (t || '').toLowerCase();
      for (const type of Object.values(TestType)) {
          if (type.toLowerCase() === lower) {
              return type;
          }
      }
      return TestType.FULL_SYLLABUS;
  }

  const executeTools = (toolCalls: any[], currentState: AppState): { newState: AppState, logs: string[] } => {
      // CRITICAL: Perform shallow copy of main state object
      let newState = { ...currentState };
      
      // CRITICAL: Ensure arrays are copied if they are going to be mutated
      newState.chapters = [...newState.chapters];
      newState.tests = [...newState.tests];
      newState.revisionTiles = [...newState.revisionTiles];
      newState.logs = [...newState.logs];
      
      const logs: string[] = [];

      for (const call of toolCalls) {
          const args = call.args;

          if (call.name === 'addChapter') {
              const newChapter: Chapter = {
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                  name: args.name || 'New Chapter',
                  subject: normalizeSubject(args.subject),
                  unit: args.unit || 'General',
                  priority: normalizePriority(args.priority),
                  confidence: 0,
                  rev1: false, rev2: false,
                  pyqs: [2025, 2024, 2023, 2022, 2021].map(y => ({ year: y, done: 0, total: 30, link: '', completed: false })),
                  remarks: '', studyLinks: ''
              };
              newState.chapters.push(newChapter);
              logs.push(`Added chapter: ${newChapter.name}`);
          }
          
          else if (call.name === 'updateChapter') {
              const chapterIndex = newState.chapters.findIndex(c => c.name.toLowerCase().includes((args.chapterName || '').toLowerCase()));
              if (chapterIndex !== -1) {
                  const c = newState.chapters[chapterIndex];
                  newState.chapters[chapterIndex] = {
                      ...c,
                      priority: args.priority ? normalizePriority(args.priority) : c.priority,
                      confidence: args.confidence !== undefined ? args.confidence : c.confidence,
                      rev1: args.rev1 !== undefined ? args.rev1 : c.rev1,
                      rev2: args.rev2 !== undefined ? args.rev2 : c.rev2,
                      remarks: args.remarks || c.remarks
                  };
                  logs.push(`Updated chapter: ${c.name}`);
              }
          }
          
          else if (call.name === 'bulkUpdateChapters') {
              const { filterUnit, updateUnit } = args;
              let updatedCount = 0;
              const newUnitValue = updateUnit !== undefined ? updateUnit : '';

              newState.chapters = newState.chapters.map(chapter => {
                  // Only update if filterUnit is provided and matches (case-insensitive)
                  if (filterUnit && chapter.unit && chapter.unit.toLowerCase() === String(filterUnit).toLowerCase()) {
                      updatedCount++;
                      return { ...chapter, unit: newUnitValue };
                  }
                  return chapter;
              });

              if (newUnitValue === '') {
                  logs.push(`Removed tag "${filterUnit}" from ${updatedCount} chapters.`);
              } else {
                  logs.push(`Updated tag to "${newUnitValue}" for ${updatedCount} chapters.`);
              }
          }

          else if (call.name === 'updatePYQ') {
              const chapterIndex = newState.chapters.findIndex(c => c.name.toLowerCase().includes((args.chapterName || '').toLowerCase()));
              if (chapterIndex !== -1) {
                  const c = newState.chapters[chapterIndex];
                  const newPyqs = c.pyqs.map(p => {
                      if (p.year === args.year) {
                          return {
                              ...p,
                              completed: args.completed !== undefined ? args.completed : p.completed,
                              done: args.done !== undefined ? args.done : p.done
                          };
                      }
                      return p;
                  });
                  newState.chapters[chapterIndex] = { ...c, pyqs: newPyqs };
                  logs.push(`Updated PYQ ${args.year} for ${c.name}`);
              }
          }

          else if (call.name === 'addTest') {
              const newTest: TestRecord = {
                  id: Date.now().toString(),
                  name: args.name || 'Test',
                  date: args.date || getTodayISOString(),
                  type: normalizeTestType(args.type),
                  notes: args.notes || '',
                  scores: {
                      physics: { correct: args.physics_correct || 0, incorrect: args.physics_incorrect || 0, unattempted: args.physics_unattempted || 0 },
                      chemistry: { correct: args.chemistry_correct || 0, incorrect: args.chemistry_incorrect || 0, unattempted: args.chemistry_unattempted || 0 },
                      maths: { correct: args.maths_correct || 0, incorrect: args.maths_incorrect || 0, unattempted: args.maths_unattempted || 0 },
                  }
              };
              newState.tests.push(newTest);
              logs.push(`Added test: ${newTest.name}`);
          }

          else if (call.name === 'addRevisionPlan') {
              const chapter = newState.chapters.find(c => c.name.toLowerCase().includes((args.chapterName || '').toLowerCase()));
              if (chapter) {
                  const newTile: RevisionTile = {
                      id: Date.now().toString(),
                      chapterId: chapter.id,
                      subject: chapter.subject,
                      startDate: args.startDate || getTodayISOString(),
                      endDate: args.endDate || getTodayISOString(),
                      targetQ: args.targetQ || 50,
                      attemptedQ: 0,
                      notes: args.notes || ''
                  };
                  newState.revisionTiles.push(newTile);
                  logs.push(`Planned revision for ${chapter.name}`);
              }
          }

          else if (call.name === 'logDailyProgress') {
              const date = args.date || getTodayISOString();
              const idx = newState.logs.findIndex(l => l.date === date);
              const newLog: DailyLog = {
                  id: idx >= 0 ? newState.logs[idx].id : Date.now().toString(),
                  date: date,
                  physicsQ: args.physicsQ !== undefined ? args.physicsQ : (idx >= 0 ? newState.logs[idx].physicsQ : 0),
                  chemistryQ: args.chemistryQ !== undefined ? args.chemistryQ : (idx >= 0 ? newState.logs[idx].chemistryQ : 0),
                  mathQ: args.mathQ !== undefined ? args.mathQ : (idx >= 0 ? newState.logs[idx].mathQ : 0),
                  studyTime: args.studyTime !== undefined ? args.studyTime : (idx >= 0 ? newState.logs[idx].studyTime : 0),
                  remarks: args.remarks || (idx >= 0 ? newState.logs[idx].remarks : '')
              };
              
              if (idx >= 0) newState.logs[idx] = newLog;
              else newState.logs.push(newLog);
              
              logs.push(`Logged progress for ${date}`);
          }

          else if (call.name === 'deleteItem') {
              const id = (args.identifier || '').toLowerCase();
              if (args.type === 'chapter') {
                 newState.chapters = newState.chapters.filter(c => !c.name.toLowerCase().includes(id));
                 logs.push(`Deleted chapter matching '${id}'`);
              }
              else if (args.type === 'test') {
                  newState.tests = newState.tests.filter(t => !t.name.toLowerCase().includes(id));
                  logs.push(`Deleted test matching '${id}'`);
              }
              else if (args.type === 'revision') {
                  const chapter = newState.chapters.find(c => c.name.toLowerCase().includes(id));
                  if(chapter) {
                      newState.revisionTiles = newState.revisionTiles.filter(t => t.chapterId !== chapter.id);
                      logs.push(`Deleted revision plans for ${chapter.name}`);
                  }
              }
          }
          
          else if (call.name === 'exportData') {
              setTimeout(() => onExportData(), 100);
              logs.push(`Triggered data export.`);
          }
          
          else if (call.name === 'exportLogs') {
             const header = "Date,Physics,Chemistry,Mathematics,StudyTime,Remarks\n";
             const rows = newState.logs.map(l => `${l.date},${l.physicsQ},${l.chemistryQ},${l.mathQ},${l.studyTime},"${(l.remarks||'').replace(/"/g, '""')}"`).join('\n');
             const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
             setTimeout(() => {
                const link = document.createElement("a");
                link.setAttribute("href", csvContent);
                link.setAttribute("download", "study_logs.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
             }, 100);
             logs.push(`Triggered logs export.`);
          }
      }
      return { newState, logs };
  };

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: query };
    setHistory(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);
    
    try {
        const { text, toolCalls } = await getStudyAdvice(userMsg.text, history, state);
        
        let aiMsgText = text;
        
        if (toolCalls && toolCalls.length > 0) {
            const { newState, logs } = executeTools(toolCalls, state);
            onUpdateState(newState);
            if (logs.length > 0) {
                aiMsgText += "\n\n**Actions Performed:**\n" + logs.map(l => `• ${l}`).join('\n');
            }
        }
        
        setHistory(prev => [...prev, { role: 'model', text: aiMsgText }]);

    } catch (err) {
        setHistory(prev => [...prev, { role: 'model', text: "Critical failure in Max Core connection. Please retry." }]);
    } finally {
        setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col h-[80vh]">
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 flex justify-between items-center text-white shadow-md z-10">
          <h3 className="font-black flex items-center gap-2 tracking-wide uppercase">
            <Sparkles size={20} className="text-white" /> <span className="text-white">Max</span> <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded ml-2">STUDY ASSISTANT</span>
          </h3>
          <button onClick={onClose} className="hover:text-slate-200"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4" ref={scrollRef}>
           {history.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6 opacity-60">
               <BrainCircuit size={64} />
               <div className="text-center space-y-2">
                 <p className="font-bold">Max Online</p>
                 <p className="text-sm max-w-xs">I can manage your entire schedule. Tell me to "Delete the Optics chapter" or "Mark 2023 PYQs for Calculus as done".</p>
               </div>
             </div>
           )}
           
           <div className="space-y-4">
              {history.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-lg' 
                          : 'bg-slate-800 text-slate-200 rounded-bl-lg'
                      }`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                     <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-lg flex gap-2">
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                     </div>
                 </div>
              )}
           </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-700 flex gap-2 shadow-lg z-20">
          <textarea 
            value={query}
            autoFocus
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Command me... (Shift+Enter for new line)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none custom-scrollbar"
            rows={2}
            disabled={loading}
          />
          <button 
            onClick={() => handleAsk()}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AICoachModal;
