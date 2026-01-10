import React, { useState, useEffect } from 'react';
import { foldersAPI } from '../../api/api';
import './FolderTree.css';

const FolderTree = ({ 
  folders, 
  selectedFolder, 
  onFolderSelect, 
  onFolderCreate,
  onFolderEdit,
  onFolderDelete 
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [editingFolder, setEditingFolder] = useState(null);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const buildTree = (parentId = null) => {
    return folders
      .filter(folder => {
        if (parentId === null) return !folder.parent;
        return folder.parent === parentId;
      })
      .map(folder => ({
        ...folder,
        children: buildTree(folder.id)
      }));
  };

  const renderFolder = (folder, level = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;

    return (
      <div key={folder.id} className="folder-tree-item">
        <div
          className={`folder-tree-row ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <button
              className="folder-expand-btn"
              onClick={() => toggleFolder(folder.id)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="folder-spacer" />}
          
          <button
            className="folder-tree-btn"
            onClick={() => onFolderSelect(folder.id)}
            style={{ borderLeftColor: folder.color }}
          >
            <span className="folder-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V9C21 8.46957 20.7893 7.96086 20.4142 7.58579C20.0391 7.21071 19.5304 7 19 7H12L10 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
              </svg>
            </span>
            <span className="folder-name">{folder.name}</span>
            {folder.is_favorite && (
              <span className="folder-favorite">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </span>
            )}
            <span className="folder-count">({folder.notes_count || 0})</span>
          </button>

          <div className="folder-actions">
            <button
              className="folder-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onFolderEdit(folder);
              }}
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              className="folder-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onFolderDelete(folder.id);
              }}
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="folder-children">
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree();

  return (
    <div className="folder-tree">
      <div className="folder-tree-header">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
            <path d="M3 7V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V9C21 8.46957 20.7893 7.96086 20.4142 7.58579C20.0391 7.21071 19.5304 7 19 7H12L10 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
          </svg>
          Папки
        </h3>
        <button
          className="folder-add-btn"
          onClick={() => onFolderCreate(null)}
          title="Создать папку"
        >
          +
        </button>
      </div>

      <div className="folder-tree-list">
        <button
          className={`folder-tree-btn folder-all ${selectedFolder === null ? 'selected' : ''}`}
          onClick={() => onFolderSelect(null)}
        >
          📂 Все заметки
        </button>

        {tree.map(folder => renderFolder(folder))}
      </div>
    </div>
  );
};

export default FolderTree;








