import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = '', autoFocus = false }) => {
  const quillRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const modules = {
    toolbar: [
      [{ 'font': [
        '', 
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Ubuntu',
        'Source Sans Pro', 'Oswald', 'PT Sans', 'Roboto Slab', 'Nunito', 'Work Sans', 'DM Sans',
        'Manrope', 'Space Grotesk', 'Plus Jakarta Sans', 'Outfit', 'Sora', 'Epilogue', 'Figtree',
        'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Arial', 'Comic Sans MS',
        'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Crimson Pro', 'EB Garamond',
        'Libre Baskerville', 'PT Serif', 'Source Serif Pro', 'Vollkorn', 'Arvo', 'Bitter',
        'Libre Caslon Text', 'Old Standard TT', 'Domine', 'Lusitana', 'Spectral', 'Zilla Slab',
        'Dancing Script', 'Pacifico', 'Indie Flower', 'Shadows Into Light', 'Amatic SC',
        'Kalam', 'Caveat', 'Permanent Marker', 'Cinzel', 'Bodoni Moda', 'Cormorant Garamond',
        'Alegreya', 'Yeseva One', 'Taviraj', 'Trirong'
      ] }],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'font',
    'header',
    'size',
    'bold', 'italic', 'underline',
    'color', 'background',
    'list', 'bullet',
    'align'
  ];

  const handleChange = useCallback((content, delta, source, editor) => {
    const text = editor.getText();
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
    onChange(content);
  }, [onChange]);

  useEffect(() => {
    if (value) {
      const text = quillRef.current?.getEditor()?.getText() || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
    }
  }, [value]);

  // Auto-focus при монтировании компонента
  useEffect(() => {
    if (autoFocus && quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor) {
        // Небольшая задержка для гарантии, что редактор полностью инициализирован
        setTimeout(() => {
          editor.focus();
        }, 100);
      }
    }
  }, [autoFocus]);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="quill-editor"
      />
    </div>
  );
};

export default RichTextEditor;



