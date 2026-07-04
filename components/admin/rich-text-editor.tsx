"use client";

import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import 'ckeditor5/ckeditor5.css';

// Dynamic import for CKEditor React component since it uses DOM
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);

// We must dynamically import ckeditor5 plugins as well, because they require window
const EditorWrapper = forwardRef<any, any>(({ value, onChange, onImagePickerRequest, placeholder }, ref) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editorModules, setEditorModules] = useState<any>(null);
  
  useEffect(() => {
    import('ckeditor5').then((ckeditor5) => {
       setEditorModules(ckeditor5);
       setEditorLoaded(true);
    });
  }, []);

  const editorInstanceRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    insertImages: (urls: string[]) => {
      const editor = editorInstanceRef.current;
      if (!editor) return;
      urls.forEach(url => {
          editor.execute('insertImage', { source: url });
      });
    }
  }));

  if (!editorLoaded) {
    return <div className="min-h-[400px] border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 animate-pulse" />;
  }

  const {
    ClassicEditor, Autoformat, Bold, Italic, Underline, BlockQuote, 
    Heading, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload, ImageInsert,
    Indent, IndentBlock, Link, List, MediaEmbed, Paragraph, Table, TableColumnResize, 
    TableToolbar, TableProperties, TableCellProperties, FontFamily, FontSize, FontColor, FontBackgroundColor, Alignment, Essentials, Plugin, ButtonView, SourceEditing
  } = editorModules;

  class CustomMediaPickerPlugin extends Plugin {
    init() {
        const editor = this.editor;
        editor.ui.componentFactory.add('insertMedia', (locale: any) => {
            const view = new ButtonView(locale);
            
            view.set({
                label: 'Chèn hình ảnh từ thư viện',
                icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4 17.5a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 4 2.5h12A1.5 1.5 0 0 1 17.5 4v12a1.5 1.5 0 0 1-1.5 1.5H4zm.5-13V16h11V4.5h-11zm3.87 8.35L6.16 10.3l-1.95 2.55h11.58l-3.3-4.32-4.12 5.32zM7 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>',
                tooltip: true
            });

            view.on('execute', () => {
                const openPicker = editor.config.get('openMediaPicker') as any;
                if (openPicker) {
                    openPicker();
                }
            });

            return view;
        });
    }
  }

  const editorConfig = {
    plugins: [
        Essentials, Autoformat, Bold, Italic, Underline, BlockQuote,
        Heading, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload,
        Indent, IndentBlock, Link, List, MediaEmbed, Paragraph, Table, TableColumnResize,
        TableToolbar, TableProperties, TableCellProperties, FontFamily, FontSize, FontColor, FontBackgroundColor, Alignment, SourceEditing, CustomMediaPickerPlugin
    ].filter(Boolean),
    toolbar: [
        'sourceEditing', '|', 'heading', '|',
        'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
        'bold', 'italic', 'underline', 'alignment', '|',
        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
        'insertMedia', 'link', 'blockQuote', 'insertTable', 'mediaEmbed', '|',
        'undo', 'redo'
    ],
    image: {
        toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'
        ]
    },
    placeholder: placeholder || 'Nhập nội dung...',
    openMediaPicker: onImagePickerRequest,
    licenseKey: 'GPL'
  };

  return (
    <CKEditor
        editor={ClassicEditor}
        config={editorConfig as any}
        data={value}
        onChange={(event: any, editor: any) => {
            const data = editor.getData();
            onChange(data);
        }}
        onReady={(editor: any) => {
            editorInstanceRef.current = editor;
        }}
    />
  );
});

EditorWrapper.displayName = "EditorWrapper";

export interface RichTextEditorRef {
  insertImages: (urls: string[]) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImagePickerRequest: () => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, onImagePickerRequest, placeholder, className }, ref) => {
    return (
      <div className={cn("ck-editor-container max-w-none", className)}>
        <EditorWrapper 
          ref={ref}
          value={value} 
          onChange={onChange} 
          onImagePickerRequest={onImagePickerRequest}
          placeholder={placeholder} 
        />
        <style jsx global>{`
          .ck-editor-container .ck-editor__editable_inline {
             min-height: 400px;
             max-height: 600px;
             overflow-y: auto;
          }
          .dark .ck.ck-editor__main > .ck-editor__editable {
             background: #2a303d !important;
             border-color: #4b5563 !important;
             color: #e5e7eb !important;
          }
          .dark .ck.ck-toolbar {
             background: #1f2937 !important;
             border-color: #4b5563 !important;
          }
          .dark .ck.ck-button {
             color: #e5e7eb !important;
          }
          .dark .ck.ck-button:hover {
             background: #374151 !important;
          }
          .dark .ck.ck-dropdown__panel {
             background: #1f2937 !important;
             border-color: #4b5563 !important;
          }
          .dark .ck.ck-list__item {
             background: #1f2937 !important;
             color: #e5e7eb !important;
          }
          .dark .ck.ck-list__item:hover {
             background: #374151 !important;
          }
          /* Fix ckeditor z-index issues with modals */
          .ck.ck-balloon-panel {
             z-index: 9999 !important;
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
