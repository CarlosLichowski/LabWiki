// src/components/ChatbotRAG/MarkdownRenderer.tsx

import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parsea bloques de texto: headers, párrafos, listas, tablas, citas de alerta
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: string) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={key} className="rag-md-list">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: string) => {
    if (inTable && tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/)));

      elements.push(
        <div key={key} className="rag-table-wrapper">
          <table className="rag-md-table">
            <thead>
              <tr>
                {headerRow.map((col, idx) => (
                  <th key={idx}>{renderInline(col.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((col, cIdx) => (
                    <td key={cIdx}>{renderInline(col.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // Parsea `code`, **bold**, *italic*
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // 1. Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code key={`code-${keyIdx++}`} className="rag-inline-code">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // 2. Bold: **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="rag-bold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // 3. Italic: *text*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={`italic-${keyIdx++}`} className="rag-italic">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // 4. Citation brackets like [Insert_Cobas_CREJ2.pdf]
      const citationMatch = remaining.match(/^(\[[^\]]+\])/);
      if (citationMatch) {
        parts.push(
          <span key={`cite-${keyIdx++}`} className="rag-inline-cite">
            {citationMatch[1]}
          </span>
        );
        remaining = remaining.slice(citationMatch[0].length);
        continue;
      }

      // Plain char
      const nextSpecial = remaining.search(/[`*\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList(`list-${i}`);
      flushTable(`table-${i}`);
      continue;
    }

    // 1. Table row detection (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(`list-${i}`);
      inTable = true;
      const cols = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cols);
      continue;
    } else {
      flushTable(`table-${i}`);
    }

    // 2. Headings
    if (trimmed.startsWith('### ')) {
      flushList(`list-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="rag-heading-3">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushList(`list-${i}`);
      elements.push(
        <h4 key={`h4-${i}`} className="rag-heading-4">
          {renderInline(trimmed.slice(5))}
        </h4>
      );
      continue;
    }

    // 3. Blockquotes / Alerts
    if (trimmed.startsWith('> ')) {
      flushList(`list-${i}`);
      const quoteText = trimmed.slice(2).trim();
      const isWarning =
        quoteText.toLowerCase().includes('advertencia') ||
        quoteText.toLowerCase().includes('crítica') ||
        quoteText.includes('⚠️');
      const isTip = quoteText.toLowerCase().includes('tip') || quoteText.includes('💡');

      elements.push(
        <div
          key={`quote-${i}`}
          className={`rag-callout ${isWarning ? 'callout-warning' : isTip ? 'callout-tip' : 'callout-info'}`}
        >
          {isWarning ? (
            <AlertTriangle size={16} className="callout-icon text-amber" />
          ) : isTip ? (
            <CheckCircle2 size={16} className="callout-icon text-blue" />
          ) : (
            <Info size={16} className="callout-icon text-cyan" />
          )}
          <div className="callout-body">{renderInline(quoteText)}</div>
        </div>
      );
      continue;
    }

    // 4. Bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li key={`li-${i}`} className="rag-list-item">
          {renderInline(trimmed.slice(2))}
        </li>
      );
      continue;
    }

    // 5. Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      flushList(`list-${i}`);
      elements.push(
        <div key={`num-${i}`} className="rag-numbered-item">
          <span className="num-badge">{numMatch[1]}</span>
          <span className="num-text">{renderInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // 6. Regular paragraph
    flushList(`list-${i}`);
    elements.push(
      <p key={`p-${i}`} className="rag-paragraph">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList('final-list');
  flushTable('final-table');

  return <div className="rag-markdown-container">{elements}</div>;
};
