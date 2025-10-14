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
          menubar: 'file edit view insert format tools table help',
          branding: false, // Remove "Powered by TinyMCE" branding
          promotion: false, // Disable premium feature promotions
          base_url: '/tinymce', // Ensure TinyMCE uses local assets
          suffix: '.min', // Use minified versions
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount', 'emoticons',
            'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking',
            'anchor', 'toc', 'directionality', 'visualchars'
          ],
          toolbar: [
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough',
            'forecolor backcolor | alignleft aligncenter alignright alignjustify',
            'h1 h2 h3 h4 h5 h6 | bullist numlist outdent indent | blockquote hr',
            'link image table | emoticons charmap | code fullscreen | removeformat help'
          ],
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              margin: 0;
              padding: 1rem;
            }
            p { margin: 0 0 1rem 0; }
            h1, h2, h3, h4, h5, h6 { 
              margin: 1.5rem 0 1rem 0; 
              font-weight: 600;
              color: #1e40af;
            }
            h1 { font-size: 2.25rem; color: #1e3a8a; }
            h2 { font-size: 1.875rem; color: #1e40af; }
            h3 { font-size: 1.5rem; color: #2563eb; }
            h4 { font-size: 1.25rem; color: #3b82f6; }
            h5 { font-size: 1.125rem; color: #3b82f6; }
            h6 { font-size: 1rem; color: #3b82f6; }
            ul, ol { margin: 0 0 1rem 0; padding-left: 2rem; }
            li { margin: 0.25rem 0; }
            blockquote { 
              margin: 1rem 0; 
              padding: 1rem; 
              border-left: 4px solid #059669; 
              background: #d1fae5;
              font-style: italic;
              border-radius: 0 0.375rem 0.375rem 0;
            }
            a {
              color: #2563eb;
              text-decoration: underline;
            }
            a:hover {
              color: #1d4ed8;
            }
            strong, b {
              font-weight: 600;
              color: #374151;
            }
            em, i {
              font-style: italic;
              color: #4b5563;
            }
            code {
              background: #f3f4f6;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-family: 'Courier New', monospace;
              font-size: 0.875rem;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1rem 0;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 0.5rem;
              text-align: left;
            }
            th {
              background: #f3f4f6;
              font-weight: 600;
            }
            /* Custom church styles */
            .bg-green-100 { background-color: #dcfce7; }
            .text-green-800 { color: #166534; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .rounded { border-radius: 0.25rem; }
            .bg-green-600 { background-color: #059669; }
            .text-white { color: #ffffff; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .rounded-md { border-radius: 0.375rem; }
            .border-l-4 { border-left-width: 4px; }
            .border-blue-500 { border-color: #3b82f6; }
            .bg-blue-50 { background-color: #eff6ff; }
          `,
          // Custom toolbar groups and spacing
          toolbar_mode: 'sliding',
          toolbar_sticky: true,
          
          // Content styling
          content_css: false,
          placeholder: placeholder,
          resize: true,
          elementpath: false,
          statusbar: true,
          // Custom color palette matching the website theme
          color_map: [
            // Primary brand colors
            'Church Blue', '#1e40af',
            'Church Green', '#059669', 
            'Church Light Blue', '#3b82f6',
            'Church Light Green', '#10b981',
            
            // Text colors
            'Dark Gray', '#374151',
            'Medium Gray', '#6b7280',
            'Light Gray', '#9ca3af',
            'White', '#ffffff',
            'Black', '#000000',
            
            // Accent colors
            'Red', '#ef4444',
            'Orange', '#f97316',
            'Yellow', '#eab308',
            'Purple', '#8b5cf6',
            'Pink', '#ec4899',
            'Indigo', '#6366f1',
            
            // Background colors
            'Light Blue BG', '#dbeafe',
            'Light Green BG', '#d1fae5',
            'Light Gray BG', '#f3f4f6',
            'Light Yellow BG', '#fef3c7'
          ],
          
          // Font size options - more comprehensive
          fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 36px 42px 48px 54px 60px 66px 72px 96px',
          
          // Font family options
          font_family_formats: 
            'Andale Mono=andale mono,times;' +
            'Arial=arial,helvetica,sans-serif;' +
            'Arial Black=arial black,avant garde;' +
            'Book Antiqua=book antiqua,palatino;' +
            'Comic Sans MS=comic sans ms,sans-serif;' +
            'Courier New=courier new,courier;' +
            'Georgia=georgia,palatino;' +
            'Helvetica=helvetica;' +
            'Impact=impact,chicago;' +
            'Symbol=symbol;' +
            'Tahoma=tahoma,arial,helvetica,sans-serif;' +
            'Terminal=terminal,monaco;' +
            'Times New Roman=times new roman,times;' +
            'Trebuchet MS=trebuchet ms,geneva;' +
            'Verdana=verdana,geneva;' +
            'Webdings=webdings;' +
            'Wingdings=wingdings,zapf dingbats;' +
            'Inter=Inter,ui-sans-serif,system-ui,sans-serif;' +
            'Roboto=Roboto,ui-sans-serif,system-ui,sans-serif;' +
            'Playfair Display=Playfair Display,serif;' +
            'Montserrat=Montserrat,sans-serif;',
            
          // Block formats - Enhanced heading support
          block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre; Blockquote=blockquote; Div=div',
            
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
            },
            'church-button': {
              inline: 'span',
              classes: 'bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer'
            },
            'large-text': {
              inline: 'span',
              styles: { fontSize: '1.25rem', fontWeight: 'bold' }
            },
            'small-text': {
              inline: 'span',
              styles: { fontSize: '0.875rem', color: '#6b7280' }
            },
            // Font weight formats
            'font-light': {
              inline: 'span',
              styles: { fontWeight: '300' }
            },
            'font-normal': {
              inline: 'span',
              styles: { fontWeight: '400' }
            },
            'font-medium': {
              inline: 'span',
              styles: { fontWeight: '500' }
            },
            'font-semibold': {
              inline: 'span',
              styles: { fontWeight: '600' }
            },
            'font-bold': {
              inline: 'span',
              styles: { fontWeight: '700' }
            },
            'font-extrabold': {
              inline: 'span',
              styles: { fontWeight: '800' }
            },
            'font-black': {
              inline: 'span',
              styles: { fontWeight: '900' }
            }
          },
          style_formats: [
            { title: 'Headers', items: [
              { title: 'Heading 1', format: 'h1' },
              { title: 'Heading 2', format: 'h2' },
              { title: 'Heading 3', format: 'h3' },
              { title: 'Heading 4', format: 'h4' },
              { title: 'Heading 5', format: 'h5' },
              { title: 'Heading 6', format: 'h6' }
            ]},
            { title: 'Font Weight', items: [
              { title: 'Light (300)', format: 'font-light' },
              { title: 'Normal (400)', format: 'font-normal' },
              { title: 'Medium (500)', format: 'font-medium' },
              { title: 'Semibold (600)', format: 'font-semibold' },
              { title: 'Bold (700)', format: 'font-bold' },
              { title: 'Extra Bold (800)', format: 'font-extrabold' },
              { title: 'Black (900)', format: 'font-black' }
            ]},
            { title: 'Text Formatting', items: [
              { title: 'Bold', format: 'bold' },
              { title: 'Italic', format: 'italic' },
              { title: 'Underline', format: 'underline' },
              { title: 'Strikethrough', format: 'strikethrough' },
              { title: 'Code', format: 'code' }
            ]},
            { title: 'Church Styles', items: [
              { title: 'Church Highlight', format: 'church-highlight' },
              { title: 'Scripture Quote', format: 'scripture-quote' },
              { title: 'Button Style', format: 'church-button' },
              { title: 'Large Text', format: 'large-text' },
              { title: 'Small Text', format: 'small-text' }
            ]},
            { title: 'Blocks', items: [
              { title: 'Paragraph', format: 'p' },
              { title: 'Blockquote', format: 'blockquote' },
              { title: 'Div', format: 'div' }
            ]}
          ],
          // Content filtering
          valid_elements: '*[*]',
          extended_valid_elements: 'span[*],div[*],p[*],a[*],strong,em,b,i,u,h1,h2,h3,h4,h5,h6,ul,ol,li,blockquote,img[*]',
          // Auto-save
          save_onsavecallback: function () {
            // Auto-save functionality can be added here
            console.log('Auto-saving content...');
          },
          
          // Setup callback to ensure toolbar is properly initialized
          setup: function (editor) {
            editor.on('init', function () {
              console.log('TinyMCE editor initialized with enhanced toolbar');
            });
          }
        }}
      />
    </div>
  );
}