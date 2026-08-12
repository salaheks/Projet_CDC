import { jsPDF } from 'jspdf';

/**
 * Captures the ReactFlow canvas by:
 * 1. Finding the ReactFlow SVG and node HTML elements
 * 2. Serialising the SVG to a Blob URL
 * 3. Drawing it onto a real <canvas> element
 * 4. Returning a high-res PNG data URL
 *
 * This avoids html2canvas issues with SVG / CSS transforms.
 */
const captureReactFlowCanvas = (containerId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const container = document.getElementById(containerId);
    if (!container) {
      reject(new Error(`Element #${containerId} not found`));
      return;
    }

    // The ReactFlow pane that holds all nodes & edges
    const rfPane = container.querySelector('.react-flow__renderer') as HTMLElement | null;

    // ── Strategy: serialise the whole inner container to SVG via foreignObject ──
    // We snapshot the bounding rect of the flow viewport
    const viewport = container.querySelector('.react-flow__viewport') as HTMLElement | null;
    const paneRect  = container.getBoundingClientRect();
    const W = Math.round(paneRect.width);
    const H = Math.round(paneRect.height);

    // Clone the flow pane so we can clean it up for export
    const clone = (rfPane ?? container).cloneNode(true) as HTMLElement;

    // Remove controls & minimap from clone
    clone.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__panel').forEach(el => el.remove());

    // Inline computed styles on all descendants (makes foreignObject work across browsers)
    const inlineStyles = (source: Element, target: Element) => {
      const cs = getComputedStyle(source);
      (target as HTMLElement).style.cssText = cs.cssText;
      const sc = source.children;
      const tc = target.children;
      for (let i = 0; i < sc.length; i++) {
        if (tc[i]) inlineStyles(sc[i], tc[i]);
      }
    };
    inlineStyles(rfPane ?? container, clone);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('width',  String(W));
    svg.setAttribute('height', String(H));

    // Background
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('width',  '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill',   '#f8fafc');
    svg.appendChild(rect);

    // Dot-grid pattern (matches the canvas background)
    const defs = document.createElementNS(svgNS, 'defs');
    const pattern = document.createElementNS(svgNS, 'pattern');
    pattern.setAttribute('id', 'dots');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '20');
    pattern.setAttribute('height', '20');
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', '1');
    dot.setAttribute('cy', '1');
    dot.setAttribute('r',  '1');
    dot.setAttribute('fill', '#cbd5e1');
    pattern.appendChild(dot);
    defs.appendChild(pattern);
    svg.appendChild(defs);
    const gridRect = document.createElementNS(svgNS, 'rect');
    gridRect.setAttribute('width',  '100%');
    gridRect.setAttribute('height', '100%');
    gridRect.setAttribute('fill',   'url(#dots)');
    svg.appendChild(gridRect);

    // Embed the HTML clone inside a foreignObject
    const fo = document.createElementNS(svgNS, 'foreignObject');
    fo.setAttribute('x',      '0');
    fo.setAttribute('y',      '0');
    fo.setAttribute('width',  String(W));
    fo.setAttribute('height', String(H));

    // Copy the viewport transform so nodes appear at the right position
    if (viewport) {
      const transform = viewport.style.transform;
      clone.style.transform = transform;
      clone.style.transformOrigin = '0 0';
    }

    clone.style.width  = W + 'px';
    clone.style.height = H + 'px';
    clone.style.overflow = 'visible';

    fo.appendChild(clone);
    svg.appendChild(fo);

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob    = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url     = URL.createObjectURL(blob);

    const img = new Image();
    const SCALE = 2; // High-DPI

    img.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = W * SCALE;
      canvas.height = H * SCALE;

      const ctx = canvas.getContext('2d')!;
      ctx.scale(SCALE, SCALE);
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      // Fallback: try a simple html2canvas-style approach
      reject(new Error('SVG render failed: ' + String(err)));
    };

    img.src = url;
  });
};

/** Export the editor canvas as a downloadable PNG file. */
export const exportCanvasToPNG = async (containerId: string, projectName = 'architecture') => {
  try {
    const dataUrl = await captureReactFlowCanvas(containerId);
    const a = document.createElement('a');
    a.href     = dataUrl;
    a.download = `${projectName}.png`;
    a.click();
  } catch (err) {
    console.error('PNG export error:', err);
    alert('Erreur lors de l\'exportation PNG.\nVérifiez la console pour plus de détails.');
  }
};

/** Export the editor canvas as a landscape A4 PDF. */
export const exportCanvasToPDF = async (containerId: string, projectName = 'architecture') => {
  try {
    const dataUrl = await captureReactFlowCanvas(containerId);

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pW  = pdf.internal.pageSize.getWidth();
    const pH  = pdf.internal.pageSize.getHeight();

    const props    = pdf.getImageProperties(dataUrl);
    const imgRatio = props.width / props.height;
    const pdfRatio = pW / pH;

    let finalW: number, finalH: number;
    if (imgRatio > pdfRatio) {
      finalW = pW;
      finalH = pW / imgRatio;
    } else {
      finalH = pH;
      finalW = pH * imgRatio;
    }

    // Add title header
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59); // slate-800
    pdf.text(projectName, pW / 2, 10, { align: 'center' });

    // Add image (with small top margin for the title)
    const marginX = (pW - finalW) / 2;
    const marginY = Math.max((pH - finalH) / 2, 14);
    pdf.addImage(dataUrl, 'PNG', marginX, marginY, finalW, finalH - (marginY - (pH - finalH) / 2));

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text(
      `Exporté le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })} — ArchiFlow`,
      pW / 2, pH - 5, { align: 'center' }
    );

    pdf.save(`${projectName}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('Erreur lors de la génération du PDF.\nVérifiez la console pour plus de détails.');
  }
};
