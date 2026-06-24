export interface BusinessHiprintElement {
  tid: string;
  options: Record<string, unknown>;
}

export interface BusinessHiprintTemplate {
  panels: Array<{
    index: number;
    name: string;
    width: number;
    height: number;
    paperHeader: number;
    paperFooter: number;
    printElements: BusinessHiprintElement[];
  }>;
}

export function resolvePrintableHiprintTemplate(template: Wms.Label.TemplateEntity): BusinessHiprintTemplate {
  return template.templateJson as unknown as BusinessHiprintTemplate;
}

export function createHiprintPrintPageStyle(template: BusinessHiprintTemplate) {
  const panel = template.panels[0];

  if (!panel) return '';

  return `<style>
    @page { size: ${panel.width}mm ${panel.height}mm; margin: 0; }
    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }
    .hiprint-printPaper {
      margin: 0 !important;
    }
  </style>`;
}
