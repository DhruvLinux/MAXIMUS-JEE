
import React, { useState } from 'react';
import { Subject, RevisionTile, Chapter } from '../types';
import { Plus, Calendar, X } from 'lucide-react';
import { Timeline } from './Timeline';
import { getLocalISOString } from '../utils/dateUtils';
import ConfirmationModal from './ConfirmationModal';

interface RevisionViewProps {
  tiles: RevisionTile[];
  chapters: Chapter[];
  onAddTile: (tile: RevisionTile) => void;
  onUpdateTile: (tile: RevisionTile) => void;
  onDeleteTile: (id: string) => void;
}

const RevisionView: React.FC<RevisionViewProps> = ({ tiles, chapters, onAddTile, onUpdateTile, onDeleteTile }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTile, setEditingTile] = useState<RevisionTile | null>(null);
  
  // State for deleting from timeline view
  const [tileToDelete, setTileToDelete] = useState<string | null>(null);

  const handleEditClick = (tile: RevisionTile) => {
    setEditingTile(tile);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTile(null);
  };

  const handleSave = (tile: RevisionTile) => {
    if (editingTile) {
      onUpdateTile(tile);
    } else {
      onAddTile(tile);
    }
    handleModalClose();
  };
  
  const handleTimelineDeleteRequest = (id: string) => {
      setTileToDelete(id);
  }

  const confirmDelete = () => {
      if (tileToDelete) {
          onDeleteTile(tileToDelete);
          setTileToDelete(null);
          // If the modal was open for this tile, close it
          if (editingTile && editingTile.id === tileToDelete) {
              handleModalClose();
          }
      }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden relative">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
          <Calendar className="mr-2" size={20} /> Revision Planner
        </h2>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={16} /> <span>Add Revision Block</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col">
         <Timeline 
            tiles={tiles} 
            chapters={chapters} 
            onEditTile={handleEditClick} 
            onDeleteTile={handleTimelineDeleteRequest}
         />
      </div>

      {modalOpen && (
        <TileModal 
          tileToEdit={editingTile}
          chapters={chapters} 
          onClose={handleModalClose} 
          onSave={handleSave}
          onDelete={onDeleteTile}
        />
      )}
      
      <ConfirmationModal 
         isOpen={!!tileToDelete}
         title="Delete Revision Block"
         message="Are you sure you want to remove this revision block?"
         onConfirm={confirmDelete}
         onCancel={() => setTileToDelete(null)}
      />
    </div>
  );
};

const TileModal = ({ tileToEdit, chapters, onClose, onSave, onDelete }: { tileToEdit: RevisionTile | null, chapters: Chapter[], onClose: () => void, onSave: (t: RevisionTile) => void, onDelete: (id: string) => void }) => {
  const [subject, setSubject] = useState(tileToEdit ? tileToEdit.subject : Subject.PHYSICS);
  const [chapterId, setChapterId] = useState(tileToEdit ? tileToEdit.chapterId : '');
  const [start, setStart] = useState(tileToEdit ? tileToEdit.startDate : getLocalISOString(new Date()));
  const [end, setEnd] = useState(tileToEdit ? tileToEdit.endDate : getLocalISOString(new Date()));
  const [target, setTarget] = useState(tileToEdit ? tileToEdit.targetQ.toString() : '50');
  const [attempted, setAttempted] = useState(tileToEdit ? tileToEdit.attemptedQ.toString() : '0');
  const [notes, setNotes] = useState(tileToEdit ? (tileToEdit.notes || '') : '');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredChapters = chapters.filter(c => c.subject === subject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterId) return;
    
    onSave({
      id: tileToEdit ? tileToEdit.id : Date.now().toString(),
      subject,
      chapterId,
      startDate: start,
      endDate: end,
      targetQ: parseInt(target) || 0,
      attemptedQ: parseInt(attempted) || 0,
      notes: notes
    });
  };

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
      if (tileToEdit) {
          onDelete(tileToEdit.id);
          onClose();
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{tileToEdit ? 'Edit Revision' : 'Plan Revision'}</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Subject</label>
              <select 
                value={subject} 
                onChange={(e) => {
                    setSubject(e.target.value as Subject);
                    setChapterId(''); 
                }}
                disabled={!!tileToEdit}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Chapter</label>
              <select 
                required
                value={chapterId} 
                onChange={(e) => setChapterId(e.target.value)}
                disabled={!!tileToEdit}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="">Select Chapter</option>
                {filteredChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
            <input required type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">End Date</label>
            <input required type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Q Target</label>
            <input required type="number" value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
            </div>
            <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Completed</label>
            <input required type="number" value={attempted} onChange={e => setAttempted(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
            </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Plan Notes</label>
           <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Focus on theory first, then PYQs..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none h-20 text-sm"
           />
        </div>

        <div className="flex justify-between space-x-3 mt-4">
          {tileToEdit && (
              <button type="button" onClick={handleDeleteRequest} className="px-4 py-2 text-red-500 hover:text-red-400 text-sm font-bold">Delete</button>
          )}
          <div className="flex space-x-2 ml-auto">
             <button type="button" onClick={onClose} className="px-4 py-2 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">Cancel</button>
             <button type="submit" className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">Save</button>
          </div>
        </div>
      </form>
      
      <ConfirmationModal 
         isOpen={showDeleteConfirm}
         title="Delete Revision Block"
         message="Are you sure you want to delete this revision block?"
         onConfirm={confirmDelete}
         onCancel={() => setShowDeleteConfirm(false)}
         isDestructive={true}
      />
    </div>
  )
}

export default RevisionView;