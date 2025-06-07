
import React from 'react';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono',
  },
  heading: {
    h1: 'text-2xl font-bold mb-4',
    h2: 'text-xl font-bold mb-3',
    h3: 'text-lg font-bold mb-2',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal list-inside mb-4',
    ul: 'list-disc list-inside mb-4',
    listitem: 'mb-1',
  },
  quote: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4',
  code: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4',
  link: 'text-blue-600 dark:text-blue-400 underline hover:no-underline',
};

const initialConfig = {
  namespace: 'StackTokenEditor',
  theme,
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
};

interface RichTextEditorProps {
  placeholder?: string;
  value?: string;
  onChange?: (html: string) => void;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  placeholder = 'Enter your text...',
  value = '',
  onChange,
  className = '',
}) => {
  const handleOnChange = (editorState: EditorState, editor: any) => {
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onChange?.(htmlString);
    });
  };

  return (
    <div className={`border border-input rounded-md ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[200px] p-4 outline-none resize-none text-sm" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-500 pointer-events-none text-sm">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleOnChange} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </LexicalComposer>
    </div>
  );
};
