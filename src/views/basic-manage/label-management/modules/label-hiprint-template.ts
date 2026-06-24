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

function createRawMaterialHiprintTemplate(template: Wms.Label.TemplateConfig): BusinessHiprintTemplate {
  const paper = { width: 80, height: 80 };
  const margin = 5;
  const qrSize = 21;
  const leftLabelWidth = 16;
  const rightLabelWidth = 12;
  const leftValueWidth = 26;
  const rightValueWidth = 17;
  const rightStart = 47;
  const rowHeight = 7.8;
  const fontSize = 8.5;
  const elements: BusinessHiprintElement[] = [
    createImageElement({
      left: margin,
      top: 4,
      width: 18,
      height: 8,
      src: '/images/LOGO 黑白.bmp'
    }),
    createTextElement({
      left: 24,
      top: 5,
      width: 29,
      height: 8,
      title: template.title,
      fontSize: 15,
      fontWeight: 'bold'
    }),
    createTextElement({
      left: margin,
      top: 13.5,
      width: 46,
      height: 5,
      title: '厦门康勃医疗科技有限公司',
      fontSize: 8,
      fontWeight: 'bold'
    }),
    createCodeElement('defaultModule.qrcode', {
      left: paper.width - margin - qrSize,
      top: 5,
      width: qrSize,
      height: qrSize,
      field: 'qrcode',
      title: '',
      hideTitle: true,
      textType: 'qrcode'
    })
  ];

  function addText(options: Record<string, unknown>) {
    elements.push(createTextElement({ fontSize, height: 5, ...options }));
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

  function addPairRow(top: number, leftField: Wms.Label.FieldConfig, rightField?: Wms.Label.FieldConfig) {
    const textTop = top + 1;

    addText({
      left: margin,
      top: textTop,
      width: leftLabelWidth,
      title: `${leftField.label}:`,
      fontWeight: 'bold'
    });
    addText({
      left: margin + leftLabelWidth,
      top: textTop,
      width: leftValueWidth,
      field: leftField.prop,
      title: '',
      hideTitle: true
    });
    addUnderline(margin + leftLabelWidth, top + rowHeight - 0.7, leftValueWidth - 2);

    if (!rightField) return;

    addText({
      left: rightStart,
      top: textTop,
      width: rightLabelWidth,
      title: `${rightField.label}:`,
      fontWeight: 'bold'
    });
    addText({
      left: rightStart + rightLabelWidth,
      top: textTop,
      width: rightValueWidth,
      field: rightField.prop,
      title: '',
      hideTitle: true
    });
    addUnderline(rightStart + rightLabelWidth, top + rowHeight - 0.7, rightValueWidth - 1);
  }

  const [materialName, materialCode, color, batchCode, quantity, productionDate, inspector, supplier] =
    template.printFields;

  addPairRow(27, materialName);
  addPairRow(35, materialCode, color);
  addPairRow(43, batchCode, quantity);
  addPairRow(51, productionDate, inspector);
  addPairRow(59, supplier);

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
  if (template.key === 'model3') {
    return createRawMaterialHiprintTemplate(template);
  }

  const paper = getPaperSize(template);
  const margin = paper.width === 100 ? 8 : 5;
  const contentWidth = paper.width - margin * 2;
  const qrSize = paper.width === 100 ? 24 : 20;
  const headerHeight = paper.width === 100 ? 34 : 24;
  const labelWidth = paper.width === 100 ? 30 : 24;
  const rowStartTop = margin + headerHeight + 4;
  const rowHeight = Math.min(
    paper.width === 100 ? 9 : 6,
    (paper.height - rowStartTop - margin) / template.printFields.length
  );
  const tableHeight = Number((rowHeight * template.printFields.length).toFixed(2));
  const fontSize = paper.width === 100 ? 11 : 8;
  const elements: BusinessHiprintElement[] = [
    createTextElement({
      left: margin,
      top: margin,
      width: contentWidth - qrSize - 5,
      height: 6,
      title: '赞伯WMS标签',
      fontSize: paper.width === 100 ? 10 : 8,
      fontWeight: 'bold'
    }),
    createTextElement({
      left: margin,
      top: margin + 9,
      width: contentWidth - qrSize - 5,
      height: paper.width === 100 ? 12 : 9,
      title: template.title,
      fontSize: paper.width === 100 ? 18 : 14,
      fontWeight: 'bold'
    }),
    createCodeElement('defaultModule.qrcode', {
      left: paper.width - margin - qrSize,
      top: margin,
      width: qrSize,
      height: qrSize,
      field: 'qrcode',
      title: '',
      hideTitle: true,
      textType: 'qrcode'
    }),
    createLineElement('defaultModule.hline', {
      left: margin,
      top: margin + headerHeight,
      width: contentWidth,
      height: 1,
      borderWidth: 0.75
    }),
    {
      tid: 'defaultModule.rect',
      options: {
        left: margin,
        top: rowStartTop,
        width: contentWidth,
        height: tableHeight,
        borderWidth: 0.75
      }
    },
    createLineElement('defaultModule.vline', {
      left: margin + labelWidth,
      top: rowStartTop,
      width: 1,
      height: tableHeight,
      borderWidth: 0.75
    })
  ];

  template.printFields.forEach((field, index) => {
    const top = Number((rowStartTop + rowHeight * index).toFixed(2));
    const textTop = Number((top + 1.2).toFixed(2));

    if (index > 0) {
      elements.push(
        createLineElement('defaultModule.hline', {
          left: margin,
          top,
          width: contentWidth,
          height: 1,
          borderWidth: 0.75
        })
      );
    }

    elements.push(
      createTextElement({
        left: margin + 2,
        top: textTop,
        width: labelWidth - 4,
        height: rowHeight - 1,
        title: field.label,
        fontSize,
        fontWeight: 'bold'
      }),
      createTextElement({
        left: margin + labelWidth + 2,
        top: textTop,
        width: contentWidth - labelWidth - 4,
        height: rowHeight - 1,
        field: field.prop,
        title: '',
        hideTitle: true,
        fontSize
      })
    );
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

export function resolvePrintableHiprintTemplate(
  template: Wms.Label.TemplateEntity,
  templateConfig: Wms.Label.TemplateConfig
): BusinessHiprintTemplate {
  if (templateConfig.key === 'model3' && template.templateCode === 'model3-default') {
    return createBusinessHiprintTemplate(templateConfig);
  }

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
