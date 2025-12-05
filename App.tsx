import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SubjectView from './components/SubjectView';
import RevisionView from './components/RevisionView';
import TestView from './components/TestView';
import WeeklyPlannerView from './components/WeeklyPlannerView';
import AICoachModal from './components/AICoachModal';
import { AppState, Subject, Chapter, RevisionTile, ChatMessage, TestType, TestRecord, PlannerTask } from './types';
import { emptyScores } from './utils/testUtils';
import { INITIAL_CHAPTERS } from './constants';
import { Sparkles } from 'lucide-react';

const SEED_TESTS: TestRecord[] = [
    { id: 't1', name: 'Full Mock 1', date: '2025-10-01', type: TestType.FULL_SYLLABUS, scores: { physics: { correct: 15, incorrect: 8, unattempted: 2 }, chemistry: { correct: 18, incorrect: 5, unattempted: 2 }, maths: { correct: 12, incorrect: 10, unattempted: 3 } }, timeTaken: '03:00' },
    { id: 't2', name: 'Mechanics Part Test', date: '2025-10-15', type: TestType.PART_TEST, subject: Subject.PHYSICS, linkedChapters: ['p1'], scores: { physics: { correct: 20, incorrect: 4, unattempted: 1 }, chemistry: emptyScores().chemistry, maths: emptyScores().maths }, timeTaken: '01:00', notes: "Good speed, but some silly mistakes in rotational dynamics." },
    { id: 't3', name: 'Organic Chem Test', date: '2025-10-20', type: TestType.PART_TEST, subject: Subject.CHEMISTRY, linkedChapters: ['c3'], scores: { physics: emptyScores().physics, chemistry: { correct: 16, incorrect: 9, unattempted: 0 }, maths: emptyScores().maths }, timeTaken: '01:00' },
    { id: 't4', name: 'Full Mock 2', date: '2025-11-01', type: TestType.FULL_SYLLABUS, scores: { physics: { correct: 16, incorrect: 7, unattempted: 2 }, chemistry: { correct: 19, incorrect: 4, unattempted: 2 }, maths: { correct: 14, incorrect: 8, unattempted: 3 } }, timeTaken: '02:55' },
    { id: 't5', name: 'Calculus Chapter Test', date: '2025-11-05', type: TestType.CHAPTER_WISE, subject: Subject.MATHEMATICS, linkedChapters: ['m1'], scores: { physics: emptyScores().physics, chemistry: emptyScores().chemistry, maths: { correct: 22, incorrect: 2, unattempted: 1 } }, timeTaken: '01:00', notes: "Very strong performance in integration." },
    { id: 't6', name: 'Inorganic PYQ Mock', date: '2025-11-12', type: TestType.PYQ_MOCK, subject: Subject.CHEMISTRY, linkedChapters: ['c2'], scores: { physics: emptyScores().physics, chemistry: { correct: 21, incorrect: 4, unattempted: 0 }, maths: emptyScores().maths }, timeTaken: '00:50' },
    { id: 't7', name: 'Full Mock 3', date: '2025-12-01', type: TestType.FULL_SYLLABUS, scores: { physics: { correct: 18, incorrect: 6, unattempted: 1 }, chemistry: { correct: 20, incorrect: 3, unattempted: 2 }, maths: { correct: 15, incorrect: 7, unattempted: 3 } }, timeTaken: '02:58' },
    { id: 't8', name: 'Electrostatics Test', date: '2025-12-10', type: TestType.CHAPTER_WISE, subject: Subject.PHYSICS, linkedChapters: ['p2'], scores: { physics: { correct: 19, incorrect: 5, unattempted: 1 }, chemistry: emptyScores().chemistry, maths: emptyScores().maths }, timeTaken: '01:00' },
    { id: 't9', name: 'Full Mock 4 (Recent)', date: '2026-01-05', type: TestType.FULL_SYLLABUS, scores: { physics: { correct: 20, incorrect: 4, unattempted: 1 }, chemistry: { correct: 22, incorrect: 2, unattempted: 1 }, maths: { correct: 18, incorrect: 5, unattempted: 2 } }, timeTaken: '02:50', notes: "Best performance so far. Maths still needs some work." },
    { id: 't10', name: 'Vector 3D PYQ Mock', date: '2025-11-25', type: TestType.PYQ_MOCK, subject: Subject.MATHEMATICS, linkedChapters: ['m2'], scores: { physics: emptyScores().physics, chemistry: emptyScores().chemistry, maths: { correct: 18, incorrect: 5, unattempted: 2 } }, timeTaken: '01:00' },
    { id: 't11', name: 'Optics Part Test', date: '2025-12-20', type: TestType.PART_TEST, subject: Subject.PHYSICS, linkedChapters: ['p3'], scores: { physics: { correct: 17, incorrect: 6, unattempted: 2 }, chemistry: emptyScores().chemistry, maths: emptyScores().maths }, timeTaken: '01:00' },
    { id: 't12', name: 'Physical Chem Test', date: '2025-12-15', type: TestType.PART_TEST, subject: Subject.CHEMISTRY, linkedChapters: ['c1'], scores: { physics: emptyScores().physics, chemistry: { correct: 15, incorrect: 7, unattempted: 3 }, maths: emptyScores().maths }, timeTaken: '01:00' },
];


const App: React.FC = () => {
  // Central State
  const [currentView, setCurrentView] = useState('dashboard');
  const [appState, setAppState] = useState<AppState>({
    chapters: INITIAL_CHAPTERS,
    revisionTiles: [],
    tests: SEED_TESTS,
    logs: [],
    plannerTasks: [],
    theme: 'dark'
  });
  
  // AI Coach State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiHistory, setAiHistory] = useState<ChatMessage[]>([]);
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('magma-jee-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure structure is valid if old version loaded
        if (!parsed.chapters) parsed.chapters = INITIAL_CHAPTERS;
        if (!parsed.tests) parsed.tests = SEED_TESTS;
        if (!parsed.logs) parsed.logs = [];
        if (!parsed.revisionTiles) parsed.revisionTiles = [];
        if (!parsed.plannerTasks) parsed.plannerTasks = [];
        
        // Migration: Ensure logs have IDs
        parsed.logs = parsed.logs.map((l: any, idx: number) => ({
            ...l,
            id: l.id || Date.now() + idx.toString()
        }));

        // Migration for tests from simple score string to detailed scores object
        if (parsed.tests.length > 0 && typeof parsed.tests[0].score === 'string') {
            parsed.tests = parsed.tests.map((oldTest: any): TestRecord => ({
                id: oldTest.id,
                name: oldTest.name,
                date: oldTest.date,
                type: TestType.FULL_SYLLABUS,
                notes: `Migrated from old format. Original score: ${oldTest.score}`,
                scores: emptyScores()
            }));
        }


        // Default to dark if undefined
        if (!parsed.theme) parsed.theme = 'dark';
        setAppState(parsed);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('magma-jee-state', JSON.stringify(appState));
    // Apply theme
    if (appState.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [appState]);

  // Handlers
  const handleUpdateChapter = (updatedChapter: Chapter) => {
    setAppState(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c)
    }));
  };

  const handleAddChapter = (newChapter: Chapter) => {
      setAppState(prev => ({
          ...prev,
          chapters: [...prev.chapters, newChapter]
      }));
  };
  
  const handleDeleteChapter = (id: string) => {
      if (id === undefined || id === null) return;
      setAppState(prev => {
          // Robust safeguard against undefined arrays and type mismatches
          const chapters = Array.isArray(prev.chapters) ? prev.chapters : [];
          const revisionTiles = Array.isArray(prev.revisionTiles) ? prev.revisionTiles : [];
          
          return {
            ...prev,
            chapters: chapters.filter(c => String(c.id) !== String(id)),
            // Also cleanup revision tiles associated with this chapter
            revisionTiles: revisionTiles.filter(t => String(t.chapterId) !== String(id))
          };
      });
  };

  const handleReorderChapters = (reorderedChapters: Chapter[]) => {
      setAppState(prev => ({
          ...prev,
          chapters: reorderedChapters
      }));
  };

  const handleAddRevisionTile = (tile: RevisionTile) => {
    setAppState(prev => ({
      ...prev,
      revisionTiles: [...(prev.revisionTiles || []), tile]
    }));
  };

  const handleUpdateRevisionTile = (updatedTile: RevisionTile) => {
    setAppState(prev => ({
      ...prev,
      revisionTiles: prev.revisionTiles.map(t => t.id === updatedTile.id ? updatedTile : t)
    }));
  };

  const handleDeleteRevisionTile = (id: string) => {
    if (id === undefined || id === null) return;
    setAppState(prev => {
      // Robust safeguard against undefined arrays
      const revisionTiles = Array.isArray(prev.revisionTiles) ? prev.revisionTiles : [];
      return {
        ...prev,
        revisionTiles: revisionTiles.filter(t => String(t.id) !== String(id))
      };
    });
  };

  const handleSavePlannerTask = (task: PlannerTask) => {
    setAppState(prev => {
        const newTasks = [...(prev.plannerTasks || [])];
        const idx = newTasks.findIndex(t => t.id === task.id);
        if (idx >= 0) {
            newTasks[idx] = task;
        } else {
            newTasks.push(task);
        }
        return { ...prev, plannerTasks: newTasks };
    });
  };

  const handleDeletePlannerTask = (id: string) => {
      setAppState(prev => ({
          ...prev,
          plannerTasks: (prev.plannerTasks || []).filter(t => t.id !== id)
      }));
  };


  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "magma_jee_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImport = () => {
      fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const parsed = JSON.parse(event.target?.result as string);
              if(parsed.chapters) {
                  // Ensure all arrays exist
                  if (!parsed.revisionTiles) parsed.revisionTiles = [];
                  if (!parsed.tests) parsed.tests = [];
                  if (!parsed.logs) parsed.logs = [];
                  if (!parsed.plannerTasks) parsed.plannerTasks = [];

                  // Migration for logs if needed
                  parsed.logs = parsed.logs.map((l: any, idx: number) => ({
                      ...l,
                      id: l.id || Date.now() + idx.toString()
                  }));
                  
                  setAppState(parsed);
                  alert('Data imported successfully!');
              } else {
                  alert('Invalid file format: Missing chapters.');
              }
          } catch(err) {
              alert('Failed to parse file.');
          }
      };
      reader.readAsText(file);
      // Reset input
      e.target.value = '';
  };

  const toggleTheme = () => {
      setAppState(prev => ({...prev, theme: prev.theme === 'dark' ? 'light' : 'dark'}));
  };

  // View Routing
  const renderView = () => {
    if (currentView === 'dashboard') {
      return (
        <Dashboard 
          state={appState} 
          onUpdateState={setAppState} 
          onNavigate={setCurrentView} 
          onExport={handleExport}
        />
      );
    }
    
    if (currentView === 'revision') {
      return (
        <RevisionView 
          tiles={appState.revisionTiles || []}
          chapters={appState.chapters}
          onAddTile={handleAddRevisionTile}
          onUpdateTile={handleUpdateRevisionTile}
          onDeleteTile={handleDeleteRevisionTile}
        />
      );
    }

    if (currentView === 'weekly-planner') {
      return (
        <WeeklyPlannerView
          state={appState}
          onSaveTask={handleSavePlannerTask}
          onDeleteTask={handleDeletePlannerTask}
        />
      );
    }

    if (currentView === 'tests') {
        return (
            <TestView 
              state={appState} 
              onUpdateState={setAppState} 
            />
        );
    }

    if ([Subject.PHYSICS, Subject.CHEMISTRY, Subject.MATHEMATICS].includes(currentView as Subject)) {
      return (
        <SubjectView 
          subject={currentView as Subject}
          chapters={appState.chapters}
          onUpdateChapter={handleUpdateChapter}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
          onReorderChapters={handleReorderChapters}
        />
      );
    }

    return <div>Not Found</div>;
  };

  return (
    <div className="flex h-screen text-slate-900 dark:text-slate-200 font-sans selection:bg-red-500/30 transition-colors">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onExport={handleExport}
        onImport={handleImport}
        theme={appState.theme || 'dark'}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>
      
      {/* Global Floating AI Button */}
      <button 
        onClick={() => setShowAiModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-tr from-indigo-500 to-indigo-600 hover:scale-105 transition-transform text-white w-16 h-16 rounded-full shadow-2xl shadow-indigo-500/30 z-50 flex items-center justify-center border-2 border-white/20 group"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={28} className="transition-transform group-hover:rotate-12" />
      </button>

      {/* Global AI Modal */}
      {showAiModal && (
        <AICoachModal 
          state={appState} 
          history={aiHistory}
          setHistory={setAiHistory}
          onUpdateState={setAppState} 
          onExportData={handleExport}
          onClose={() => setShowAiModal(false)} 
        />
      )}

      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".json" />
    </div>
  );
};

export default App;
