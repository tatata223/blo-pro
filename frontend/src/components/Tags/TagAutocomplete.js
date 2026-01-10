import React, { useState, useEffect, useRef } from 'react';
import { tagsAPI } from '../../api/api';
import './TagAutocomplete.css';

const TagAutocomplete = ({ onSelect, selectedTags = [], placeholder = 'Добавить тег...' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await tagsAPI.autocomplete(query);
      const filtered = (response.data || []).filter(
        tag => !selectedTags.includes(tag.id)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSelect = (tag) => {
    if (onSelect) {
      onSelect(tag);
    }
    setQuery('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleCreateNew = () => {
    if (query.trim() && onSelect) {
      // Создаем новый тег
      onSelect({ name: query.trim(), isNew: true });
      setQuery('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="tag-autocomplete">
      <div className="tag-autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="tag-autocomplete-input"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
        />
        {loading && <span className="autocomplete-loading">⏳</span>}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="tag-autocomplete-suggestions">
          {suggestions.map(tag => (
            <div
              key={tag.id}
              className="tag-suggestion-item"
              onClick={() => handleSelect(tag)}
              style={{ borderLeftColor: tag.color }}
            >
              <span className="tag-suggestion-name">{tag.name}</span>
              <span className="tag-suggestion-count">({tag.notes_count || 0})</span>
            </div>
          ))}
          {query.trim() && !suggestions.find(t => t.name.toLowerCase() === query.toLowerCase()) && (
            <div
              className="tag-suggestion-item tag-suggestion-create"
              onClick={handleCreateNew}
            >
              <span>+ Создать тег "{query.trim()}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagAutocomplete;








