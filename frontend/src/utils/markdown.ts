import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({
  html: false, // Disable HTML tags in markdown for security
  breaks: true, // Convert \n to <br>
  linkify: true, // Auto-convert URLs to links
  typographer: true, // Enable smartquotes and other typographic replacements
});

export function renderMarkdown(content: string): string {
  const rendered = md.render(content);
  return DOMPurify.sanitize(rendered, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote',
      'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}
