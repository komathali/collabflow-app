'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered } from 'lucide-react';
import { WikiPage } from '@/lib/types';
import { useDebouncedCallback } from 'use-debounce';
import { useDataService } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="p-2 border-b flex flex-wrap items-center gap-1">
      <Button
        size="sm"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('code') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Button>
       <Button
        size="sm"
        variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
       <Button
        size="sm"
        variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
       <Button
        size="sm"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function RichTextEditor({ page }: { page: WikiPage }) {
  const dataService = useDataService();
  const { toast } = useToast();

  const debouncedUpdate = useDebouncedCallback(async (editor) => {
    const json = editor.getJSON();
    try {
      await dataService.updateWikiPage(page.projectId, page.id, { content: JSON.stringify(json) });
      toast({
        title: 'Saved',
        description: `"${page.title}" has been saved.`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to save page:', error);
       toast({
        title: 'Save failed',
        description: 'Could not save your changes.',
        variant: 'destructive'
      });
    }
  }, 2000);

  const editor = useEditor({
    extensions: [StarterKit],
    content: page.content ? JSON.parse(page.content) : `<h1.>${page.title}</h1><p></p>`,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none flex-1',
      },
    },
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor);
    },
  });

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}