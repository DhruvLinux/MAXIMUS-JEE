import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, TestRecord, Subject, TestType } from '../types';
import { Plus, Trash2, Edit2, X, Search, TrendingUp, Zap, Award, ChevronsUpDown, ArrowRight, Filter, BadgeCheck } from 'lucide-react';
import { formatDateDDMMYY, parseLocalDate, getTodayISOString, getDateNDaysAgoISO } from '../utils/dateUtils';
import { calculateOverallStats, calculateSubjectStats, getTestTypeColor } from '../utils/testUtils';
import TestModal from './TestModal';
import ConfirmationModal from './ConfirmationModal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const TESTS_PER_PAGE = 10;

interface TestViewProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

const subjectColors = {
    [Subject.PHYSICS]: '#6366f1',
    [Subject.CHEMISTRY]: '#10b981',
    [Subject.MATHEMATICS]: '#ef4444',
    'Overall': '#8b5cf6',
};

// Helper for moving average
const getSmoothedData = (data: any[], keys: string[], windowSize: number = 3) => {
    if (windowSize < 2 || data.length < windowSize) return data;
    const smoothed = JSON.parse(JSON.stringify(data));
    keys.forEach(key => {
        for (let i = 0; i < smoothed.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(smoothed.length, i + Math.ceil(windowSize / 2));
            const windowSlice = data.slice(start, end);
            if (windowSlice.length > 0) {
                const sum = windowSlice.reduce((acc, val) => acc + (val[key] || 0), 0);
                smoothed[i][key] = Math.round(sum / windowSlice.length);
            }
        }
    });
    return smoothed;
}

const TestView: React.FC<TestViewProps> = ({ state, onUpdateState }) => {
  const [modalData, setModalData] = useState<TestRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  
  // Chart State
  const [smoothTrend, setSmoothTrend] = useState(true);
  const [visibleLines, setVisibleLines] = useState<string[]>(['Overall']);

  // Filter & Sort State
  const [filters, setFilters] = useState({
    subjects: [] as Subject[],
    types: [TestType.FULL_SYLLABUS] as TestType[],
    dateRange: { start: '', end: '' },
    search: ''
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSaveTest = (test: TestRecord) => {
    let newTests = [...state.tests];
    const idx = newTests.findIndex(t => t.id === test.id);
    if (idx >= 0) { newTests[idx] = test; } else { newTests.push(test); }
    onUpdateState({ ...state, tests: newTests });
    setIsModalOpen(false);
  };

  const confirmDeleteTest = () => {
    if (testToDelete) {
      onUpdateState({ ...state, tests: state.tests.filter(t => t.id !== testToDelete) });
      setTestToDelete(null);
      if (selectedTestId === testToDelete) setSelectedTestId(null);
    }
  };
  
  const selectedTest = useMemo(() => {
    return state.tests.find(t => t.id === selectedTestId) || null;
  }, [selectedTestId, state.tests]);

  const filteredTests = useMemo(() => {
    return state.tests.filter(test => {
      // Date Range Filter
      const testDate = parseLocalDate(test.date);
      const startDate = filters.dateRange.start ? parseLocalDate(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? parseLocalDate(filters.dateRange.end) : null;
      if (startDate && testDate < startDate) return false;
      if (endDate && testDate > endDate) return false;
      
      // Type Filter
      if (filters.types.length > 0 && !filters.types.includes(test.type)) return false;
      
      // Subject Filter (only applies to tests with a 'subject' property)
      if (filters.subjects.length > 0 && (!test.subject || !filters.subjects.includes(test.subject))) {
          return false;
      }
      
      // Search Filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const chapterNames = (test.linkedChapters || []).map(id => state.chapters.find(c => c.id === id)?.name || '').join(' ').toLowerCase();
        return test.name.toLowerCase().includes(searchTerm) || (test.notes || '').toLowerCase().includes(searchTerm) || chapterNames.includes(searchTerm);
      }
      return true;
    });
  }, [state.tests, filters, state.chapters]);

  const sortedTests = useMemo(() => {
      return [...filteredTests].sort((a, b) => {
          let aVal, bVal;
          if (sortConfig.key === 'score') {
              aVal = calculateOverallStats(a.scores).totalMarks;
              bVal = calculateOverallStats(b.scores).totalMarks;
          } else { // default to date
              aVal = new Date(a.date).getTime();
              bVal = new Date(b.date).getTime();
          }
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
  }, [filteredTests, sortConfig]);
  
  const paginatedTests = useMemo(() => {
      const startIndex = (currentPage - 1) * TESTS_PER_PAGE;
      return sortedTests.slice(startIndex, startIndex + TESTS_PER_PAGE);
  }, [sortedTests, currentPage]);

  const totalPages = Math.ceil(sortedTests.length / TESTS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [filters, sortConfig]);
  
  const requestSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'desc';
      if (sortConfig.key === key && sortConfig.direction === 'desc') { direction = 'asc'; }
      setSortConfig({ key, direction });
  };
  
  const kpiData = useMemo(() => {
      const count = filteredTests.length;
      if (count === 0) return { count: 0, avgScore: 0, bestScore: 0, last5Avg: 0 };
      let totalMarksSum = 0;
      let bestScore = 0;
      filteredTests.forEach(t => {
          const { totalMarks } = calculateOverallStats(t.scores);
          totalMarksSum += totalMarks;
          if (totalMarks > bestScore) bestScore = totalMarks;
      });
      const last5Tests = sortedTests.slice(0, 5);
      const last5TotalMarks = last5Tests.reduce((sum, t) => sum + calculateOverallStats(t.scores).totalMarks, 0);
      return { count, avgScore: Math.round(totalMarksSum / (count || 1)), bestScore, last5Avg: Math.round(last5TotalMarks / (last5Tests.length || 1)) };
  }, [filteredTests, sortedTests]);
  
  const chartData = useMemo(() => {
    const baseData = [...sortedTests].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => ({
      date: formatDateDDMMYY(t.date), name: t.name,
      Overall: calculateOverallStats(t.scores).totalMarks,
      [Subject.PHYSICS]: calculateSubjectStats(t.scores?.physics).marks,
      [Subject.CHEMISTRY]: calculateSubjectStats(t.scores?.chemistry).marks,
      [Subject.MATHEMATICS]: calculateSubjectStats(t.scores?.maths).marks
    }));
    return smoothTrend ? getSmoothedData(baseData, ['Overall', ...Object.values(Subject)]) : baseData;
  }, [sortedTests, smoothTrend]);

  const activeFilterCount = useMemo(() => {
      let count = 0;
      if (filters.search) count++;
      if (filters.dateRange.start || filters.dateRange.end) count++;
      count += filters.subjects.length;
      // Don't count the default "Full Syllabus" filter if it's the only one
      if (filters.types.length > 1 || (filters.types.length === 1 && filters.types[0] !== TestType.FULL_SYLLABUS)) {
          count += filters.types.length;
      }
      return count;
  }, [filters]);

  const toggleLineVisibility = (lineKey: string) => {
    setVisibleLines(prev => prev.includes(lineKey) ? prev.filter(l => l !== lineKey) : [...prev, lineKey]);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative bg-slate-50 dark:bg-slate-950">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Test Analysis</h1>
        <div className="flex items-center gap-2">
            <FilterPopover activeFilterCount={activeFilterCount} filters={filters} setFilters={setFilters} />
            <button onClick={() => { setModalData(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"><Plus size={16} /> Add Test</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar -mr-6 pr-6 -ml-6 pl-6 pt-2 space-y-4">
          <KpiCards data={kpiData} />
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">Performance Trend</h3>
                  <div className="flex items-center gap-1">
                      {['Overall', ...Object.values(Subject)].map(line => (
                          <button key={line} onClick={() => toggleLineVisibility(line)} className={`px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors ${visibleLines.includes(line) ? `text-white border-transparent` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`} style={{ backgroundColor: visibleLines.includes(line) ? subjectColors[line as keyof typeof subjectColors] : undefined }}>{line}</button>
                      ))}
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 cursor-pointer ml-2 pl-2 border-l border-slate-200 dark:border-slate-700"><input type="checkbox" checked={smoothTrend} onChange={e => setSmoothTrend(e.target.checked)} className="accent-indigo-600 w-3.5 h-3.5 rounded"/>Smooth</label>
              </div>
              </div>
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/><XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', borderRadius: '0.5rem' }} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} /><Legend iconType="circle" iconSize={8} />
              {Object.entries(subjectColors).map(([key, color]) => visibleLines.includes(key) && <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }}/>)}
              </LineChart></ResponsiveContainer></div>
          </div>
          
          <TestListTable tests={paginatedTests} sortConfig={sortConfig} requestSort={requestSort} onTestSelect={setSelectedTestId} onEdit={test => { setModalData(test); setIsModalOpen(true); }} onDelete={id => setTestToDelete(id)} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
      
      <TestDetailPanel test={selectedTest} chapters={state.chapters} onClose={() => setSelectedTestId(null)} onEdit={test => { setModalData(test); setIsModalOpen(true); }} />
      {isModalOpen && <TestModal initialData={modalData} chapters={state.chapters} onSave={handleSaveTest} onClose={() => setIsModalOpen(false)} />}
      <ConfirmationModal isOpen={!!testToDelete} title="Delete Test" message="Are you sure you want to delete this test record? This action is permanent." onConfirm={confirmDeleteTest} onCancel={() => setTestToDelete(null)} />
    </div>
  );
};

const FilterPopover = ({ filters, setFilters, activeFilterCount }: { filters: any, setFilters: any, activeFilterCount: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => { setLocalFilters(filters); }, [filters]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleApply = () => { setFilters(localFilters); setIsOpen(false); };
    const handleClear = () => {
        const cleared = { subjects: [], types: [], dateRange: { start: '', end: '' }, search: '' };
        setLocalFilters(cleared);
        setFilters(cleared);
        setIsOpen(false);
    };

    const handleSubjectChange = (subject: Subject) => setLocalFilters((prev: any) => ({ ...prev, subjects: prev.subjects.includes(subject) ? prev.subjects.filter((s: Subject) => s !== subject) : [...prev.subjects, subject] }));
    const handleTypeChange = (type: TestType) => setLocalFilters((prev: any) => ({ ...prev, types: prev.types.includes(type) ? prev.types.filter((t: TestType) => t !== type) : [...prev.types, type] }));
    const handleDateChange = (field: 'start' | 'end', value: string) => setLocalFilters((prev: any) => ({...prev, dateRange: {...prev.dateRange, [field]: value}}));
    const handleSearchChange = (value: string) => setLocalFilters((prev: any) => ({...prev, search: value}));
    
    return (<div className="relative"><button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilterCount > 0 ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Filter size={16} /> Filters {activeFilterCount > 0 && <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}</button>
    {isOpen && <div ref={popoverRef} className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="search" placeholder="Search tests, notes..." value={localFilters.search} onChange={e => handleSearchChange(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none"/></div>
        <div className="flex items-center gap-2"><input type="date" value={localFilters.dateRange.start} onChange={e => handleDateChange('start', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-sm border-transparent focus:ring-indigo-500"/><span className="text-slate-400">-</span><input type="date" value={localFilters.dateRange.end} onChange={e => handleDateChange('end', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-sm border-transparent focus:ring-indigo-500"/></div>
        <div><h5 className="text-xs font-bold text-slate-500 mb-2">Subject</h5><div className="flex flex-wrap gap-2">{Object.values(Subject).map(s => (<button key={s} onClick={() => handleSubjectChange(s)} className={`px-2.5 py-1 text-xs font-bold rounded-full border ${localFilters.subjects.includes(s) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{s}</button>))}</div></div>
        <div><h5 className="text-xs font-bold text-slate-500 mb-2">Test Type</h5><div className="flex flex-wrap gap-2">{Object.values(TestType).map(t => (<button key={t} onClick={() => handleTypeChange(t)} className={`px-2.5 py-1 text-xs font-bold rounded-full border ${localFilters.types.includes(t) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{t}</button>))}</div></div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800"><button onClick={handleClear} className="text-xs font-bold text-slate-500 hover:text-red-500">Clear All</button><button onClick={handleApply} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2"><BadgeCheck size={16}/> Apply</button></div>
    </div>}</div>);
};

const KpiCard = ({ title, value, icon: Icon }: { title: string, value: number | string, icon: React.ElementType }) => {
    const isNumber = typeof value === 'number';
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left cursor-default">
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

const KpiCards = ({ data }: { data: any }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Tests Given" value={data.count} icon={TrendingUp} />
        <KpiCard title="Avg Score" value={data.count === 0 ? "Not Given Yet" : data.avgScore} icon={Zap} />
        <KpiCard title="Best Score" value={data.count === 0 ? "Not Given Yet" : data.bestScore} icon={Award} />
        <KpiCard title="Last 5 Avg" value={data.count === 0 ? "Not Given Yet" : data.last5Avg} icon={Zap} />
    </div>
);

const TestListTable = ({ tests, sortConfig, requestSort, onTestSelect, onEdit, onDelete, currentPage, totalPages, setCurrentPage }: any) => {
    return (<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-950/50 text-xs uppercase text-slate-500"><tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="p-3">Name</th>
            <th className="p-3 cursor-pointer" onClick={() => requestSort('date')}>Date <ChevronsUpDown size={12} className="inline"/></th>
            <th className="p-3">Type</th>
            <th className="p-3 cursor-pointer text-right" onClick={() => requestSort('score')}>Score <ChevronsUpDown size={12} className="inline"/></th>
            <th className="p-3 text-center">P/C/M</th><th className="p-3 text-center">Accuracy</th><th className="p-3 text-center">Actions</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tests.length === 0 ? (<tr><td colSpan={7} className="text-center p-8 text-slate-500">No tests found. Try adjusting filters.</td></tr>) : tests.map((test: TestRecord) => {
                const { totalMarks, overallAccuracy } = calculateOverallStats(test.scores);
                const p = calculateSubjectStats(test.scores?.physics).marks;
                const c = calculateSubjectStats(test.scores?.chemistry).marks;
                const m = calculateSubjectStats(test.scores?.maths).marks;
                return (<tr key={test.id} onClick={() => onTestSelect(test.id)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{test.name}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{formatDateDDMMYY(test.date)}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getTestTypeColor(test.type)}`}>{test.type}</span></td>
                    <td className="p-3 text-right font-bold font-mono text-lg text-emerald-500">{totalMarks}</td>
                    <td className="p-3 text-center font-mono text-xs"><span className="text-indigo-500">{p}</span> / <span className="text-emerald-500">{c}</span> / <span className="text-rose-500">{m}</span></td>
                    <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-slate-300">{overallAccuracy}%</td>
                    <td className="p-3"><div className="flex justify-center gap-2">
                        <button onClick={e => { e.stopPropagation(); onEdit(test); }} className="p-1 hover:text-indigo-500"><Edit2 size={14}/></button>
                        <button onClick={e => { e.stopPropagation(); onDelete(test.id); }} className="p-1 hover:text-red-500"><Trash2 size={14}/></button>
                    </div></td>
                </tr>);
            })}
        </tbody>
    </table></div>
    {totalPages > 1 && (<div className="p-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs"><button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</button><span>Page {currentPage} of {totalPages}</span><button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</button></div>)}
    </div>);
};

const TestDetailPanel = ({ test, chapters, onClose, onEdit }: { test: TestRecord | null; chapters: AppState['chapters']; onClose: () => void; onEdit: (t: TestRecord) => void; }) => {
    if (!test) return null;
    const { totalMarks, overallAccuracy, totalCorrect, totalIncorrect, totalUnattempted } = calculateOverallStats(test.scores);
    const subjectData = [
        { name: Subject.PHYSICS, score: test.scores?.physics, color: 'text-indigo-500' },
        { name: Subject.CHEMISTRY, score: test.scores?.chemistry, color: 'text-emerald-500' },
        { name: Subject.MATHEMATICS, score: test.scores?.maths, color: 'text-rose-500' },
    ];
    return (<div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-40 transform transition-transform duration-300 ${test ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full"><div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
            <div><h3 className="font-bold text-lg text-slate-800 dark:text-white">{test.name}</h3><p className="text-sm text-slate-500">{formatDateDDMMYY(test.date)} &bull; {test.type}</p></div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg"><div className="text-xs uppercase text-slate-500">Score</div><div className="text-3xl font-black text-emerald-500">{totalMarks}</div></div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg"><div className="text-xs uppercase text-slate-500">Accuracy</div><div className="text-3xl font-black text-slate-700 dark:text-slate-200">{overallAccuracy}%</div></div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex justify-around text-xs"><span title="Correct">{totalCorrect}C</span><span title="Incorrect">{totalIncorrect}I</span><span title="Unattempted">{totalUnattempted}U</span></div>
            {subjectData.map(({ name, score, color }) => {
                const { marks, accuracy } = calculateSubjectStats(score);
                return (<div key={name} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3"><h4 className={`font-bold text-sm ${color}`}>{name}</h4><div className="grid grid-cols-4 text-center text-xs mt-2"><div title="Marks"><span className="font-bold text-base">{marks}</span> Mks</div><div title="Accuracy"><span className="font-bold text-base">{accuracy}</span>%</div><div title="Correct"><span className="text-emerald-500">{score?.correct || 0}</span> C</div><div title="Incorrect"><span className="text-red-500">{score?.incorrect || 0}</span> I</div></div></div>);
            })}
            {test.linkedChapters && test.linkedChapters.length > 0 && <div><h4 className="font-bold text-sm mb-1">Linked Chapters</h4><div className="flex flex-wrap gap-1">{test.linkedChapters.map(id => chapters.find(c => c.id === id)?.name).filter(Boolean).map(name => <span key={name} className="text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">{name}</span>)}</div></div>}
            {test.notes && <div><h4 className="font-bold text-sm mb-1">Notes</h4><p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">{test.notes}</p></div>}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800"><button onClick={() => onEdit(test)} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg">Edit Test</button></div>
        </div>
    </div>);
};

export default TestView;