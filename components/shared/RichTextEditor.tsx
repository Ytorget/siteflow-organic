import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Code,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Skriv något...',
  minHeight = '150px',
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={toggleBold}
          disabled={disabled}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('bold') ? 'bg-slate-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Fet (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleItalic}
          disabled={disabled}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('italic') ? 'bg-slate-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Kursiv (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={toggleBulletList}
          disabled={disabled}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-slate-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Punktlista"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleOrderedList}
          disabled={disabled}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-slate-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Numrerad lista"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={setLink}
          disabled={disabled}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('link') ? 'bg-slate-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Lägg till länk"
        >
          <Link2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleCode}
          disabled={disabled}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('code') ? 'bg-slate-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Kod (inline)"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={undo}
          disabled={disabled || !editor.can().undo()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            disabled || !editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Ångra (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={disabled || !editor.can().redo()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${
            disabled || !editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Gör om (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4"
        style={{ minHeight }}
      />

      <style>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
        }

        .ProseMirror code {
          background-color: #f1f3f5;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Courier New', monospace;
        }

        .ProseMirror pre {
          background-color: #f1f3f5;
          padding: 0.75rem;
          border-radius: 0.375rem;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
        }

        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #1e40af;
        }

        .ProseMirror strong {
          font-weight: 600;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3 {
          font-weight: 600;
          margin: 1rem 0 0.5rem;
        }

        .ProseMirror h1 {
          font-size: 1.5rem;
        }

        .ProseMirror h2 {
          font-size: 1.25rem;
        }

        .ProseMirror h3 {
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
