'use client';

import { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = 400,
  disabled = false,
  className = ''
}: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <Editor
        licenseKey="gpl"  // Use GPL license for open source
        tinymceScriptSrc="/tinymce/tinymce.min.js"  // Use local TinyMCE script
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        disabled={disabled}
        init={{
          height: height,
          menubar: false,
          branding: false, // Remove "Powered by TinyMCE" branding
          promotion: false, // Disable premium feature promotions
          base_url: '/tinymce', // Ensure TinyMCE uses local assets
          suffix: '.min', // Use minified versions
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
            }
            p { margin: 0 0 1rem 0; }
            h1, h2, h3, h4, h5, h6 { 
              margin: 1.5rem 0 1rem 0; 
              font-weight: 600;
            }
            h1 { font-size: 2.25rem; }
            h2 { font-size: 1.875rem; }
            h3 { font-size: 1.5rem; }
            h4 { font-size: 1.25rem; }
            ul, ol { margin: 0 0 1rem 0; padding-left: 2rem; }
            blockquote { 
              margin: 1rem 0; 
              padding: 1rem; 
              border-left: 4px solid #e5e7eb; 
              background: #f9fafb;
              font-style: italic;
            }
          `,
          placeholder: placeholder,
          resize: true,
          elementpath: false,
          statusbar: true,
          // Custom color palette matching the website theme
          color_map: [
            'Blue', '#3b82f6',
            'Green', '#10b981',
            'Emerald', '#059669',
            'Gray', '#6b7280',
            'Red', '#ef4444',
            'Yellow', '#f59e0b',
            'Purple', '#8b5cf6',
            'Pink', '#ec4899'
          ],
          // Link handling
          link_default_target: '_blank',
          link_assume_external_targets: true,
          // Image handling - simplified for now
          // images_upload_handler: Custom handler can be added later
          // Paste handling
          paste_data_images: true,
          paste_as_text: false,
          // Custom formats
          formats: {
            'church-highlight': {
              inline: 'span',
              classes: 'bg-green-100 text-green-800 px-2 py-1 rounded'
            },
            'scripture-quote': {
              block: 'blockquote',
              classes: 'border-l-4 border-blue-500 bg-blue-50 p-4 italic'
            }
          },
          style_formats: [
            {
              title: 'Church Highlight',
              format: 'church-highlight'
            },
            {
              title: 'Scripture Quote',
              format: 'scripture-quote'
            }
          ],
          // Content filtering
          valid_elements: '*[*]',
          extended_valid_elements: 'span[*],div[*],p[*],a[*],strong,em,b,i,u,h1,h2,h3,h4,h5,h6,ul,ol,li,blockquote,img[*]',
          // Auto-save
          save_onsavecallback: function () {
            // Auto-save functionality can be added here
            console.log('Auto-saving content...');
          }
        }}
      />
    </div>
  );
}