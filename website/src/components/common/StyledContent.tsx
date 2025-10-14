'use client';

import { useEffect, useRef } from 'react';

interface StyledContentProps {
  content: string;
  className?: string;
}

/**
 * Component for rendering HTML content with proper styling support
 * Ensures TinyMCE styles and custom classes are properly applied
 */
export default function StyledContent({ content, className = '' }: StyledContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Ensure all Tailwind classes are properly applied
      const element = contentRef.current;
      
      // Force re-render of styles by triggering a reflow
      element.style.display = 'none';
      element.offsetHeight; // Trigger reflow
      element.style.display = '';
      
      // Apply additional styling fixes for dynamic content
      const spans = element.querySelectorAll('span[class*="text-"], span[class*="bg-"]');
      spans.forEach(span => {
        // Ensure the span is treated as an inline element with proper styling
        span.setAttribute('style', `${span.getAttribute('style') || ''} display: inline;`);
      });
      
      // Fix any potential CSS specificity issues
      const styledElements = element.querySelectorAll('[class]');
      styledElements.forEach(el => {
        const classes = el.className;
        if (classes.includes('text-green-600')) {
          el.setAttribute('style', `${el.getAttribute('style') || ''} color: #059669 !important;`);
        }
        if (classes.includes('text-blue-600')) {
          el.setAttribute('style', `${el.getAttribute('style') || ''} color: #2563eb !important;`);
        }
        if (classes.includes('bg-green-100')) {
          el.setAttribute('style', `${el.getAttribute('style') || ''} background-color: #dcfce7 !important;`);
        }
        if (classes.includes('font-bold')) {
          el.setAttribute('style', `${el.getAttribute('style') || ''} font-weight: 700 !important;`);
        }
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className={`styled-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Ensure proper line height and spacing
        lineHeight: '1.6',
        // Force styles to be applied
        position: 'relative',
        zIndex: 1
      }}
    />
  );
}