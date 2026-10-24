import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, EditorState } from 'lexical';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Undo,
    Redo
} from 'lucide-react';

import { $patchStyleText } from '@lexical/selection';

import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

import {
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
} from 'lexical';

import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';

import { $createQuoteNode } from '@lexical/rich-text';

import { $getSelection, $isRangeSelection } from 'lexical';
import { $setBlocksType } from '@lexical/selection';

import { $createHeadingNode } from '@lexical/rich-text';
import { $createParagraphNode } from 'lexical';

// Toolbar Plugin
function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold] = useState(false);
    const [isItalic] = useState(false);
    const [isUnderline] = useState(false);

    const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };
    const formatHeading = (
        heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'paragraph'
    ) => {
        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) return;

            if (heading === 'paragraph') {
                $setBlocksType(selection, () => $createParagraphNode());
            } else {
                $setBlocksType(selection, () => $createHeadingNode(heading));
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            $setBlocksType(selection, () => $createQuoteNode());
        });
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b-2 border-gray-200 bg-gray-50 text-black">
            <button
                type="button"
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                className="p-2 hover:bg-gray-200 rounded"
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                className="p-2 hover:bg-gray-200 rounded"
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => formatText('bold')}
                className={`p-2 hover:bg-gray-200 rounded ${isBold ? 'bg-gray-300' : ''}`}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => formatText('italic')}
                className={`p-2 hover:bg-gray-200 rounded ${isItalic ? 'bg-gray-300' : ''}`}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => formatText('underline')}
                className={`p-2 hover:bg-gray-200 rounded ${isUnderline ? 'bg-gray-300' : ''}`}
                title="Underline"
            >
                <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => formatHeading('h1')}
                className="p-2 hover:bg-gray-200 rounded"
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => formatHeading('h2')}
                className="p-2 hover:bg-gray-200 rounded"
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
                }
                className="p-2 hover:bg-gray-200 rounded"
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
                }
                className="p-2 hover:bg-gray-200 rounded"
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            $patchStyleText(selection, { color: '#000000' });
                        }
                    })
                }
                className="p-2 text-black hover:bg-gray-200 rounded"
            >
                A
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            $patchStyleText(selection, { backgroundColor: '#ffff00' });
                        }
                    })
                }
                className="p-2 text-black hover:bg-gray-200 rounded"
            >
                🖍️
            </button>

            <button
                type="button"
                onClick={formatQuote}
                className="p-2 hover:bg-gray-200 rounded"
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </button>
        </div>
    );
}

// Props for the editor
interface LexicalEditorProps {
    placeholder?: string;
    onChange?: (content: string) => void;
    initialValue?: string;
    minHeight?: string;
}

export default function LexicalEditor({
    placeholder = 'Enter text here...',
    onChange,
    minHeight = '150px'
}: LexicalEditorProps) {

    const initialConfig = {
        namespace: 'MyEditor',
        theme: {
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
            },
            heading: {
                h1: 'text-2xl font-bold',
                h2: 'text-xl font-bold',
            },
            list: {
                ul: 'list-disc list-inside',
                ol: 'list-decimal list-inside',
            },
            quote: 'border-l-4 border-gray-300 pl-4 italic',
        },
        onError: (error: Error) => {
            console.error(error);
        },
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
            HorizontalRuleNode,
        ],
    };

    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            const root = $getRoot();
            const textContent = root.getTextContent();
            if (onChange) {
                onChange(textContent);
            }
        });
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white">
                <ToolbarPlugin />
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="min-h-[150px] p-3 focus:outline-none text-black"
                                style={{ minHeight }}
                            />
                        }
                        placeholder={
                            <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={handleChange} />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <MarkdownShortcutPlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}