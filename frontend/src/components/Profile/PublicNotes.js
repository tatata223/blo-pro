import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../api/api';
import NoteCard from '../Notes/NoteCard';
import './PublicNotes.css';

const PublicNotes = ({ userId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicNotes();
  }, [userId]);

  const loadPublicNotes = async () => {
    try {
      const response = await profileAPI.getPublicNotes(userId);
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading public notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="public-notes-loading">Загрузка заметок...</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="public-notes-empty">
        <p>Нет публичных заметок</p>
      </div>
    );
  }

  return (
    <div className="public-notes">
      <div className="public-notes-grid">
        {notes.map(note => (
          <NoteCard 
            key={note.id} 
            note={note}
            onEdit={() => {}}
            onDelete={() => {}}
            onPin={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default PublicNotes;


