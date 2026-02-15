/**
 * G-Nexus Markdown Renderer
 * Renders markdown content with syntax highlighting
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Simple markdown parser (for demo - in production use react-markdown or similar)
function parseMarkdown(content: string): string {
    let html = content;

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="header-h3">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="header-h2">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="header-h1">$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener">$1</a>');

    // Lists
    html = html.replace(/^\s*[-*]\s+(.*$)/gm, '<li class="list-item">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="markdown-list">$1</ul>');

    // Numbered lists
    html = html.replace(/^\s*\d+\.\s+(.*$)/gm, '<li class="list-item-ordered">$1</li>');

    // Blockquotes
    html = html.replace(/^>\s+(.*$)/gm, '<blockquote class="blockquote">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="markdown-hr" />');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="paragraph">');
    html = `<p class="paragraph">${html}</p>`;

    return html;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    const html = useMemo(() => parseMarkdown(content), [content]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`markdown-content ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default MarkdownRenderer;
