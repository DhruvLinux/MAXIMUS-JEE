
import React, { useMemo } from 'react';
import { Subject, RevisionTile, Chapter } from '../types';
import { getDaysDifference, parseLocalDate, getTodayISOString } from '../utils/dateUtils';
import { StickyNote } from 'lucide-react';

interface TimelineProps {
  tiles: RevisionTile[];
  chapters: Chapter[];
  onDeleteTile?: (id: string) => void;
  onEditTile?: (tile: RevisionTile) => void; 
  readOnly?: boolean;
  compact?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ tiles, chapters, onDeleteTile, onEditTile, readOnly = false, compact = false }) => {
  // Config
  const todayStr = getTodayISOString();
  const today = parseLocalDate(todayStr); 
  const EXAM_DATE = '2026-01-21';
  const examDate = parseLocalDate(EXAM_DATE);
  
  // View range: Start from 2 days ago
  const viewStart = new Date(today);
  viewStart.setHours(0, 0, 0, 0);
  viewStart.setDate(today.getDate() - 2);

  const daysDiff = getDaysDifference(viewStart, examDate);
  const totalDays = Math.max(15, daysDiff + 5);
  const DAY_WIDTH = compact ? 40 : 100;

  // Generate headers
  const daysArray = useMemo(() => {
    const days = [];
    for(let i=0; i < totalDays; i++) {
      const d = new Date(viewStart);
      d.setDate(viewStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [totalDays, viewStart.getTime()]);

  const getTileStyle = (tile: RevisionTile) => {
    const start = parseLocalDate(tile.startDate);
    const end = parseLocalDate(tile.endDate);
    
    // Normalize time to avoid sub-day offsets
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    
    // Days from view start
    const diffStart = getDaysDifference(viewStart, start);
    const duration = getDaysDifference(start, end) + 1;
    
    const left = Math.max(0, diffStart * DAY_WIDTH);
    const width = Math.max(DAY_WIDTH, duration * DAY_WIDTH);

    return {
      left: `${left}px`,
      width: `${width}px`
    };
  };

  const SubjectRow = ({ subject, colorClass }: { subject: Subject, colorClass: string }) => (
    <div className={`relative border-b border-slate-800/50 flex bg-slate-900/10 dark:bg-slate-900/20 ${compact ? 'h-10' : 'h-40'}`}>
       {/* Sticky Header */}
      <div className={`sticky left-0 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 z-20 shadow-sm flex-shrink-0 text-xs uppercase tracking-wider ${compact ? 'w-10' : 'w-24'}`}>
        {compact ? subject.substring(0, 1) : subject.substring(0, 4)}
      </div>
      
      {/* Timeline Grid */}
      <div className="flex-1 relative overflow-hidden">
         {/* Grid Lines */}
         <div className="absolute inset-0 flex pointer-events-none" style={{ width: `${daysArray.length * DAY_WIDTH}px` }}>
            {daysArray.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                return (
                 <div key={i} className={`flex-shrink-0 border-r border-slate-200/50 dark:border-slate-800/40 h-full ${isToday ? 'bg-indigo-500/5' : ''}`} style={{width: DAY_WIDTH}} />
                );
            })}
         </div>

         {/* Tiles */}
         <div className="absolute inset-y-0 left-0 py-1" style={{ width: `${daysArray.length * DAY_WIDTH}px` }}>
            {tiles.filter(t => t.subject === subject).map(tile => {
              const chapter = chapters.find(c => c.id === tile.chapterId);
              return (
                <div 
                  key={tile.id}
                  onClick={() => !readOnly && onEditTile && onEditTile(tile)}
                  className={`absolute top-1 bottom-1 rounded border p-1 md:p-2 shadow-sm group hover:z-30 transition-all cursor-pointer overflow-hidden ${colorClass} bg-opacity-20 dark:bg-opacity-20 backdrop-blur-sm border-opacity-30 hover:bg-opacity-30`}
                  style={getTileStyle(tile)}
                  title={`${chapter?.name} (${tile.startDate} to ${tile.endDate})\nNotes: ${tile.notes || 'None'}`}
                >
                  <div className="flex justify-between items-center h-full">
                    <span className="font-bold text-[10px] truncate text-slate-700 dark:text-slate-200 block w-full" >{chapter?.name || 'Unknown'}</span>
                  </div>
                  {!compact && (
                    <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 hidden md:block">
                      <div className="flex items-center gap-1 mt-1">
                          <div className="h-1 bg-slate-300 dark:bg-slate-700 flex-1 rounded-full overflow-hidden">
                              <div className="h-full bg-current" style={{ width: `${Math.min(100, (tile.attemptedQ/tile.targetQ)*100)}%` }}></div>
                          </div>
                      </div>
                      {tile.notes && (
                          <div className="mt-1.5 flex items-center gap-1 text-[9px] opacity-70 truncate">
                              <StickyNote size={8} /> {tile.notes}
                          </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 ${compact ? 'text-xs' : ''}`}>
        <div className="min-w-max">
          {/* Header Dates */}
          <div className="flex h-8 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 sticky top-0 z-30">
            <div className={`sticky left-0 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex items-center justify-center font-bold text-slate-400 shadow-sm text-xs ${compact ? 'w-10' : 'w-24'}`}>
                TL
            </div>
            {daysArray.map((date, i) => {
                const isToday = date.toDateString() === today.toDateString();
                const isExam = date.toDateString() === examDate.toDateString();
                return (
                  <div key={i} className={`flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-xs ${isToday ? 'bg-indigo-500/10' : ''} ${isExam ? 'bg-red-500/10' : ''}`} style={{width: DAY_WIDTH}}>
                    <span className={`font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : isExam ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>{date.getDate()}</span>
                    {!compact && <span className="uppercase text-[9px] text-slate-400">{date.toLocaleString('default', { month: 'short', weekday: 'short' })}</span>}
                  </div>
                );
            })}
          </div>

          <SubjectRow subject={Subject.PHYSICS} colorClass="bg-indigo-500 border-indigo-400 text-indigo-600 dark:text-indigo-400" />
          <SubjectRow subject={Subject.CHEMISTRY} colorClass="bg-emerald-500 border-emerald-400 text-emerald-600 dark:text-emerald-400" />
          <SubjectRow subject={Subject.MATHEMATICS} colorClass="bg-rose-500 border-rose-400 text-rose-600 dark:text-rose-400" />
        </div>
      </div>
  );
};