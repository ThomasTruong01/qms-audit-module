// TurtleDiagram.jsx
// Renders an SVG turtle diagram from process turtle data.
// boxes are rectangles that auto-expand based on line count.

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildBox(lines, label, colors, width) {
  const { bg, stroke, text, labelColor } = colors;
  const lineH = 16, padTop = 28, padBot = 10, padX = 10;
  const h = padTop + Math.max(lines.length, 1) * lineH + padBot;

  let inner = `<rect width="${width}" height="${h}" rx="4" fill="${bg}" stroke="${stroke}" stroke-width="1"/>`;
  inner += `<text x="${padX}" y="17" font-size="9" font-weight="600" fill="${labelColor}">${escXml(label)}</text>`;
  inner += `<line x1="${padX}" y1="22" x2="${width - padX}" y2="22" stroke="${stroke}" stroke-width="0.5" opacity="0.6"/>`;

  if (lines.length === 0) {
    inner += `<text x="${padX}" y="${padTop + 2}" font-size="9" fill="${text}" opacity="0.35">—</text>`;
  } else {
    lines.forEach((line, i) => {
      inner += `<text x="${padX}" y="${padTop + i * lineH + 2}" font-size="9" fill="${text}">${escXml(line)}</text>`;
    });
  }

  return { svg: inner, h };
}

const COLORS = {
  inputs:    { bg: '#dbeafe', stroke: '#3b82f6', text: '#1e40af', labelColor: '#1e40af' },
  outputs:   { bg: '#fee2e2', stroke: '#ef4444', text: '#991b1b', labelColor: '#991b1b' },
  equipment: { bg: '#fef9c3', stroke: '#ca8a04', text: '#854d0e', labelColor: '#854d0e' },
  people:    { bg: '#dcfce7', stroke: '#16a34a', text: '#14532d', labelColor: '#14532d' },
  methods:   { bg: '#fef9c3', stroke: '#ca8a04', text: '#854d0e', labelColor: '#854d0e' },
  kpis:      { bg: '#dcfce7', stroke: '#16a34a', text: '#14532d', labelColor: '#14532d' },
  process:   { bg: '#dbeafe', stroke: '#3b82f6', text: '#1e40af', labelColor: '#1e40af' },
};

export default function TurtleDiagram({ turtle, processName, clauses = [] }) {
  if (!turtle) return null;

  const colW = 130, centerW = 130, gap = 14;

  const bI = buildBox(turtle.inputs   || [], 'Inputs',         COLORS.inputs,    colW);
  const bO = buildBox(turtle.outputs  || [], 'Outputs',        COLORS.outputs,   colW);
  const bE = buildBox(turtle.equipment|| [], 'With what',      COLORS.equipment, colW);
  const bP = buildBox(turtle.people   || [], 'With who',       COLORS.people,    colW);
  const bM = buildBox(turtle.methods  || [], 'How',            COLORS.methods,   colW);
  const bK = buildBox(turtle.kpis     || [], 'How do we know', COLORS.kpis,      colW);

  const leftH  = bI.h + gap + bO.h;
  const rightH = bE.h + gap + bP.h + gap + bM.h + gap + bK.h;
  const finalH = Math.max(leftH, rightH, 120) + 20;

  const lStartY = (finalH - leftH) / 2;
  const rStartY = (finalH - rightH) / 2;

  const SVG_W = colW + gap + centerW + gap + colW + 20;
  const oX = 10, oY = 10;
  const midX = oX + colW + gap;
  const rrx  = midX + centerW + gap;

  const lIY = oY + lStartY;
  const lOY = lIY + bI.h + gap;
  const rEY = oY + rStartY;
  const rPY = rEY + bE.h + gap;
  const rMY = rPY + bP.h + gap;
  const rKY = rMY + bM.h + gap;
  const pMid = oY + finalH / 2;

  const pn = (processName || 'Process').length > 16
    ? (processName || 'Process').slice(0, 16) + '…'
    : (processName || 'Process');

  const procBox = `
    <rect width="${centerW}" height="${finalH}" rx="4" fill="${COLORS.process.bg}" stroke="${COLORS.process.stroke}" stroke-width="1.5"/>
    <line x1="0" y1="${finalH / 3}" x2="${centerW}" y2="${finalH / 3}" stroke="${COLORS.process.stroke}" stroke-width="0.5" opacity="0.25"/>
    <line x1="0" y1="${finalH * 2 / 3}" x2="${centerW}" y2="${finalH * 2 / 3}" stroke="${COLORS.process.stroke}" stroke-width="0.5" opacity="0.25"/>
    <text x="${centerW / 2}" y="${finalH / 2 - 6}" text-anchor="middle" font-size="11" font-weight="600" fill="${COLORS.process.text}">${escXml(pn)}</text>
    <text x="${centerW / 2}" y="${finalH / 2 + 10}" text-anchor="middle" font-size="8" fill="${COLORS.process.stroke}" opacity="0.8">Process</text>
  `;

  // Clause box below the diagram
  const clauseLineH = 15;
  const clausePadTop = 26;
  const clausePadBot = 10;
  const clausePadX = 10;
  const clauseLines = clauses.map(c => `${c.std} §${c.num} — ${c.title}`);
  const clauseH = clauseLines.length > 0
    ? clausePadTop + clauseLines.length * clauseLineH + clausePadBot
    : 0;
  const clauseY = oY + finalH + gap;

  let clauseBox = '';
  if (clauseLines.length > 0) {
    clauseBox = `
      <g transform="translate(${oX}, ${clauseY})">
        <rect width="${SVG_W - 20}" height="${clauseH}" rx="4" fill="#f3f4f6" stroke="#d1d5db" stroke-width="0.5"/>
        <text x="${clausePadX}" y="17" font-size="9" font-weight="600" fill="#6b7280">Applicable clauses</text>
        <line x1="${clausePadX}" y1="21" x2="${SVG_W - 20 - clausePadX}" y2="21" stroke="#d1d5db" stroke-width="0.5"/>
        ${clauseLines.map((line, i) =>
          `<text x="${clausePadX}" y="${clausePadTop + i * clauseLineH}" font-size="9" fill="#374151">${escXml(line)}</text>`
        ).join('')}
      </g>
    `;
  }

  const totalSVGH = oY + finalH + (clauseLines.length > 0 ? gap + clauseH : 0) + 10;
  const conn = `stroke="#ccc" stroke-width="0.75" stroke-dasharray="4,2"`;

  const svgStr = `
    <svg id="turtle-svg" viewBox="0 0 ${SVG_W} ${totalSVGH}" width="100%" xmlns="http://www.w3.org/2000/svg" style="font-family:sans-serif;">
      <line x1="${oX + colW}" y1="${lIY + bI.h / 2}" x2="${midX}" y2="${pMid}" ${conn}/>
      <line x1="${oX + colW}" y1="${lOY + bO.h / 2}" x2="${midX}" y2="${pMid}" ${conn}/>
      <line x1="${rrx}" y1="${rEY + bE.h / 2}" x2="${midX + centerW}" y2="${pMid}" ${conn}/>
      <line x1="${rrx}" y1="${rPY + bP.h / 2}" x2="${midX + centerW}" y2="${pMid}" ${conn}/>
      <line x1="${rrx}" y1="${rMY + bM.h / 2}" x2="${midX + centerW}" y2="${pMid}" ${conn}/>
      <line x1="${rrx}" y1="${rKY + bK.h / 2}" x2="${midX + centerW}" y2="${pMid}" ${conn}/>
      <g transform="translate(${oX}, ${lIY})">${bI.svg}</g>
      <g transform="translate(${oX}, ${lOY})">${bO.svg}</g>
      <g transform="translate(${midX}, ${oY})">${procBox}</g>
      <g transform="translate(${rrx}, ${rEY})">${bE.svg}</g>
      <g transform="translate(${rrx}, ${rPY})">${bP.svg}</g>
      <g transform="translate(${rrx}, ${rMY})">${bM.svg}</g>
      <g transform="translate(${rrx}, ${rKY})">${bK.svg}</g>
      ${clauseBox}
    </svg>
  `;

  return (
    <div
      className="w-full overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  );
}
