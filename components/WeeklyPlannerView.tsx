import React, { useState, useMemo } from 'react';
import { AppState, PlannerTask, Subject, Chapter } from '../types';
import { getTodayISOString, getLocalISOString, getWeekStartDate, parseLocalDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';

interface WeeklyPlannerViewProps {
  state: AppState;
  onSaveTask: (task: PlannerTask) => void;
  onDeleteTask: (id: string) => void;
}

const getSubjectColor = (subject: Subject): string => {
    switch (subject) {
        case Subject.PHYSICS: return 'bg-indigo-500';
        case Subject.CHEMISTRY: return 'bg-emerald-500';
        case Subject.MATHEMATICS: return 'bg-rose-500';
        default: return 'bg-slate-500';
    }
};

const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({ state, onSaveTask, onDeleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalState, setModalState] = useState<{ isOpen: boolean; task?: PlannerTask; date?: string }>({ isOpen: false });

  const weekStartDate = useMemo(() => getWeekStartDate(currentDate), [currentDate]);
  
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartDate);
        d.setDate(weekStartDate.getDate() + i);
        days.push(d);
    }
    return days;
  }, [weekStartDate]);

  const todayISO = getTodayISOString();
  const todayTasks = useMemo(() => {
      return (state.plannerTasks || []).filter(task => task.date === todayISO);
  }, [state.plannerTasks, todayISO]);

  const handleWeekChange = (direction: 'next' | 'prev' | 'today') => {
      if (direction === 'today') {
          setCurrentDate(new Date());
      } else {
          const newDate = new Date(currentDate);
          newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
          setCurrentDate(newDate);
      }
  };
  
  const handleOpenModal = (task?: PlannerTask, date?: string) => {
    setModalState({ isOpen: true, task, date });
  };
  
  const handleCloseModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = (task: PlannerTask) => {
    onSaveTask(task);
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    onDeleteTask(id);
    handleCloseModal();
  };

  const toggleTaskComplete = (task: PlannerTask) => {
    onSaveTask({ ...task, completed: !task.completed });
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Weekly Planner</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {weekStartDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleWeekChange('prev')} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={20}/></button>
          <button onClick={() => handleWeekChange('today')} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">Today</button>
          <button onClick={() => handleWeekChange('next')} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Today's Focus */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Today's Focus</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{new Date().toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar -mr-2 pr-2">
            {todayTasks.length > 0 ? todayTasks.map(task => {
                const chapter = state.chapters.find(c => c.id === task.chapterId);
                return (
                  <div key={task.id} className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg flex items-start gap-3">
                    <input type="checkbox" checked={task.completed} onChange={() => toggleTaskComplete(task)} className="mt-1 w-4 h-4 rounded accent-indigo-600"/>
                    <div className={`flex-1 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{chapter?.name || 'Unknown Chapter'}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{task.remark}</p>
                    </div>
                  </div>
                )
            }) : <div className="text-center text-slate-500 pt-10">No tasks scheduled for today.</div>}
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="lg:col-span-2 grid grid-cols-7 gap-2 overflow-hidden h-full">
            {weekDays.map(day => {
                const dayISO = getLocalISOString(day);
                const tasksForDay = (state.plannerTasks || []).filter(task => task.date === dayISO);
                const isToday = dayISO === todayISO;
                return (
                    <div key={dayISO} className={`flex flex-col rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden ${isToday ? 'border-indigo-500' : ''}`}>
                        <div className={`flex justify-between items-center p-2 border-b border-slate-200 dark:border-slate-800 ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                            <div className="text-center">
                                <p className="text-xs text-slate-500">{day.toLocaleString('default', { weekday: 'short' })}</p>
                                <p className={`font-bold text-lg ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{day.getDate()}</p>
                            </div>
                            <button onClick={() => handleOpenModal(undefined, dayISO)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500"><Plus size={16}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
                           {tasksForDay.map(task => {
                               const chapter = state.chapters.find(c => c.id === task.chapterId);
                               return (
                                   <div key={task.id} onClick={() => handleOpenModal(task)} className={`p-1.5 rounded-md cursor-pointer group relative ${getSubjectColor(chapter?.subject || Subject.PHYSICS)} bg-opacity-20 hover:bg-opacity-30`}>
                                       <p className={`text-[11px] font-bold truncate ${task.completed ? 'line-through opacity-70' : ''}`}>{chapter?.name || 'Deleted Chapter'}</p>
                                       <p className={`text-[10px] text-slate-600 dark:text-slate-400 truncate ${task.completed ? 'line-through opacity-70' : ''}`}>{task.remark}</p>
                                   </div>
                               )
                           })}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {modalState.isOpen && (
        <TaskModal 
            taskToEdit={modalState.task}
            selectedDate={modalState.date}
            chapters={state.chapters}
            onClose={handleCloseModal}
            onSave={handleSave}
            onDelete={handleDelete}
        />
      )}
    </div>
  );
};

// --- Modal Component ---
interface TaskModalProps {
    taskToEdit?: PlannerTask;
    selectedDate?: string;
    chapters: Chapter[];
    onClose: () => void;
    onSave: (task: PlannerTask) => void;
    onDelete: (id: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ taskToEdit, selectedDate, chapters, onClose, onSave, onDelete }) => {
    const [date, setDate] = useState(taskToEdit?.date || selectedDate || getTodayISOString());
    const [subject, setSubject] = useState(chapters.find(c => c.id === taskToEdit?.chapterId)?.subject || Subject.PHYSICS);
    const [chapterId, setChapterId] = useState(taskToEdit?.chapterId || '');
    const [remark, setRemark] = useState(taskToEdit?.remark || '');

    const filteredChapters = chapters.filter(c => c.subject === subject);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!chapterId) return;
        onSave({
            id: taskToEdit?.id || Date.now().toString(),
            date, chapterId, remark,
            completed: taskToEdit?.completed || false,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{taskToEdit ? 'Edit Task' : 'Schedule Task'}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Date</label>
                    <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Subject</label>
                      <select value={subject} onChange={(e) => { setSubject(e.target.value as Subject); setChapterId(''); }} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
                        {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Chapter</label>
                      <select required value={chapterId} onChange={(e) => setChapterId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
                        <option value="">Select Chapter</option>
                        {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Remark / Goal</label>
                   <textarea value={remark} onChange={e => setRemark(e.target.value)} placeholder="e.g., Solve 30 PYQs..." className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none h-20"/>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                    {taskToEdit && <button type="button" onClick={() => onDelete(taskToEdit.id)} className="p-2 text-red-500 hover:text-red-400"><Trash2 size={18}/></button>}
                    <div className="flex items-center gap-2 ml-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Save</button>
                    </div>
                </div>
            </form>
        </div>
    );
};


export default WeeklyPlannerView;