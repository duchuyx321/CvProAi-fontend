import { useEffect, useMemo, useCallback, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import classNames from 'classnames/bind';
import {
    MdFormatBold,
    MdFormatItalic,
    MdFormatUnderlined,
    MdFormatListBulleted,
    MdFormatListNumbered,
} from 'react-icons/md';
import { RxFontSize } from 'react-icons/rx';
import styles from './RichTextEditor.module.scss';

const cx = classNames.bind(styles);

const FontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize || null,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) return {};
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize) =>
                ({ chain }) =>
                    chain().setMark('textStyle', { fontSize }).run(),

            unsetFontSize:
                () =>
                ({ chain }) =>
                    chain()
                        .setMark('textStyle', { fontSize: null })
                        .removeEmptyTextStyle()
                        .run(),
        };
    },
});

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32'];

const Separator = () => <span className={cx('separator')} />;

function RichTextEditor({
    value = '<p></p>',
    onChange,
    onSave,
    placeholder = 'Nhập nội dung...',
    minHeight = 180,
    showSaveButton = false,
}) {
    const [activeButtons, setActiveButtons] = useState({
        bold: false,
        italic: false,
        underline: false,
        bulletList: false,
        orderedList: false,
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            FontSize,
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'tiptap-editor',
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            onChange?.(currentEditor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor || editor.isFocused) return;

        const nextHtml = value || '<p></p>';
        const currentHtml = editor.getHTML();

        if (currentHtml !== nextHtml) {
            editor.commands.setContent(nextHtml, false);
        }
    }, [editor, value]);

    const handleSave = useCallback(() => {
        if (!editor || !onSave) return;

        onSave({
            html: editor.getHTML(),
            json: editor.getJSON(),
            text: editor.getText(),
        });
    }, [editor, onSave]);

    const handleFontSizeChange = useCallback(
        (e) => {
            if (!editor) return;

            const size = e.target.value;

            if (!size) {
                editor.chain().focus().unsetFontSize().run();
                return;
            }

            editor.chain().focus().setFontSize(`${size}px`).run();
        },
        [editor],
    );

    const toggleButton = useCallback(
        (key, command) => {
            if (!editor) return;

            command();

            setActiveButtons((prev) => ({
                ...prev,
                [key]: !prev[key],
            }));
        },
        [editor],
    );

    const toggleListButton = useCallback(
        (key) => {
            if (!editor) return;

            const isBullet = key === 'bulletList';
            const isOrdered = key === 'orderedList';

            if (!isBullet && !isOrdered) return;

            const isCurrentlyActive = activeButtons[key];

            if (isBullet) {
                editor.chain().focus().toggleBulletList().run();
            }

            if (isOrdered) {
                editor.chain().focus().toggleOrderedList().run();
            }

            setActiveButtons((prev) => ({
                ...prev,
                bulletList: isBullet ? !isCurrentlyActive : false,
                orderedList: isOrdered ? !isCurrentlyActive : false,
            }));
        },
        [editor, activeButtons],
    );

    const toolbarItems = useMemo(() => {
        if (!editor) {
            return {
                group1: [],
                group2: [],
            };
        }

        return {
            group1: [
                {
                    key: 'bold',
                    title: 'Bold (Ctrl+B)',
                    icon: <MdFormatBold size={18} />,
                    isActive: activeButtons.bold,
                    isDisabled: !editor.can().chain().focus().toggleBold().run(),
                    onClick: () =>
                        toggleButton('bold', () =>
                            editor.chain().focus().toggleBold().run(),
                        ),
                },
                {
                    key: 'italic',
                    title: 'Italic (Ctrl+I)',
                    icon: <MdFormatItalic size={18} />,
                    isActive: activeButtons.italic,
                    isDisabled: !editor.can().chain().focus().toggleItalic().run(),
                    onClick: () =>
                        toggleButton('italic', () =>
                            editor.chain().focus().toggleItalic().run(),
                        ),
                },
                {
                    key: 'underline',
                    title: 'Underline (Ctrl+U)',
                    icon: <MdFormatUnderlined size={18} />,
                    isActive: activeButtons.underline,
                    isDisabled: !editor.can().chain().focus().toggleUnderline().run(),
                    onClick: () =>
                        toggleButton('underline', () =>
                            editor.chain().focus().toggleUnderline().run(),
                        ),
                },
            ],
            group2: [
                {
                    key: 'bulletList',
                    title: 'Bullet List',
                    icon: <MdFormatListBulleted size={18} />,
                    isActive: activeButtons.bulletList,
                    isDisabled: !editor.can().chain().focus().toggleBulletList().run(),
                    onClick: () => toggleListButton('bulletList'),
                },
                {
                    key: 'orderedList',
                    title: 'Ordered List',
                    icon: <MdFormatListNumbered size={18} />,
                    isActive: activeButtons.orderedList,
                    isDisabled: !editor.can().chain().focus().toggleOrderedList().run(),
                    onClick: () => toggleListButton('orderedList'),
                },
            ],
        };
    }, [editor, activeButtons, toggleButton, toggleListButton]);

    const currentFontSize =
        editor?.getAttributes('textStyle')?.fontSize?.replace('px', '') || '';

    if (!editor) return null;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('toolbar')}>
                {toolbarItems.group1.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        title={item.title}
                        className={cx('toolbarBtn', { active: item.isActive })}
                        onClick={item.onClick}
                        disabled={item.isDisabled}
                    >
                        {item.icon}
                    </button>
                ))}

                <div className={cx('fontSizeWrap')} title="Font Size">
                    <RxFontSize size={17} />
                    <select
                        className={cx('fontSizeSelect')}
                        onChange={handleFontSizeChange}
                        value={currentFontSize}
                    >
                        <option value="">Size</option>
                        {FONT_SIZES.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <Separator />

                {toolbarItems.group2.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        title={item.title}
                        className={cx('toolbarBtn', { active: item.isActive })}
                        onClick={item.onClick}
                        disabled={item.isDisabled}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>

            <div className={cx('editorWrap')} style={{ minHeight }}>
                <EditorContent editor={editor} />
            </div>

            {showSaveButton && (
                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('saveBtn')}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}

export default RichTextEditor;