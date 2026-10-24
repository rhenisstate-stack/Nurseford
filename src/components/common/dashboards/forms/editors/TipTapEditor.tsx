import React from 'react'
import '@/styles/dashboards/editors/tiptap/global.css'  // Ensure global styles are imported

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { FontFamily } from '@tiptap/extension-font-family'

import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Underline from '@tiptap/extension-underline'


interface EditorProps {
    value?: string
    onChange?: (html: string) => void
    minHeight?: string
    placeholder?: string
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export default function RichTextEditor({
    value = '',
    onChange,
    minHeight = '150px',
    placeholder = '',
}: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Underline,
            Highlight.configure({ multicolor: true }),
            FontFamily,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false }),
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value,
        editorProps: {
            attributes: {
                placeholder,
            },
        },
        onUpdate({ editor }) {
            onChange?.(editor.getHTML())
        },
        immediatelyRender: false,  // Tells TipTap: “Don’t try to render on the server. Only render when in the browser.”
    })
    if (!editor) return null


    const btn =
        'px-2 py-1 text-sm text-gray-800 border rounded bg-white hover:bg-blue-100 active:bg-blue-200 transition';

    const isActive = (active: boolean) =>
        active
            ? 'bg-blue-200 border-blue-400 text-blue-900'
            : 'bg-white border-gray-300 text-gray-800';


    return (
        <div className="border-2 border-blue-300 rounded-lg bg-white">
            {/* TOOLBAR */}
            {/* TOOLBAR */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">

                {/* Undo / Redo */}
                <button type="button" className={btn} onClick={() => editor.chain().focus().undo().run()}>↶</button>
                <button type="button" className={btn} onClick={() => editor.chain().focus().redo().run()}>↷</button>

                {/* Divider */}
                <span className="mx-1 text-gray-300">|</span>

                {/* Headings */}
                <select
                    className="px-2 py-1 text-sm text-gray-800 border rounded bg-white"
                    onChange={(e) => {
                        const v = e.target.value
                        if (v === 'p') editor.chain().focus().setParagraph().run()
                        else editor.chain().focus().toggleHeading({ level: Number(v) as HeadingLevel }).run()
                    }}
                >
                    <option value="p">Normal</option>
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                    <option value="4">H4</option>
                    <option value="5">H5</option>
                    <option value="6">H6</option>
                </select>
            
                {/* Font family */}
                <select
                    className="px-2 py-1 text-sm text-gray-800 border rounded bg-white"
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                >
                    <option value="">Font</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Trebuchet MS">Trebuchet</option>
                    <option value="monospace">Monospace</option>
                </select>


                <span className="mx-1 text-gray-300">|</span>

                {/* Formatting */}
                <button type="button" className={`${btn} ${isActive(editor.isActive('bold'))}`} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
                <button type="button" className={`${btn} ${isActive(editor.isActive('italic'))}`} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
                <button type="button" className={`${btn} ${isActive(editor.isActive('underline'))}`} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
                <button type="button" className={`${btn} ${isActive(editor.isActive('strike'))}`} onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
                <button type="button" className={`${btn} ${isActive(editor.isActive('code'))}`} onClick={() => editor.chain().focus().toggleCode().run()}>&lt;/&gt;</button>

                <span className="mx-1 text-gray-300">|</span>

                {/* Colors */}
                <div className="flex items-center gap-1">

                    {/* Text Color */}
                    <label className="relative flex items-center justify-center w-8 h-8 border rounded bg-white cursor-pointer hover:bg-blue-100">
                        <span className="text-sm font-bold text-gray-800 border-b-2 border-current">
                            A
                        </span>
                        <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) =>
                                editor.chain().focus().setColor(e.target.value).run()
                            }
                            title="Text color"
                        />
                    </label>

                    {/* Highlight Color */}
                    <label className="relative flex items-center justify-center w-8 h-8 border rounded bg-white cursor-pointer hover:bg-blue-100">
                        <span className="text-sm font-bold text-gray-800 px-1"
                            style={{ backgroundColor: '#fde68a' }}>
                            A
                        </span>
                        <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) =>
                                editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
                            }
                            title="Highlight color"
                        />
                    </label>

                </div>


                <span className="mx-1 text-gray-300">|</span>

                {/* Alignment */}
                <select
                    className="px-2 py-1 text-sm text-gray-800 border rounded bg-white"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value as "left" | "center" | "right" | "justify";
                        editor.chain().focus().setTextAlign(value).run();
                    }}
                >
                    <option value="left">Align Left</option>
                    <option value="center">Align Center</option>
                    <option value="right">Align Right</option>
                    <option value="justify">Justify</option>
                </select>


                <span className="mx-1 text-gray-300">|</span>

                {/* Lists */}
                <button type="button" className={`${btn} ${isActive(editor.isActive('bulletList'))}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
                <button type="button" className={`${btn} ${isActive(editor.isActive('orderedList'))}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>

                <span className="mx-1 text-gray-300">|</span>

                {/* Blocks */}
                <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
                <button type="button" className={btn} onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</button>

                <span className="mx-1 text-gray-300">|</span>

                {/* Link */}
                <button
                    type="button"
                    className={btn}
                    onClick={() => {
                        const url = prompt('Enter URL')
                        if (url) editor.chain().focus().setLink({ href: url }).run()
                    }}
                >
                    🔗
                </button>

                {/* Image */}
                <button
                    type="button"
                    className={btn}
                    onClick={() => {
                        const url = prompt('Image URL')
                        if (url) editor.chain().focus().setImage({ src: url }).run()
                    }}
                >
                    🖼
                </button>

                {/* Table */}
                <button
                    type="button"
                    className={btn}
                    onClick={() =>
                        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    }
                >
                    ⊞ Table
                </button>

                <span className="mx-1 text-gray-300">|</span>

                {/* Clear */}
                <button
                    type="button"
                    className="px-2 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-100"
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                >
                    ✖ Clear
                </button>
            </div>

            {/* EDITOR */}
            <div
                className="border-t rounded-b-lg focus-within:ring-2 ring-blue-800 resize-y overflow-auto"
                style={{ minHeight }}
            >
                <EditorContent editor={editor} />
            </div>

        </div>
    )
}
