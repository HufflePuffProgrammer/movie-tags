'use client'

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface UserNote {
  id: number;
  content: string;
  created_at: string;
}

interface NotesSectionProps {
  notes: UserNote[];
  onAddNote: (content: string) => Promise<void>;
  onRemoveNote: (noteId: number) => Promise<void>;
}

export default function NotesSection({ notes, onAddNote, onRemoveNote }: NotesSectionProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    await onAddNote(newNote.trim());
    setNewNote('');
    setShowAddNote(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Personal Notes</h3>

        <button
          onClick={() => setShowAddNote(true)}
          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-s text-gray-800">
          These tags and categories have been added by community members to help analyze this movie&apos;s storytelling elements. Notes are searchable on natural language. Not exact on exact wording.</p>
          <p className="ml-2 text-s text-yellow-600 "> | User Searches | Matches Note (e.g.)
        </p>
          <p className="ml-5 text-s text-gray-400 italic">&quotmovie with good <b className="text-yellow-600">character</b> development&quot | &quot<b className="text-yellow-600">character</b> development is exceptional&quot
        </p>
        <p className="ml-5 text-s text-gray-400 italic">&quotfilm with bad <b className="text-yellow-600">dialogue</b>&quot | &quot<b className="text-yellow-600">dialogue</b> felt wooden and unnatural&quot
        </p>
        <p className="ml-5 text-s text-gray-400 italic">&quotmovie with <b className="text-yellow-600">plot twist</b>&quot | &quot<b className="text-yellow-600">plot twist</b> in the third act&quot
        </p>
      </div>
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-4 relative">
            <button
              onClick={() => onRemoveNote(note.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-gray-700 pr-8">{note.content}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(note.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {showAddNote && (
        <div className="mt-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write in natural language. Notes should match how people search for this movie..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium"
            >
              Save Note
            </button>
            <button
              onClick={() => {setShowAddNote(false); setNewNote('');}}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 && !showAddNote && (
        <p className="text-gray-500 text-center py-8 italic">
          Write in natural language. Notes should match how people search for this movie...
        </p>
      )}
    </div>
  );
}
