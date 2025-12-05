import React, { useState } from 'react';
import { Subject, Chapter, Priority } from '../types';
import { Plus, Trash2, X, GripVertical } from 'lucide-react';
import PYQModal from './PYQModal';
import ConfirmationModal from './ConfirmationModal';

interface SubjectViewProps {
  subject: Subject;
  chapters: Chapter[];
  onUpdateChapter: (chapter: Chapter) => void;
  onAddChapter: (chapter: Chapter) => void;
  onDeleteChapter: (id: string) => void;
  onReorderChapters?: (chapters: Chapter[]) => void;
}

const SubjectView: React.FC<SubjectViewProps> = ({ subject, chapters, onUpdateChapter, onAddChapter, onDeleteChapter, onReorderChapters }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  
  // Drag and Drop State
  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null);
  const [dragEnabledId, setDragEnabledId] = useState<string | null>(null);
  
  // Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string} | null>(null);

  // Filter chapters for this view
  const subjectChapters = chapters
    .filter(c => c.subject === subject)
    .filter(c => priorityFilter === 'all' || c.priority === priorityFilter);
  
  // Derive selected chapter from ID to ensure freshness
  const selectedChapterForPYQ = selectedChapterId ? chapters.find(c => c.id === selectedChapterId) || null : null;

  const togglePriority = (current: Priority): Priority => {
    if (current === Priority.A) return Priority.B;
    if (current === Priority.B) return Priority.C;
    if (current === Priority.C) return Priority.D;
    return Priority.A;
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.A: return 'text-red-500 bg-red-500/10 border-red-500/20';
      case Priority.B: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case Priority.C: return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
      case Priority.D: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const handleConfidenceChange = (chapter: Chapter, valStr: string) => {
    let val = parseInt(valStr);
    if (isNaN(val)) val = 0;
    if (val > 100) val = 100;
    onUpdateChapter({...chapter, confidence: val});
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
      // Prevent bubbling to the row click (which opens PYQ modal)
      e.stopPropagation();
      setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeleteChapter(deleteTarget.id);
      setDeleteTarget(null);
    }
  };
  
  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
      // Since draggable={true} is controlled by hover state on handle, 
      // we can assume if this fires, it's valid.
      setDraggedChapterId(id);
      e.dataTransfer.effectAllowed = "move";
      // Optional: Set a clearer drag image if needed
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      // Reset drag enabled state
      setDragEnabledId(null);
      
      if (!draggedChapterId || draggedChapterId === targetId || !onReorderChapters) {
          setDraggedChapterId(null);
          return;
      }

      const globalDragIdx = chapters.findIndex(c => c.id === draggedChapterId);
      const globalTargetIdx = chapters.findIndex(c => c.id === targetId);
      
      if (globalDragIdx === -1 || globalTargetIdx === -1) {
          setDraggedChapterId(null);
          return;
      }

      const newChapters = [...chapters];
      const [draggedItem] = newChapters.splice(globalDragIdx, 1);
      newChapters.splice(globalTargetIdx, 0, draggedItem);
      
      onReorderChapters(newChapters);
      setDraggedChapterId(null);
  };


  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h1 className={`text-3xl font-black tracking-tight uppercase ${
             subject === Subject.PHYSICS ? 'text-indigo-500' : 
             subject === Subject.CHEMISTRY ? 'text-emerald-500' : 'text-rose-500'
           }`}>
             {subject}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Syllabus Tracker & Status</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                {(['all', ...Object.values(Priority)]).map(p => (
                    <button 
                        key={p}
                        onClick={() => setPriorityFilter(p as Priority | 'all')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                            priorityFilter === p 
                            ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-900/50'
                        }`}
                    >
                        {p === 'all' ? 'All' : `P-${p}`}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-700"
            >
                <Plus size={16} /> Add Chapter
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-inner custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-sm">
            <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-10"></th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-800 min-w-[300px]">Chapter Details</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-32">Priority</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-56">Confidence %</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-24 text-center">Rev 1</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-24 text-center">Rev 2</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-40 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {subjectChapters.map((chapter) => (
              <tr 
                key={chapter.id} 
                className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group ${draggedChapterId === chapter.id ? 'opacity-50 bg-slate-100 dark:bg-slate-800' : ''}`}
                // Only allow drag if we are hovering the handle
                draggable={!!onReorderChapters && dragEnabledId === chapter.id}
                onDragStart={(e) => handleDragStart(e, chapter.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, chapter.id)}
              >
                <td 
                    className="p-4 text-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 drag-handle"
                    onMouseEnter={() => setDragEnabledId(chapter.id)}
                    onMouseLeave={() => setDragEnabledId(null)}
                    onTouchStart={() => setDragEnabledId(chapter.id)} // Basic mobile touch support for enabling drag state
                >
                    <GripVertical size={16} className="pointer-events-none mx-auto" />
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <input 
                      className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:text-indigo-600 dark:focus:text-white mb-1 focus:border-b border-indigo-500/50 w-full"
                      value={chapter.name}
                      onChange={(e) => onUpdateChapter({...chapter, name: e.target.value})}
                    />
                    <div className="flex items-center space-x-2">
                       <input 
                         className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-full max-w-[200px] focus:outline-none focus:border-indigo-500"
                         value={chapter.unit}
                         onChange={(e) => onUpdateChapter({...chapter, unit: e.target.value})}
                         placeholder="UNIT / TAG"
                       />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onDoubleClick={() => onUpdateChapter({...chapter, priority: togglePriority(chapter.priority)})}
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(chapter.priority)} cursor-pointer select-none transition-all hover:scale-105`}
                    title="Double click to toggle"
                  >
                    Priority {chapter.priority}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={chapter.confidence}
                      onChange={(e) => handleConfidenceChange(chapter, e.target.value)}
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 dark:[&::-webkit-slider-thumb]:bg-white"
                    />
                    <input 
                       type="number"
                       min="0"
                       max="100"
                       value={chapter.confidence}
                       onChange={(e) => handleConfidenceChange(chapter, e.target.value)}
                       onKeyDown={(e) => e.stopPropagation()}
                       className={`text-sm font-mono font-bold w-12 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1 text-center focus:outline-none focus:border-indigo-500 ${
                         chapter.confidence > 80 ? 'text-green-500 dark:text-green-400' : chapter.confidence > 50 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'
                       }`}
                    />
                  </div>
                </td>
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={chapter.rev1}
                    onChange={(e) => onUpdateChapter({...chapter, rev1: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer accent-indigo-600"
                  />
                </td>
                <td className="p-4 text-center">
                   <input
                    type="checkbox"
                    checked={chapter.rev2}
                    onChange={(e) => onUpdateChapter({...chapter, rev2: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-white dark:focus:ring-offset-slate-900 cursor-pointer accent-indigo-600"
                  />
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setSelectedChapterId(chapter.id)}
                        className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded text-xs font-bold transition-all uppercase tracking-wide"
                    >
                        PYQs
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => handleDeleteClick(e, chapter.id, chapter.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors relative z-10"
                        title="Delete Chapter"
                    >
                        <Trash2 className="pointer-events-none" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedChapterForPYQ && (
        <PYQModal 
          chapter={selectedChapterForPYQ} 
          onClose={() => setSelectedChapterId(null)}
          onUpdate={onUpdateChapter}
        />
      )}

      {isAddModalOpen && (
          <AddChapterModal 
             subject={subject}
             onClose={() => setIsAddModalOpen(false)}
             onAdd={(c) => { onAddChapter(c); setIsAddModalOpen(false); }}
          />
      )}

      <ConfirmationModal 
        isOpen={!!deleteTarget}
        title="Delete Chapter"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? This action cannot be undone.`}
        confirmText="Delete Chapter"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

const AddChapterModal = ({ subject, onClose, onAdd }: { subject: Subject, onClose: () => void, onAdd: (c: Chapter) => void }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [priority, setPriority] = useState(Priority.B);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newChapter: Chapter = {
            id: Date.now().toString(),
            name,
            subject,
            unit: unit || 'General',
            priority,
            confidence: 0,
            rev1: false,
            rev2: false,
            pyqs: [
                { year: 2025, done: 0, total: 30, link: '', completed: false },
                { year: 2024, done: 0, total: 30, link: '', completed: false },
                { year: 2023, done: 0, total: 30, link: '', completed: false },
                { year: 2022, done: 0, total: 30, link: '', completed: false },
                { year: 2021, done: 0, total: 30, link: '', completed: false },
            ],
            remarks: '',
            studyLinks: ''
        };
        onAdd(newChapter);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl w-full max-w-sm shadow-2xl space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add New Chapter</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Chapter Name</label>
                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Unit/Tag</label>
                    <input required value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500" placeholder="e.g. Mechanics" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
                        {Object.values(Priority).map(p => <option key={p} value={p}>Priority {p}</option>)}
                    </select>
                </div>
                <button type="submit" className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors mt-2">Create Chapter</button>
            </form>
        </div>
    )
}

export default SubjectView;