import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = ""
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background',
    'code-block'
  ];

  // Custom image handler
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        // For now, we'll just insert a placeholder
        // In a real implementation, you'd upload to your storage
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, 'image', URL.createObjectURL(file));
        }
      }
    };
  };

  useEffect(() => {
    // Remove custom image handler for now to avoid typing issues
    // The basic image functionality will still work through the toolbar
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .ql-toolbar {
            border-top: 1px solid hsl(var(--border)) !important;
            border-left: 1px solid hsl(var(--border)) !important;
            border-right: 1px solid hsl(var(--border)) !important;
            border-bottom: none !important;
            border-top-left-radius: calc(var(--radius) - 2px);
            border-top-right-radius: calc(var(--radius) - 2px);
            background: hsl(var(--muted)) !important;
            color: hsl(var(--foreground)) !important;
          }
          
          .ql-container {
            border-bottom: 1px solid hsl(var(--border)) !important;
            border-left: 1px solid hsl(var(--border)) !important;
            border-right: 1px solid hsl(var(--border)) !important;
            border-top: none !important;
            border-bottom-left-radius: calc(var(--radius) - 2px);
            border-bottom-right-radius: calc(var(--radius) - 2px);
            background: hsl(var(--background)) !important;
            color: hsl(var(--foreground)) !important;
          }
          
          .ql-editor {
            color: hsl(var(--foreground)) !important;
            min-height: 120px;
          }
          
          .ql-editor::before {
            color: hsl(var(--muted-foreground)) !important;
          }
          
          .ql-snow .ql-stroke {
            stroke: hsl(var(--foreground)) !important;
          }
          
          .ql-snow .ql-fill {
            fill: hsl(var(--foreground)) !important;
          }
          
          .ql-snow .ql-picker {
            color: hsl(var(--foreground)) !important;
          }
        `
      }} />
      <div className={`rich-text-editor ${className}`}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'calc(var(--radius) - 2px)',
          }}
        />
      </div>
    </>
  );
};

export default RichTextEditor;