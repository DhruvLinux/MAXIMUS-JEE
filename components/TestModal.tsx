import React, { useState, useEffect } from 'react';
import { TestRecord, TestType, SubjectScore, Subject, Chapter } from '../types';
import { getTodayISOString } from '../utils/dateUtils';
import { X, Save, PlusCircle, XCircle } from 'lucide-react';
import { calculateSubjectStats, emptyScores } from '../utils/testUtils';

interface TestModalProps {
  initialData?: TestRecord | null;
  chapters: Chapter[];
  onSave: (test: TestRecord) => void;
  onClose: () => void;
}

const TestModal: React.FC<TestModalProps> = ({ initialData, chapters, onSave, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [date, setDate] = useState(initialData?.date || getTodayISOString());
  const [type, setType] = useState(initialData?.type || TestType.FULL_SYLLABUS);
  const [subject, setSubject] = useState(initialData?.subject);
  const [linkedChapters, setLinkedChapters] = useState<string[]>(initialData?.linkedChapters || []);
  const [timeTaken, setTimeTaken] = useState(initialData?.timeTaken || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [scores, setScores] = useState<TestRecord['scores']>(initialData?.scores || emptyScores());
  
  const isSingleSubjectTest = type === TestType.PART_TEST || type === TestType.CHAPTER_WISE;

  // Reset subject if type changes away from single-subject
  useEffect(() => {
    if (!isSingleSubjectTest) {
      setSubject(undefined);
    } else if (!subject) {
      // Default to Physics if switching to a single-subject type without a subject selected
      setSubject(Subject.PHYSICS);
    }
  }, [type, isSingleSubjectTest]);

  const handleScoreChange = (subjectKey: 'physics' | 'chemistry' | 'maths', field: keyof SubjectScore, value: string) => {
    const numValue = parseInt(value) || 0;
    setScores(prev => ({
      ...prev,
      [subjectKey]: {
        ...prev[subjectKey],
        [field]: numValue >= 0 ? numValue : 0
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    onSave({
      id: initialData?.id || Date.now().toString(),
      name,
      date,
      type,
      subject: isSingleSubjectTest ? subject : undefined,
      linkedChapters,
      timeTaken,
      notes,
      scores,
    });
  };
  
  const handleChapterToggle = (chapterId: string) => {
      setLinkedChapters(prev => 
          prev.includes(chapterId) 
          ? prev.filter(id => id !== chapterId)
          : [...prev, chapterId]
      );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Edit Test Record' : 'Add New Test Record'}</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Test Name</label>
                    <input required autoFocus type="text" placeholder="e.g. Full Syllabus Mock 1" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Date</label>
                    <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Test Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value as TestType)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
                        {Object.values(TestType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                {isSingleSubjectTest && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Subject</label>
                        <select required value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
                            {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                )}
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Time Taken (HH:MM)</label>
                    <input type="text" placeholder="03:00" pattern="[0-9]{2}:[0-9]{2}" value={timeTaken} onChange={(e) => setTimeTaken(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Subject-wise Performance</h4>
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-center">
                  <thead>
                    <tr className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                      <th className="py-2 text-left">Subject</th>
                      <th className="py-2">Correct</th>
                      <th className="py-2">Incorrect</th>
                      <th className="py-2">Unattempted</th>
                      <th className="py-2">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(scores) as Array<'physics' | 'chemistry' | 'maths'>).map((subjectKey) => {
                      const subjectName = subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
                      const { marks } = calculateSubjectStats(scores[subjectKey]);
                      return (
                        <tr key={subjectKey} className="border-t border-slate-200 dark:border-slate-800">
                          <td className="py-2 font-bold text-left text-slate-700 dark:text-slate-200">{subjectName}</td>
                          <td><input type="number" min="0" value={scores[subjectKey].correct} onChange={(e) => handleScoreChange(subjectKey, 'correct', e.target.value)} className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-center outline-none focus:border-indigo-500"/></td>
                          <td><input type="number" min="0" value={scores[subjectKey].incorrect} onChange={(e) => handleScoreChange(subjectKey, 'incorrect', e.target.value)} className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-center outline-none focus:border-indigo-500"/></td>
                          <td><input type="number" min="0" value={scores[subjectKey].unattempted} onChange={(e) => handleScoreChange(subjectKey, 'unattempted', e.target.value)} className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-center outline-none focus:border-indigo-500"/></td>
                          <td className={`font-mono font-bold text-lg ${marks >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{marks}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Linked Chapters</label>
                <div className="max-h-32 overflow-y-auto bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 space-y-1">
                    {chapters.filter(c => isSingleSubjectTest ? c.subject === subject : true).map(c => (
                        <label key={c.id} className="flex items-center space-x-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                            <input type="checkbox" checked={linkedChapters.includes(c.id)} onChange={() => handleChapterToggle(c.id)} className="w-4 h-4 rounded accent-indigo-600"/>
                            <span className="text-sm text-slate-800 dark:text-slate-200">{c.name} <span className="text-xs text-slate-400">({c.subject.substring(0,1)})</span></span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Notes & Analysis</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Made silly mistakes in electrostatics, need to revise formula..." className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none" rows={3}></textarea>
            </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button type="submit" className="flex items-center gap-2 w-full md:w-auto py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-500/20">
                <Save size={18} /> Save Test
            </button>
        </div>
      </form>
    </div>
  );
};

export default TestModal;