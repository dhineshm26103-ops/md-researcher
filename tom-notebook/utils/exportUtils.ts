
import pptxgen from "pptxgenjs";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType, PageBreak, VerticalAlign } from "docx";
import { SEOAnalysisResult } from "../types";

const THEME = {
  blue: "2563EB",
  dark: "0F172A",
  green: "059669",
  red: "DC2626",
  orange: "EA580C",
  light: "F8FAFC",
  gray: "64748B",
  codeBg: "1E293B", 
  codeTextCurrent: "94A3B8",
  codeTextOptimized: "60A5FA",
  badBg: "FFF1F2",
  goodBg: "F0FDF4"
};

/**
 * PPTX Export (Mirroring UI Sections)
 */
export const exportToPPTX = async (result: SEOAnalysisResult, targetUrl: string) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // 1. Title Slide
  const sTitle = pptx.addSlide();
  sTitle.background = { color: THEME.dark };
  sTitle.addText("TOM INTELLIGENCE LAB", { x: 0.5, y: 0.5, fontSize: 18, bold: true, color: THEME.blue, fontFace: "Helvetica" });
  sTitle.addText("TECHNICAL SEO ARCHITECTURE AUDIT", { x: 0.5, y: 2.2, w: 9.0, fontSize: 44, bold: true, color: "FFFFFF", fontFace: "Helvetica" });
  sTitle.addText(`DOMAIN: ${targetUrl.toUpperCase()}`, { x: 0.5, y: 3.2, fontSize: 24, color: THEME.blue, fontFace: "Helvetica" });
  sTitle.addText(`DATE: ${new Date().toLocaleDateString()}`, { x: 0.5, y: 5.0, fontSize: 12, color: "94A3B8" });

  // 2. Overview / Scorecard
  const sScores = pptx.addSlide();
  sScores.addText("EXECUTIVE OVERVIEW", { x: 0.5, y: 0.4, fontSize: 32, bold: true, color: THEME.dark });
  sScores.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 4.5, h: 4.0, fill: { color: THEME.light } });
  sScores.addText("OVERALL INDEX", { x: 0.5, y: 1.5, w: 4.5, fontSize: 16, align: 'center', color: THEME.gray, bold: true });
  sScores.addText(`${result.score.overall}%`, { x: 0.5, y: 2.5, w: 4.5, fontSize: 96, align: 'center', color: THEME.blue, bold: true });

  const metrics = [
    { l: "MOBILE UX", v: result.score.mobile },
    { l: "DESKTOP HEALTH", v: result.score.desktop },
    { l: "VISIBILITY", v: result.trafficInsights?.estimatedMonthly || "N/A" }
  ];
  metrics.forEach((m, i) => {
    const x = 5.2 + (i * 1.5);
    sScores.addShape(pptx.ShapeType.rect, { x, y: 1.0, w: 1.3, h: 4.0, fill: { color: "FFFFFF" }, line: { color: "E2E8F0" } });
    sScores.addText(m.l, { x, y: 1.3, w: 1.3, fontSize: 9, bold: true, color: THEME.gray, align: 'center' });
    sScores.addText(`${m.v}`, { x, y: 2.8, w: 1.3, fontSize: 22, bold: true, color: THEME.dark, align: 'center' });
  });

  // 3. Technical Spectrum Details
  const sTech = pptx.addSlide();
  sTech.background = { color: THEME.dark };
  sTech.addText("VELOCITY SPECTRUM ANALYSIS", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: THEME.blue });
  const techGrid = [
    { k: "LCP", v: result.performance.lcp },
    { k: "FID", v: result.performance.fid },
    { k: "CLS", v: result.performance.cls },
    { k: "FCP", v: result.performance.fcp }
  ];
  techGrid.forEach((item, i) => {
    const x = 0.5 + (i * 2.3);
    sTech.addText(item.k, { x, y: 1.5, fontSize: 12, color: "94A3B8", bold: true });
    sTech.addText(item.v, { x, y: 2.0, fontSize: 44, color: "FFFFFF", bold: true });
  });

  // 4. Detailed Audit Slides (Side-by-Side Detail)
  result.detailedAudit.forEach(section => {
    section.items.forEach(item => {
      const sItem = pptx.addSlide();
      sItem.addText(`${section.section.toUpperCase()} ANALYSIS`, { x: 0.5, y: 0.25, fontSize: 11, color: THEME.gray, bold: true });
      sItem.addText(item.label, { x: 0.5, y: 0.55, fontSize: 26, bold: true, color: item.status === 'Pass' ? THEME.green : THEME.red });
      
      // Layman Explanation (The "Simple" part)
      sItem.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.1, w: 9.0, h: 0.8, fill: { color: THEME.light } });
      sItem.addText("SIMPLE EXPLANATION:", { x: 0.7, y: 1.2, fontSize: 10, bold: true, color: THEME.gray });
      sItem.addText(item.simpleExplanation, { x: 0.7, y: 1.4, w: 8.6, fontSize: 11, italic: true, color: "4B5563" });

      // Technical impact
      sItem.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.0, w: 4.4, h: 1.2, fill: { color: "FFFFFF" }, line: { color: "E2E8F0" } });
      sItem.addText("TECHNICAL IMPACT", { x: 0.7, y: 2.15, fontSize: 9, bold: true, color: THEME.gray });
      sItem.addText(item.description, { x: 0.7, y: 2.4, w: 4.0, fontSize: 10, color: THEME.dark });

      // Remediation column
      sItem.addShape(pptx.ShapeType.rect, { x: 5.1, y: 2.0, w: 4.4, h: 1.2, fill: { color: "EFF6FF" }, line: { color: THEME.blue } });
      sItem.addText("ENGINEER REMEDIATION", { x: 5.3, y: 2.15, fontSize: 9, bold: true, color: THEME.blue });
      sItem.addText(item.fixInstruction, { x: 5.3, y: 2.4, w: 4.0, fontSize: 10, bold: true, color: THEME.dark });

      if (item.codeSnippet) {
        sItem.addText("LEGACY CODEBASE", { x: 0.5, y: 3.3, fontSize: 9, bold: true, color: THEME.gray });
        sItem.addShape(pptx.ShapeType.rect, { x: 0.5, y: 3.6, w: 4.4, h: 1.6, fill: { color: THEME.codeBg } });
        sItem.addText(item.codeSnippet.current, { x: 0.6, y: 3.7, w: 4.2, h: 1.4, fontSize: 8, fontFace: "Courier New", color: THEME.codeTextCurrent, valign: 'top' });

        sItem.addText("OPTIMIZED BLUEPRINT", { x: 5.1, y: 3.3, fontSize: 9, bold: true, color: THEME.blue });
        sItem.addShape(pptx.ShapeType.rect, { x: 5.1, y: 3.6, w: 4.4, h: 1.6, fill: { color: "#0F172A" } });
        sItem.addText(item.codeSnippet.optimized, { x: 5.2, y: 3.7, w: 4.2, h: 1.4, fontSize: 8, fontFace: "Courier New", color: THEME.codeTextOptimized, valign: 'top' });
      }
    });
  });

  // 5. Roadmap
  const sRoadmap = pptx.addSlide();
  sRoadmap.addText("PHASED REMEDIATION ROADMAP", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: THEME.blue });
  result.trafficInsights?.competitorGaps.forEach((step, i) => {
    const y = 1.3 + (i * 0.8);
    sRoadmap.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 0.4, h: 0.4, fill: { color: THEME.blue } });
    sRoadmap.addText(`${i+1}`, { x: 0.5, y, w: 0.4, h: 0.4, color: "FFFFFF", align: 'center', bold: true });
    sRoadmap.addText(step, { x: 1.1, y, w: 8.0, h: 0.4, fontSize: 13, bold: true, valign: 'middle' });
  });

  return pptx.writeFile({ fileName: `TOM_Technical_SEO_Audit.pptx` });
};

/**
 * DOCX Export for Briefing Documents
 */
export const exportBriefingToDOCX = async (content: string, title: string) => {
  const sections = content.split(/(?=^#{1,3} )/m);
  const docParagraphs: (Paragraph | PageBreak)[] = [];

  // Title
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: title.toUpperCase(), bold: true, size: 48, color: THEME.blue }),
        new TextRun({ text: "\n", break: 1 }),
        new TextRun({ text: "TOM INTELLIGENCE BRIEFING", size: 24, color: THEME.gray }),
        new TextRun({ text: "\n", break: 2 }),
        new TextRun({ text: `Generated: ${new Date().toLocaleDateString()}`, size: 18, color: THEME.gray }),
      ],
      spacing: { before: 1000, after: 1000 }
    })
  );

  sections.forEach(sec => {
    const lines = sec.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('###')) {
        docParagraphs.push(new Paragraph({ text: trimmed.replace(/^###\s*/, ''), heading: HeadingLevel.HEADING_3, spacing: { before: 400, after: 200 } }));
      } else if (trimmed.startsWith('##')) {
        docParagraphs.push(new Paragraph({ text: trimmed.replace(/^##\s*/, ''), heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      } else if (trimmed.startsWith('#')) {
        docParagraphs.push(new Paragraph({ text: trimmed.replace(/^#\s*/, ''), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
      } else {
        docParagraphs.push(new Paragraph({ text: trimmed, spacing: { after: 200 } }));
      }
    });
  });

  const doc = new Document({
    sections: [{ children: docParagraphs }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * DOCX Export (5+ Page In-Depth Documentation for SEO)
 */
export const exportToDOCX = async (result: SEOAnalysisResult, targetUrl: string) => {
  const sections: (Paragraph | Table | PageBreak)[] = [];

  // PAGE 1: COVER
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "TECHNICAL INFRASTRUCTURE AUDIT", bold: true, size: 72, color: THEME.blue }),
        new TextRun({ text: "\n", break: 1 }),
        new TextRun({ text: "ENTERPRISE INTELLIGENCE BLUEPRINT", size: 28, color: THEME.gray }),
        new TextRun({ text: "\n", break: 3 }),
        new TextRun({ text: `DOMAIN: ${targetUrl.toUpperCase()}`, size: 40, color: THEME.dark, bold: true }),
        new TextRun({ text: "\n", break: 1 }),
        new TextRun({ text: `REPORT ID: TOM-${Math.floor(Math.random()*1000000)}`, size: 18, color: THEME.gray }),
        new TextRun({ text: "\n", break: 1 }),
        new TextRun({ text: `DATE ISSUED: ${new Date().toLocaleDateString()}`, size: 18, color: THEME.gray }),
      ],
      spacing: { before: 2400, after: 1200 }
    })
  );
  sections.push(new PageBreak());

  // PAGE 2: EXECUTIVE SUMMARY & OVERVIEW
  sections.push(new Paragraph({ text: "1. EXECUTIVE SUMMARY", heading: HeadingLevel.HEADING_1 }));
  sections.push(new Paragraph({ text: "This report provides a multi-spectrum analysis of current technical benchmarks, focusing on Core Web Vitals, DOM architecture, and infrastructure security protocols.", spacing: { before: 300, after: 600 } }));
  
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "OVERALL HEALTH INDEX", bold: true, alignment: AlignmentType.CENTER })], shading: { fill: THEME.dark }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ text: `${result.score.overall}%`, bold: true, size: 80, alignment: AlignmentType.CENTER, color: THEME.blue })] }),
          ]
        })
      ],
      spacing: { after: 1000 }
    })
  );

  // PAGE 3: TECHNICAL SPECTRUM (PERFORMANCE)
  sections.push(new Paragraph({ text: "2. VELOCITY SPECTRUM ANALYSIS", heading: HeadingLevel.HEADING_1 }));
  const performanceRows = Object.entries(result.performance).map(([key, value]) => (
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: key.toUpperCase(), bold: true })], shading: { fill: THEME.light } }),
        new TableCell({ children: [new Paragraph({ text: value, bold: true, color: THEME.blue })] })
      ]
    })
  ));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: performanceRows }));
  sections.push(new PageBreak());

  // PAGE 4+: DETAILED AUDIT LOGS
  sections.push(new Paragraph({ text: "3. COMPREHENSIVE ARCHITECTURE AUDIT", heading: HeadingLevel.HEADING_1 }));

  result.detailedAudit.forEach(section => {
    sections.push(new Paragraph({ text: section.section.toUpperCase(), heading: HeadingLevel.HEADING_2, spacing: { before: 600, after: 400 } }));

    section.items.forEach(item => {
      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: item.label, bold: true, size: 36 }),
                        new TextRun({ text: ` [${item.status}]`, color: item.status === 'Pass' ? THEME.green : THEME.red, bold: true, size: 24 })
                      ]
                    })
                  ],
                  shading: { fill: THEME.light }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 2,
                  children: [
                    new Paragraph({ text: "SIMPLE EXPLANATION (LAYMAN TERMS):", bold: true, color: THEME.gray, size: 16 }),
                    new Paragraph({ text: item.simpleExplanation, size: 20, italic: true, spacing: { before: 100, after: 200 } })
                  ],
                  shading: { fill: "F9FAFB" }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "TECHNICAL ANALYSIS", bold: true, color: THEME.gray, size: 16 }),
                    new Paragraph({ text: item.description, size: 18, spacing: { before: 100 } })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "DEPLOYMENT BLUEPRINT", bold: true, color: THEME.blue, size: 16 }),
                    new Paragraph({ text: item.fixInstruction, bold: true, size: 18, spacing: { before: 100 } })
                  ],
                  shading: { fill: "EFF6FF" }
                })
              ]
            }),
            ...(item.codeSnippet ? [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: "LEGACY CODE:", bold: true, size: 14, color: THEME.gray }),
                      new Paragraph({ children: [new TextRun({ text: item.codeSnippet.current, font: "Courier New", size: 14 })] })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: "OPTIMIZED CODE:", bold: true, size: 14, color: THEME.blue }),
                      new Paragraph({ children: [new TextRun({ text: item.codeSnippet.optimized, font: "Courier New", size: 14, color: THEME.blue, bold: true })] })
                    ]
                  })
                ]
              })
            ] : [])
          ],
          spacing: { after: 1200 }
        })
      );
    });
  });

  // PAGE 5: PHASED ROADMAP
  sections.push(new PageBreak());
  sections.push(new Paragraph({ text: "4. PHASED DEPLOYMENT ROADMAP", heading: HeadingLevel.HEADING_1 }));
  result.trafficInsights?.competitorGaps.forEach((step, i) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `PHASE ${i + 1}: `, bold: true, color: THEME.blue }),
          new TextRun({ text: step, size: 24 })
        ],
        spacing: { before: 300, after: 300 }
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TOM_Technical_Architecture_Report.docx`;
  a.click();
  URL.revokeObjectURL(url);
};
