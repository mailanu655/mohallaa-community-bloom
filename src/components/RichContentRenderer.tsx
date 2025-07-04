interface RichContentRendererProps {
  content: string;
  richContent?: { html: string } | null;
  className?: string;
  maxLength?: number;
}

const RichContentRenderer: React.FC<RichContentRendererProps> = ({ 
  content, 
  richContent, 
  className = "",
  maxLength 
}) => {
  // Use rich content if available, otherwise fall back to plain text
  const displayContent = richContent?.html || content;
  
  // Truncate content if maxLength is specified
  const truncatedContent = maxLength && displayContent.length > maxLength
    ? displayContent.substring(0, maxLength) + '...'
    : displayContent;

  if (richContent?.html) {
    return (
      <div 
        className={`rich-content prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: truncatedContent }}
        style={{
          // Override prose styles to match our theme
          '--tw-prose-body': 'hsl(var(--foreground))',
          '--tw-prose-headings': 'hsl(var(--foreground))',
          '--tw-prose-links': 'hsl(var(--primary))',
          '--tw-prose-bold': 'hsl(var(--foreground))',
          '--tw-prose-quotes': 'hsl(var(--muted-foreground))',
          '--tw-prose-quote-borders': 'hsl(var(--border))',
          '--tw-prose-code': 'hsl(var(--foreground))',
          '--tw-prose-pre-bg': 'hsl(var(--muted))',
        } as React.CSSProperties}
      />
    );
  }

  return (
    <div className={`text-foreground ${className}`}>
      {truncatedContent}
    </div>
  );
};

export default RichContentRenderer;