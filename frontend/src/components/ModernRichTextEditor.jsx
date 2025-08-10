import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const ModernRichTextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const [content, setContent] = useState(value || '');

  const handleChange = (val) => {
    setContent(val || '');
    onChange(val || '');
  };

  // Add custom styles to document head
  useEffect(() => {
    const styleId = 'modern-editor-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .modern-editor-container {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }
        
        .w-md-editor {
          background-color: white !important;
        }
        
        .w-md-editor-text-container {
          font-size: 18px !important;
          line-height: 1.6 !important;
          font-family: medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif !important;
        }
        
        .w-md-editor-text {
          font-size: 18px !important;
          line-height: 1.6 !important;
          color: rgba(0, 0, 0, 0.8) !important;
          padding: 20px !important;
          min-height: 400px !important;
        }
        
        .w-md-editor-text::placeholder {
          color: #9ca3af !important;
          font-style: italic;
        }
        
        .w-md-editor-preview {
          padding: 20px !important;
          font-size: 18px !important;
          line-height: 1.6 !important;
          font-family: medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif !important;
        }
        
        .w-md-editor-toolbar {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 8px 12px !important;
        }
        
        .w-md-editor-toolbar ul li button {
          color: #6b7280 !important;
          border-radius: 4px !important;
          padding: 6px 8px !important;
          margin: 0 2px !important;
        }
        
        .w-md-editor-toolbar ul li button:hover {
          background: #e5e7eb !important;
          color: #374151 !important;
        }
        
        .w-md-editor-toolbar ul li button.active {
          background: #ddd6fe !important;
          color: #7c3aed !important;
        }
        
        /* Hide some toolbar items for cleaner look */
        .w-md-editor-toolbar ul li:nth-child(n+15) {
          display: none !important;
        }
        
        /* Style the preview/edit tabs */
        .w-md-editor-toolbar-mode {
          background: #f3f4f6 !important;
          border-radius: 6px !important;
          padding: 2px !important;
        }
        
        .w-md-editor-toolbar-mode button {
          border-radius: 4px !important;
          padding: 6px 12px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
        }
        
        .w-md-editor-toolbar-mode button.active {
          background: white !important;
          color: #7c3aed !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        
        /* Custom scrollbar */
        .w-md-editor-text::-webkit-scrollbar {
          width: 8px;
        }
        
        .w-md-editor-text::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .w-md-editor-text::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .w-md-editor-text::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Focus styles */
        .w-md-editor-focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1) !important;
        }
        
        /* Markdown preview styling */
        .wmde-markdown h1, .wmde-markdown h2, .wmde-markdown h3 {
          color: #1f2937 !important;
          font-weight: 600 !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
        }
        
        .wmde-markdown p {
          margin-bottom: 1.5rem !important;
          color: rgba(0, 0, 0, 0.8) !important;
        }
        
        .wmde-markdown blockquote {
          border-left: 4px solid #e5e7eb !important;
          padding-left: 1rem !important;
          margin: 1.5rem 0 !important;
          font-style: italic !important;
          color: #6b7280 !important;
        }
        
        .wmde-markdown ul, .wmde-markdown ol {
          padding-left: 2rem !important;
          margin: 1rem 0 !important;
        }
        
        .wmde-markdown li {
          margin: 0.5rem 0 !important;
        }
        
        .wmde-markdown code {
          background: #f3f4f6 !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-size: 0.9em !important;
        }
        
        .wmde-markdown pre {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          padding: 1rem !important;
          margin: 1.5rem 0 !important;
          overflow-x: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="modern-editor-container">
      <MDEditor
        value={content}
        onChange={handleChange}
        preview="edit"
        hideToolbar={false}
        textareaProps={{
          placeholder: placeholder,
          style: {
            fontSize: 18,
            lineHeight: 1.6,
            fontFamily: 'medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
          }
        }}
        height={400}
        data-color-mode="light"
      />
    </div>
  );
};

export default ModernRichTextEditor;
