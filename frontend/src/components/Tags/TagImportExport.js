import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { tagsAPI, foldersAPI } from '../../api/api';
import './TagImportExport.css';

const TagImportExport = ({ onImportComplete }) => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('export'); // 'export' or 'import'
  const [exportData, setExportData] = useState(null);
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const [tagsRes, foldersRes] = await Promise.all([
        tagsAPI.getAll(),
        foldersAPI.getAll()
      ]);

      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        tags: tagsRes.data || [],
        folders: foldersRes.data || []
      };

      setExportData(JSON.stringify(data, null, 2));
      setMode('export');
      setShowModal(true);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Ошибка при экспорте данных');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(importText);

      if (!data.tags || !data.folders) {
        throw new Error('Неверный формат данных');
      }

      // Импорт тегов
      for (const tag of data.tags) {
        try {
          await tagsAPI.create({
            name: tag.name,
            color: tag.color
          });
        } catch (error) {
          // Игнорируем ошибки дубликатов
          console.log('Tag already exists:', tag.name);
        }
      }

      // Импорт папок
      for (const folder of data.folders) {
        try {
          await foldersAPI.create({
            name: folder.name,
            color: folder.color,
            parent: folder.parent,
            folder_type: folder.folder_type || 'normal',
            is_favorite: folder.is_favorite || false,
            smart_rules: folder.smart_rules || {}
          });
        } catch (error) {
          console.log('Folder already exists:', folder.name);
        }
      }

      toast.success('Импорт завершен успешно!');
      setShowModal(false);
      setImportText('');
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Ошибка при импорте: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!exportData) return;

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tags_folders_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!exportData) return;
    navigator.clipboard.writeText(exportData);
    toast.success('Данные скопированы в буфер обмена!');
  };

  return (
    <>
      <div className="import-export-buttons">
        <button onClick={handleExport} className="btn-export" disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Экспорт
        </button>
        <button onClick={() => { setMode('import'); setShowModal(true); }} className="btn-import" disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Импорт
        </button>
      </div>

      {showModal && (
        <div className="import-export-modal" onClick={(e) => e.target.className === 'import-export-modal' && setShowModal(false)}>
          <div className="import-export-content">
            <div className="modal-header">
              <h3>{mode === 'export' ? 'Экспорт данных' : 'Импорт данных'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {mode === 'export' && exportData && (
              <div className="export-content">
                <p>Данные готовы к экспорту:</p>
                <textarea
                  readOnly
                  value={exportData}
                  className="export-textarea"
                />
                <div className="export-actions">
                  <button onClick={handleDownload} className="btn-download">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Скачать файл
                  </button>
                  <button onClick={handleCopy} className="btn-copy">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Копировать
                  </button>
                </div>
              </div>
            )}

            {mode === 'import' && (
              <div className="import-content">
                <p>Вставьте JSON данные для импорта:</p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="import-textarea"
                  placeholder='{"tags": [...], "folders": [...]}'
                />
                <div className="import-actions">
                  <button onClick={handleImport} className="btn-import-confirm" disabled={!importText.trim() || loading}>
                    {loading ? 'Импорт...' : 'Импортировать'}
                  </button>
                  <button onClick={() => setShowModal(false)} className="btn-cancel">
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TagImportExport;


