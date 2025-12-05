import React, { useState, useEffect, useMemo } from 'react';
import { Chapter, PYQYearData } from '../types';
import { X, ExternalLink, CheckCircle2, Circle, Save } from 'lucide-react';

interface PYQModalProps {
  chapter: Chapter;
  onClose: () => void;
  onUpdate: (updatedChapter: Chapter) => void;
}

const PYQModal: React.FC<PYQModalProps> = ({ chapter, onClose, onUpdate }) => {
  const [localPYQs, setLocalPYQs] = useState<PYQYearData[]>(chapter.pyqs);
  const [remarks, setRemarks] = useState(chapter.remarks || '');
  const [studyLinks, setStudyLinks] = useState(chapter.studyLinks || '');

  // Reset local state when chapter prop changes (which happens on save via parent update)
  useEffect(() => {
    setLocalPYQs(chapter.pyqs);
    setRemarks(chapter.remarks || '');
    setStudyLinks(chapter.studyLinks || '');
  }, [chapter]);

  const handleSave = () => {
    onUpdate({ ...chapter, pyqs: localPYQs, remarks, studyLinks });
    onClose();
  };

  const updateRow = (index: number, newData: PYQYearData) => {
    const newPYQs = [...localPYQs];
    newPYQs[index] = newData;
    setLocalPYQs(newPYQs);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{chapter.name}</h2>
            <p className="text-slate-400 text-sm">Tracker & Material</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
             >
                <Save size={18} /> Save Changes
             </button>
             <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: PYQ Table */}
          <div className="lg:col-span-2 space-y-4">
             <h3 className="text-lg font-bold text-slate-300">Past Year Questions</h3>
             <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-sm bg-slate-900/50">
                        <th className="py-3 px-3">Year</th>
                        <th className="py-3 px-3">Done / Total</th>
                        <th className="py-3 px-3">Link</th>
                        <th className="py-3 px-3 text-center">Done</th>
                    </tr>
                    </thead>
                    <tbody>
                    {localPYQs.map((data, idx) => (
                        <PYQRow 
                            key={data.year} 
                            data={data} 
                            onChange={(updated) => updateRow(idx, updated)} 
                        />
                    ))}
                    </tbody>
                </table>
             </div>
          </div>

          {/* Right Column: Notes & Links */}
          <div className="space-y-6">
            <div className="flex flex-col h-1/2">
                <h3 className="text-lg font-bold text-slate-300 mb-2">Remarks & Strategy</h3>
                <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Write your key takeaways, formulas to remember, or strategy notes here..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 focus:border-indigo-500 outline-none resize-none custom-scrollbar min-h-[150px]"
                />
            </div>
            
            <div className="flex flex-col h-1/3">
                <h3 className="text-lg font-bold text-slate-300 mb-2">Study Materials (Links)</h3>
                <textarea 
                    value={studyLinks}
                    onChange={(e) => setStudyLinks(e.target.value)}
                    placeholder="Paste YouTube links, drive links or other resources here..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 focus:border-indigo-500 outline-none resize-none custom-scrollbar min-h-[100px]"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Separated component to isolate closure scope and prevent link mix-ups
interface PYQRowProps {
  data: PYQYearData;
  onChange: (d: PYQYearData) => void;
}

const PYQRow: React.FC<PYQRowProps> = ({ data, onChange }) => {
    const fullUrl = useMemo(() => {
        if (!data.link) return '#';
        const trimmed = data.link.trim();
        return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    }, [data.link]);

    return (
        <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
            <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                 <a 
                    href={fullUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline"
                    onClick={(e) => { if (!data.link) e.preventDefault(); }}
                    title={data.link ? `Open PYQs for ${data.year}` : 'No link available'}
                >
                    {data.year}
                </a>
            </td>
            <td className="py-3 px-3">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={data.done}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^[0-9]+$/.test(val)) {
                                onChange({ ...data, done: val === '' ? 0 : parseInt(val) });
                            }
                        }}
                        className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right focus:border-indigo-500 outline-none"
                    />
                    <span className="text-slate-500">/</span>
                    <input
                        type="text"
                        value={data.total}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^[0-9]+$/.test(val)) {
                                onChange({ ...data, total: val === '' ? 0 : parseInt(val) });
                            }
                        }}
                        className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:border-indigo-500 outline-none"
                    />
                </div>
            </td>
            <td className="py-3 px-3">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        autoComplete="off"
                        name={`link-${data.year}`}
                        placeholder="Link..."
                        value={data.link}
                        onChange={(e) => onChange({ ...data, link: e.target.value })}
                        className="w-32 flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-sm focus:border-indigo-500 outline-none"
                    />
                    <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded inline-block ${data.link ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'text-slate-700 cursor-not-allowed'}`}
                        title="Open Link"
                        onClick={(e) => { if (!data.link) e.preventDefault(); }}
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </td>
            <td className="py-3 px-3 text-center">
                <button 
                    onClick={() => onChange({ ...data, completed: !data.completed })}
                    className={`transition-all ${data.completed ? 'text-green-500' : 'text-slate-700 hover:text-slate-500'}`}
                >
                    {data.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
            </td>
        </tr>
    );
};

export default PYQModal;