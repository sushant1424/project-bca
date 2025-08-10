import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import ImageInsertDialog from './ImageInsertDialog';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4, 
  Link, 
  ImageIcon, 
  Minus 
} from 'lucide-react';

const SubstackEditor = ({ value, onChange, placeholder = "Tell your story..." }) => {
  const [showImageDialog, setShowImageDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4',
      },
    },
  });

  // Update editor content when value prop changes (important for editing posts)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    setShowImageDialog(true);
  };

  const handleImageInsert = (url, altText) => {
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: altText }).run();
    }
    setShowImageDialog(false);
  };

  return (
    <div className="substack-editor border border-gray-200 rounded-lg bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex items-center gap-1 bg-gray-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={() => {
            if (editor.isActive('heading', { level: 1 })) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().setHeading({ level: 1 }).run();
            }
          }}
          className={`px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Heading 1"
        >
          H1
        </button>

        <button
          onClick={() => {
            if (editor.isActive('heading', { level: 2 })) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().setHeading({ level: 2 }).run();
            }
          }}
          className={`px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Heading 2"
        >
          H2
        </button>

        <button
          onClick={() => {
            if (editor.isActive('heading', { level: 3 })) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().setHeading({ level: 3 }).run();
            }
          }}
          className={`px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 4 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Heading 4"
        >
          H4
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Bullet List"
        >
          <List size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Quote"
        >
          <Quote size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('link') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
          }`}
          title="Add Link"
        >
          <Link size={18} />
        </button>

        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
          title="Insert Image"
        >
          <ImageIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
          title="Horizontal Rule"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor}
          className="substack-editor-content"
        />
      </div>

      <style>{`
        /* Editor content styles */
        .substack-editor-content .ProseMirror {
          outline: none;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 18px;
          line-height: 1.7;
          color: #1a1a1a;
          padding: 24px;
          min-height: 400px;
          white-space: pre-wrap;
        }

        /* Placeholder styles */
        .substack-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }

        /* Heading styles */
        .substack-editor-content .ProseMirror h1 {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1a1a1a;
        }

        .substack-editor-content .ProseMirror h2 {
          font-size: 2rem;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #1a1a1a;
        }

        .substack-editor-content .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
        }

        .substack-editor-content .ProseMirror h4 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
        }

        .substack-editor-content .ProseMirror h5 {
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
        }

        .substack-editor-content .ProseMirror h6 {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
        }

        .substack-editor-content .ProseMirror p {
          margin-bottom: 1.25rem;
          font-size: 20px;
          line-height: 1.6;
        }

        .substack-editor-content .ProseMirror strong {
          font-weight: 600;
          color: #1a1a1a;
        }

        .substack-editor-content .ProseMirror em {
          font-style: italic;
        }

        .substack-editor-content .ProseMirror ul {
          list-style-type: disc;
          padding-left: 2rem;
          margin: 1rem 0;
        }

        .substack-editor-content .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 2rem;
          margin: 1rem 0;
        }

        .substack-editor-content .ProseMirror li {
          display: list-item;
          margin: 0.5rem 0;
          font-size: 20px;
          line-height: 1.6;
        }

        .substack-editor-content .ProseMirror ul li {
          list-style-type: disc;
        }

        .substack-editor-content .ProseMirror ol li {
          list-style-type: decimal;
        }

        /* Force list styles to override any global resets */
        .substack-editor-content .ProseMirror ul li::marker {
          content: "•";
          color: #374151;
        }

        .substack-editor-content .ProseMirror ol li::marker {
          color: #374151;
        }

        /* Ensure list items have proper spacing and display */
        .substack-editor-content .ProseMirror ul,
        .substack-editor-content .ProseMirror ol {
          list-style-position: outside !important;
        }

        .substack-editor-content .ProseMirror li {
          display: list-item !important;
          list-style-position: outside !important;
        }

        .substack-editor-content .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
          font-size: 20px;
        }

        .substack-editor-content .ProseMirror hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2rem 0;
        }

        .substack-editor-content .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .substack-editor-content .ProseMirror a:hover {
          color: #1d4ed8;
        }

        .substack-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
          display: block;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Focus styles */
        .substack-editor:focus-within {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        /* Selection styles */
        .substack-editor-content .ProseMirror ::selection {
          background: rgba(124, 58, 237, 0.2);
        }
      `}</style>

      {/* Image Insert Dialog */}
      <ImageInsertDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};

export default SubstackEditor;
