'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung kỷ niệm...',
  className = '',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Đang tải editor...</div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Không thể tải editor</div>
      </div>
    );
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 bg-gray-100 border-b border-gray-300">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-blue-200 text-blue-800' : 'text-gray-700 hover:text-gray-900'
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-blue-200 text-blue-800' : 'text-gray-700 hover:text-gray-900'
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-200 text-blue-800' : 'text-gray-700 hover:text-gray-900'
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-blue-200 text-blue-800' : 'text-gray-700 hover:text-gray-900'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleBlockquote}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-blue-200 text-blue-800' : 'text-gray-700 hover:text-gray-900'
          }`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[200px] bg-white">
        <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
      </div>
    </div>
  );
};

export default RichTextEditor; 