export interface BusinessHiprintElement {
  tid?: string;
  options: Record<string, unknown>;
  printElementType?: {
    type?: string;
    title?: string;
  };
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

function isCodeElement(element: BusinessHiprintElement) {
  const elementType = element.printElementType?.type;
  const textType = element.options.textType;
  const tid = element.tid;

  return (
    textType === 'qrcode' ||
    textType === 'barcode' ||
    elementType === 'qrcode' ||
    elementType === 'barcode' ||
    tid === 'defaultModule.qrcode' ||
    tid === 'defaultModule.barcode'
  );
}

function getDefaultModuleTid(element: BusinessHiprintElement) {
  if (element.tid) return element.tid;

  const elementType = element.printElementType?.type;

  if (!elementType) return 'defaultModule.text';

  return `defaultModule.${elementType}`;
}

export function normalizeHiprintTemplateForPrint(template: BusinessHiprintTemplate): BusinessHiprintTemplate {
  return {
    ...template,
    panels: template.panels.map(panel => ({
      ...panel,
      printElements: panel.printElements.map(element => {
        if (!isCodeElement(element)) {
          const { printElementType: _printElementType, ...restElement } = element;
          return {
            ...restElement,
            tid: getDefaultModuleTid(element)
          };
        }

        const textType =
          element.options.textType === 'barcode' ||
          element.printElementType?.type === 'barcode' ||
          element.tid === 'defaultModule.barcode'
            ? 'barcode'
            : 'qrcode';
        const { printElementType: _printElementType, ...restElement } = element;
        const { title: _title, ...restOptions } = element.options;

        return {
          ...restElement,
          tid: textType === 'barcode' ? 'defaultModule.barcode' : 'defaultModule.qrcode',
          options: {
            ...restOptions,
            title: '',
            hideTitle: true,
            textType
          }
        };
      })
    }))
  };
}

function getPaperSize(template: Wms.Label.TemplateConfig) {
  if (template.sizeClass === 'label-size-finished') {
    return { width: 100, height: 140 };
  }

  return { width: 80, height: 80 };
}

function createTextElement(options: Record<string, unknown>): BusinessHiprintElement {
  return {
    tid: 'defaultModule.text',
    options
  };
}

function createCodeElement(tid: 'defaultModule.barcode' | 'defaultModule.qrcode', options: Record<string, unknown>) {
  return { tid, options };
}

function createImageElement(options: Record<string, unknown>): BusinessHiprintElement {
  return {
    tid: 'defaultModule.image',
    options
  };
}

function createLineElement(tid: 'defaultModule.hline' | 'defaultModule.vline', options: Record<string, unknown>) {
  return { tid, options };
}

type ExpandedFieldRow = [Wms.Label.FieldConfig, Wms.Label.FieldConfig?];
type FieldProp = keyof Wms.Label.FormData;

interface ExpandedTemplateLayout {
  logo: Record<string, unknown>;
  title: Record<string, unknown>;
  company: Record<string, unknown>;
  qrcode: Record<string, unknown>;
  field: {
    topStart: number;
    rowHeight: number;
    textHeight: number;
    fontSize: number;
    leftLabelStart: number;
    leftLabelWidth: number;
    leftValueWidth: number;
    rightStart: number;
    rightLabelWidth: number;
    rightValueWidth: number;
  };
}

const smallExpandedLayout: ExpandedTemplateLayout = {
  logo: { left: 42, top: 7, width: 39, height: 22 },
  title: { left: 82, top: 8, width: 72, height: 22, fontSize: 20 },
  company: { left: 42, top: 32, width: 120, height: 16, fontSize: 11 },
  qrcode: { left: 158, top: 14, width: 52, height: 52 },
  field: {
    topStart: 67,
    rowHeight: 21,
    textHeight: 15,
    fontSize: 11,
    leftLabelStart: 42,
    leftLabelWidth: 48,
    leftValueWidth: 58,
    rightStart: 135,
    rightLabelWidth: 35,
    rightValueWidth: 38
  }
};

const finishedExpandedLayout: ExpandedTemplateLayout = {
  logo: { left: 42, top: 14, width: 45, height: 25 },
  title: { left: 94, top: 15, width: 110, height: 25, fontSize: 22 },
  company: { left: 42, top: 45, width: 160, height: 18, fontSize: 12 },
  qrcode: { left: 210, top: 15, width: 64, height: 64 },
  field: {
    topStart: 95,
    rowHeight: 29,
    textHeight: 18,
    fontSize: 12,
    leftLabelStart: 42,
    leftLabelWidth: 58,
    leftValueWidth: 70,
    rightStart: 160,
    rightLabelWidth: 50,
    rightValueWidth: 52
  }
};

function getFieldByProp(template: Wms.Label.TemplateConfig, prop: FieldProp) {
  return template.printFields.find(field => field.prop === prop);
}

function getFieldRowsByProps(
  template: Wms.Label.TemplateConfig,
  rows: Array<[FieldProp] | [FieldProp, FieldProp]>
): ExpandedFieldRow[] {
  return rows.flatMap(([leftProp, rightProp]) => {
    const leftField = getFieldByProp(template, leftProp);

    if (!leftField) return [];

    const rightField = rightProp ? getFieldByProp(template, rightProp) : undefined;

    return [[leftField, rightField]];
  });
}

function getExpandedFieldRows(template: Wms.Label.TemplateConfig): ExpandedFieldRow[] {
  if (template.key === 'model1') {
    return getFieldRowsByProps(template, [
      ['materialName'],
      ['customerCode', 'orderCode'],
      ['batchCode', 'materialCode'],
      ['modelSpec', 'qty'],
      ['quantity', 'checkResult'],
      ['remark']
    ]);
  }

  if (template.key === 'model2') {
    return getFieldRowsByProps(template, [
      ['materialName'],
      ['materialCode', 'color'],
      ['batchCode', 'quantity'],
      ['productionDate', 'inspector'],
      ['worker']
    ]);
  }

  if (template.key === 'model4') {
    return getFieldRowsByProps(template, [
      ['materialName'],
      ['customerCode', 'orderCode'],
      ['batchCode', 'modelSpec'],
      ['qty', 'quantity'],
      ['remark', 'checkResult']
    ]);
  }

  return getFieldRowsByProps(template, [
    ['materialName'],
    ['materialCode', 'color'],
    ['batchCode', 'quantity'],
    ['productionDate', 'inspector'],
    ['supplier']
  ]);
}

function getPrintFieldTitle(field: Wms.Label.FieldConfig) {
  if (field.prop === 'checkResult') return '校验员';

  return field.label;
}

function createExpandedHiprintTemplate(template: Wms.Label.TemplateConfig): BusinessHiprintTemplate {
  const paper = getPaperSize(template);
  const layout = paper.width === 100 ? finishedExpandedLayout : smallExpandedLayout;
  const elements: BusinessHiprintElement[] = [
    createImageElement({
      ...layout.logo,
      src: '/images/LOGO 黑白.bmp'
    }),
    createTextElement({
      ...layout.title,
      title: template.title,
      fontWeight: 'bold'
    }),
    createTextElement({
      ...layout.company,
      title: '厦门康勃医疗科技有限公司',
      fontWeight: 'bold'
    }),
    createCodeElement('defaultModule.qrcode', {
      ...layout.qrcode,
      field: 'qrcode',
      title: '',
      hideTitle: true,
      textType: 'qrcode'
    })
  ];

  function addText(options: Record<string, unknown>) {
    elements.push(
      createTextElement({
        fontSize: layout.field.fontSize,
        height: layout.field.textHeight,
        ...options
      })
    );
  }

  function addUnderline(left: number, top: number, width: number) {
    elements.push(
      createLineElement('defaultModule.hline', {
        left,
        top,
        width,
        height: 1,
        borderWidth: 0.75
      })
    );
  }

  function addPairRow(rowIndex: number, leftField: Wms.Label.FieldConfig, rightField?: Wms.Label.FieldConfig) {
    const top = layout.field.topStart + rowIndex * layout.field.rowHeight;
    const leftValueStart = layout.field.leftLabelStart + layout.field.leftLabelWidth + 2;

    addText({
      left: layout.field.leftLabelStart,
      top,
      width: layout.field.leftLabelWidth,
      title: `${getPrintFieldTitle(leftField)}:`,
      fontWeight: 'bold'
    });
    addText({
      left: leftValueStart,
      top,
      width: layout.field.leftValueWidth,
      field: leftField.prop,
      title: '',
      hideTitle: true
    });
    addUnderline(leftValueStart, top + layout.field.rowHeight - 4, layout.field.leftValueWidth - 4);

    if (!rightField) return;

    const rightValueStart = layout.field.rightStart + layout.field.rightLabelWidth + 2;

    addText({
      left: layout.field.rightStart,
      top,
      width: layout.field.rightLabelWidth,
      title: `${getPrintFieldTitle(rightField)}:`,
      fontWeight: 'bold'
    });
    addText({
      left: rightValueStart,
      top,
      width: layout.field.rightValueWidth,
      field: rightField.prop,
      title: '',
      hideTitle: true
    });
    addUnderline(rightValueStart, top + layout.field.rowHeight - 4, layout.field.rightValueWidth - 3);
  }

  getExpandedFieldRows(template).forEach(([leftField, rightField], index) => {
    addPairRow(index, leftField, rightField);
  });

  return {
    panels: [
      {
        index: 0,
        name: template.label,
        width: paper.width,
        height: paper.height,
        paperHeader: 0,
        paperFooter: paper.height * 2.835,
        printElements: elements
      }
    ]
  };
}

export function createBusinessHiprintTemplate(template: Wms.Label.TemplateConfig): BusinessHiprintTemplate {
  return createExpandedHiprintTemplate(template);
}

export function resolvePrintableHiprintTemplate(
  template: Wms.Label.TemplateEntity,
  _templateConfig: Wms.Label.TemplateConfig
): BusinessHiprintTemplate {
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
