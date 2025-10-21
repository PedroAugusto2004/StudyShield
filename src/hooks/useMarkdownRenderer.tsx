import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import DOMPurify from "dompurify";

export const useMarkdownRenderer = (isDark: boolean) => {
  const parseInlineMarkdown = (text: string) => {
    if (typeof text !== 'string') return text;
    
    // Sanitize input to prevent XSS
    const sanitizedText = DOMPurify.sanitize(text, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    });
    
    const parts = sanitizedText.split(/(\*\*[^*]*\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const content = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{content}</strong>;
      }
      return part;
    }).filter(part => part !== '');
  };

  const renderContent = (content: string): JSX.Element[] => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (!line) {
        i++;
        continue;
      }
      
      // Tables
      if (line.includes('|') && lines[i + 1]?.includes('|')) {
        const tableLines = [];
        let j = i;
        while (j < lines.length && lines[j].includes('|')) {
          tableLines.push(lines[j]);
          j++;
        }
        
        if (tableLines.length >= 2) {
          const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h).map(h => parseInlineMarkdown(h));
          const rows = tableLines.slice(2).map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell).map(cell => parseInlineMarkdown(cell))
          );
          
          elements.push(
            <div key={i} className="mb-4 overflow-x-auto">
              <table className={`w-full border-collapse border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                <thead>
                  <tr className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>
                    {headers.map((header, idx) => (
                      <th key={idx} className={`border px-3 py-2 text-left text-sm font-medium ${isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className={`border px-3 py-2 text-sm ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          i = j;
          continue;
        }
      }
      
      // Code blocks
      if (line.startsWith('```')) {
        const language = line.substring(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        elements.push(
          <div key={i} className="mb-4">
            <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
              {language && (
                <div className={`px-4 py-2 text-xs font-medium flex items-center justify-between ${isDark ? 'bg-gray-800 text-gray-300 border-b border-gray-700' : 'bg-gray-200 text-gray-600 border-b border-gray-300'}`}>
                  <span>{language}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(codeLines.join('\n'))}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <pre className={`p-4 text-sm overflow-x-auto ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                <code>{codeLines.join('\n')}</code>
              </pre>
            </div>
          </div>
        );
        i++;
        continue;
      }
      
      // Quotes
      if (line.startsWith('>')) {
        const quoteLines = [];
        let j = i;
        while (j < lines.length && lines[j].startsWith('>')) {
          quoteLines.push(lines[j].substring(1).trim());
          j++;
        }
        
        elements.push(
          <div key={i} className={`mb-4 border-l-4 border-blue-500 pl-4 py-2 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {parseInlineMarkdown(quoteLines.join(' '))}
            </p>
          </div>
        );
        i = j;
        continue;
      }
      
      // Lists
      if (line.match(/^[•\-\*]\s/) || line.match(/^\d+\.\s/)) {
        const listItems = [];
        let j = i;
        while (j < lines.length && (lines[j].match(/^[•\-\*]\s/) || lines[j].match(/^\d+\.\s/) || lines[j].startsWith('  '))) {
          if (lines[j].trim()) {
            listItems.push(lines[j]);
          }
          j++;
        }
        
        const isOrdered = listItems[0]?.match(/^\d+\.\s/);
        const ListTag = isOrdered ? 'ol' : 'ul';
        
        elements.push(
          <ListTag key={i} className={`mb-4 ml-4 space-y-1 ${isOrdered ? 'list-decimal' : 'list-disc'}`}>
            {listItems.map((item, idx) => {
              const cleanItem = item.replace(/^[•\-\*]\s|^\d+\.\s/, '').trim();
              return (
                <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {parseInlineMarkdown(cleanItem)}
                </li>
              );
            })}
          </ListTag>
        );
        i = j;
        continue;
      }
      
      // Warning/Tip boxes
      if (line.startsWith('⚠️') || line.startsWith('💡') || line.startsWith('🔥')) {
        const icon = line.charAt(0);
        const text = line.substring(2).trim();
        const bgColor = 
          icon === '⚠️' ? (isDark ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-300') :
          icon === '💡' ? (isDark ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-300') :
          (isDark ? 'bg-red-900/20 border-red-600' : 'bg-red-50 border-red-300');
        
        elements.push(
          <div key={i} className={`mb-4 p-3 rounded-lg border ${bgColor}`}>
            <p className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{icon}</span>
              <span>{parseInlineMarkdown(text)}</span>
            </p>
          </div>
        );
        i++;
        continue;
      }
      
      // Regular paragraphs
      elements.push(
        <p key={i} className={`mb-3 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {parseInlineMarkdown(line)}
        </p>
      );
      i++;
    }
    
    return elements;
  };

  const renderMarkdownContent = (content: string) => {
    const sections = content.split(/\n(?=#{1,6}\s)/);
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      if (!lines[0]) return null;
      
      const headerMatch = lines[0].match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        const content = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className={`font-semibold ${level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {parseInlineMarkdown(title)}
              </h3>
            </div>
            {content && (
              <div className="ml-4">
                {renderContent(content)}
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div key={index} className="mb-4">
          {renderContent(section)}
        </div>
      );
    });
  };

  return { renderMarkdownContent };
};