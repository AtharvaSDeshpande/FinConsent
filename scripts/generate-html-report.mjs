import fs from 'node:fs';
import path from 'node:path';

const projectRoot = 'C:/antigravity/fullstack-builder/fin-consent';
const mdPath = path.join(projectRoot, 'docs/audit-log.md');
const outHtmlDocs = path.join(projectRoot, 'docs/audit-log.html');
const outHtmlRoot = path.join(projectRoot, 'audit-log.html');
const outMdRoot = path.join(projectRoot, 'audit-log.md');

const markdown = fs.readFileSync(mdPath, 'utf8');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdownToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBuffer = [];
  let inTable = false;
  let tableHeaderParsed = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Fenced Code Blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre class="code-block"><code class="language-${codeBlockLang}">${escapeHtml(codeBuffer.join('\n'))}</code></pre>\n`;
        inCodeBlock = false;
        codeBuffer = [];
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
      
      // Separator row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        tableHeaderParsed = true;
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        html += '<div class="table-container"><table>\n';
      }

      if (!tableHeaderParsed) {
        html += '<thead><tr>' + cells.map(c => `<th>${formatInline(c)}</th>`).join('') + '</tr></thead>\n<tbody>\n';
      } else {
        const isPass = cells.some(c => c.includes('PASS'));
        const rowClass = isPass ? ' class="pass-row"' : '';
        html += `<tr${rowClass}>` + cells.map(c => `<td>${formatInline(c)}</td>`).join('') + '</tr>\n';
      }
      continue;
    } else if (inTable) {
      html += '</tbody></table></div>\n';
      inTable = false;
    }

    // Unordered lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        inList = true;
        html += '<ul>\n';
      }
      const itemText = line.trim().slice(2);
      html += `<li>${formatInline(itemText)}</li>\n`;
      continue;
    } else if (inList && line.trim() === '') {
      html += '</ul>\n';
      inList = false;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      html += `<h1 class="report-title">${formatInline(line.slice(2))}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2 class="section-title">${formatInline(line.slice(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3 class="subsection-title">${formatInline(line.slice(4))}</h3>\n`;
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---') {
      html += '<hr class="divider">\n';
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      html += `<blockquote class="callout">${formatInline(line.slice(2))}</blockquote>\n`;
      continue;
    }

    // Image with Caption: ![Alt](./path) followed by *Caption*
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      let caption = '';
      if (i + 1 < lines.length && lines[i + 1].startsWith('*Figure')) {
        caption = lines[i + 1].slice(1, -1);
        i++; // consume caption
      }
      html += `
<div class="evidence-card">
  <div class="evidence-image-wrapper">
    <img src="${src}" alt="${escapeHtml(alt)}" loading="lazy">
  </div>
  ${caption ? `<div class="evidence-caption">${formatInline(caption)}</div>` : ''}
</div>\n`;
      continue;
    }

    // Paragraph
    if (line.trim().length > 0) {
      html += `<p>${formatInline(line)}</p>\n`;
    }
  }

  if (inTable) html += '</tbody></table></div>\n';
  if (inList) html += '</ul>\n';

  return html;
}

function formatInline(text) {
  let res = text;
  // Bold
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Checkboxes
  res = res.replace(/\[x\]/gi, '<span class="check-box checked">✔</span>');
  res = res.replace(/\[ \]/g, '<span class="check-box">◻</span>');
  // Status badges
  res = res.replace(/\bPASS WITH CONDITION\b/g, '<span class="badge badge-warning">PASS WITH CONDITION</span>');
  res = res.replace(/\bREADY WITH CONDITIONS\b/g, '<span class="badge badge-warning">READY WITH CONDITIONS</span>');
  res = res.replace(/\bREADY\b/g, '<span class="badge badge-success">READY</span>');
  res = res.replace(/\bPASS\b/g, '<span class="badge badge-success">PASS</span>');
  res = res.replace(/\bFAIL\b/g, '<span class="badge badge-danger">FAIL</span>');
  return res;
}

const htmlBody = parseMarkdownToHtml(markdown);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinConsent Security Verification Audit Report</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f2937;
      --card-hover: #1e293b;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      --primary: #38bdf8;
      --primary-dim: rgba(56, 189, 248, 0.1);
      --success: #34d399;
      --success-bg: rgba(52, 211, 153, 0.1);
      --warning: #fbbf24;
      --warning-bg: rgba(251, 191, 36, 0.1);
      --danger: #f87171;
      --danger-bg: rgba(248, 113, 113, 0.1);
      --border: #374151;
      --code-bg: #030712;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.6;
      padding: 2.5rem 1.5rem;
    }

    .container {
      max-width: 1240px;
      margin: 0 auto;
    }

    .report-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .section-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #f8fafc;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .subsection-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary);
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
    }

    p { margin-bottom: 1rem; color: #d1d5db; }

    ul {
      margin-left: 1.5rem;
      margin-bottom: 1.25rem;
      color: #d1d5db;
    }

    li { margin-bottom: 0.35rem; }

    .divider {
      border: 0;
      height: 1px;
      background: var(--border);
      margin: 2rem 0;
    }

    .callout {
      background: rgba(30, 41, 59, 0.7);
      border-left: 4px solid var(--primary);
      border-radius: 6px;
      padding: 1.2rem 1.5rem;
      margin: 1.5rem 0;
      color: #e2e8f0;
      font-size: 1.02rem;
      line-height: 1.6;
    }

    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.2rem;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.88rem;
      margin: 1.25rem 0;
      color: #e5e7eb;
      line-height: 1.5;
    }

    code {
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.08);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.88rem;
      color: #38bdf8;
    }

    .table-container {
      overflow-x: auto;
      margin: 1.5rem 0;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.92rem;
      background: var(--card-bg);
    }

    th {
      background: #1f2937;
      color: #f9fafb;
      font-weight: 700;
      padding: 0.85rem 1rem;
      border-bottom: 2px solid var(--border);
    }

    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border);
      color: #d1d5db;
      vertical-align: top;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-success {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(52, 211, 153, 0.4);
    }

    .badge-warning {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(251, 191, 36, 0.4);
    }

    .badge-danger {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(248, 113, 113, 0.4);
    }

    .check-box {
      display: inline-block;
      margin-right: 0.4rem;
      font-size: 1rem;
    }

    .check-box.checked {
      color: var(--success);
      font-weight: bold;
    }

    .evidence-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      overflow: hidden;
      margin: 1.75rem 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .evidence-card:hover {
      border-color: rgba(56, 189, 248, 0.4);
      transform: translateY(-2px);
    }

    .evidence-image-wrapper {
      background: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid var(--card-border);
    }

    .evidence-image-wrapper img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    .evidence-caption {
      padding: 0.85rem 1.25rem;
      font-size: 0.88rem;
      color: var(--text-muted);
      font-style: italic;
      background: rgba(17, 24, 39, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    a {
      color: var(--primary);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    ${htmlBody}
  </div>
</body>
</html>`;

fs.writeFileSync(outHtmlDocs, fullHtml, 'utf8');
const rootHtml = fullHtml.replace(/src="\.\/visual-audit\//g, 'src="docs/visual-audit/');
fs.writeFileSync(outHtmlRoot, rootHtml, 'utf8');
const rootMd = markdown.replace(/\(\.\/visual-audit\//g, '(docs/visual-audit/');
fs.writeFileSync(outMdRoot, rootMd, 'utf8');

console.log('✅ Generated HTML and synced markdown report:');
console.log('  - docs/audit-log.html');
console.log('  - audit-log.html');
console.log('  - docs/audit-log.md');
console.log('  - audit-log.md');
