export type DesignerPaperKey = 'label100x140' | 'label80x80' | 'a4';

export interface DesignerPaper {
  key: DesignerPaperKey;
  label: string;
  width: number;
  height: number;
}

export interface DesignerComponent {
  tid: string;
  label: string;
  description: string;
  iconText: string;
  group: 'base' | 'assist';
}

interface HiprintElement {
  tid: string;
  options: {
    left: number;
    top: number;
    width: number;
    height: number;
    title?: string;
    field?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: string;
    textType?: 'barcode' | 'qrcode';
    right?: number;
    bottom?: number;
    formatter?: string;
  };
}

export interface HiprintTemplateJson {
  panels: Array<{
    index: number;
    name: string;
    width: number;
    height: number;
    paperHeader: number;
    paperFooter: number;
    printElements: HiprintElement[];
  }>;
}

export const paperOptions: DesignerPaper[] = [
  { key: 'label100x140', label: '标签 100mm x 140mm', width: 100, height: 140 },
  { key: 'label80x80', label: '标签 80mm x 80mm', width: 80, height: 80 },
  { key: 'a4', label: 'A4 210mm x 297mm', width: 210, height: 297 }
];

export const designerComponents: DesignerComponent[] = [
  {
    tid: 'defaultModule.text',
    label: '文本',
    description: '单行文字',
    iconText: 'T',
    group: 'base'
  },
  {
    tid: 'defaultModule.longText',
    label: '长文',
    description: '多行文本',
    iconText: 'T+',
    group: 'base'
  },
  {
    tid: 'defaultModule.image',
    label: '图片',
    description: 'Logo/图片',
    iconText: 'IMG',
    group: 'base'
  },
  {
    tid: 'defaultModule.table',
    label: '表格',
    description: '数据表格',
    iconText: '▦',
    group: 'base'
  },
  {
    tid: 'defaultModule.emptyTable',
    label: '空白表格',
    description: '自定义表格',
    iconText: '▦+',
    group: 'base'
  },
  {
    tid: 'defaultModule.html',
    label: 'HTML',
    description: 'HTML片段',
    iconText: 'H',
    group: 'base'
  },
  {
    tid: 'defaultModule.customText',
    label: '自定义',
    description: '自定义文本',
    iconText: 'T*',
    group: 'base'
  },
  {
    tid: 'defaultModule.barcode',
    label: '条形码',
    description: '一维码',
    iconText: '|||',
    group: 'assist'
  },
  {
    tid: 'defaultModule.qrcode',
    label: '二维码',
    description: '二维码',
    iconText: 'QR',
    group: 'assist'
  },
  {
    tid: 'defaultModule.hline',
    label: '横线',
    description: '水平线',
    iconText: '→',
    group: 'assist'
  },
  {
    tid: 'defaultModule.vline',
    label: '竖线',
    description: '垂直线',
    iconText: '↑',
    group: 'assist'
  },
  {
    tid: 'defaultModule.rect',
    label: '矩形',
    description: '矩形边框',
    iconText: '□',
    group: 'assist'
  },
  {
    tid: 'defaultModule.oval',
    label: '椭圆',
    description: '圆/椭圆',
    iconText: '○',
    group: 'assist'
  }
];

export function getPaperOption(key: DesignerPaperKey) {
  return paperOptions.find(item => item.key === key) ?? paperOptions[0];
}

export function createBlankTemplate(key: DesignerPaperKey): HiprintTemplateJson {
  const paper = getPaperOption(key);

  return {
    panels: [
      {
        index: 0,
        name: paper.label,
        width: paper.width,
        height: paper.height,
        paperHeader: 0,
        paperFooter: paper.height * 2.835,
        printElements: []
      }
    ]
  };
}

export function createDemoTemplate(key: DesignerPaperKey): HiprintTemplateJson {
  const paper = getPaperOption(key);
  const isSmallLabel = paper.width <= 100;
  const contentWidth = paper.width - 16;
  const barcodeWidth = isSmallLabel ? 54 : 80;

  return {
    panels: [
      {
        index: 0,
        name: paper.label,
        width: paper.width,
        height: paper.height,
        paperHeader: 0,
        paperFooter: paper.height * 2.835,
        printElements: [
          {
            tid: 'defaultModule.text',
            options: {
              left: 8,
              top: 8,
              width: contentWidth,
              height: 10,
              title: '通用标签模板',
              fontSize: isSmallLabel ? 15 : 20,
              fontWeight: 'bold',
              textAlign: 'center'
            }
          },
          {
            tid: 'defaultModule.text',
            options: {
              left: 8,
              top: isSmallLabel ? 22 : 26,
              width: contentWidth,
              height: 8,
              title: '拖拽左侧组件到画布，自由调整版式',
              fontSize: isSmallLabel ? 8 : 10,
              textAlign: 'center'
            }
          },
          {
            tid: 'defaultModule.hline',
            options: {
              left: 8,
              top: isSmallLabel ? 34 : 42,
              width: contentWidth,
              height: 1
            }
          },
          {
            tid: 'defaultModule.barcode',
            options: {
              left: 8,
              top: isSmallLabel ? 42 : 54,
              width: barcodeWidth,
              height: isSmallLabel ? 18 : 24,
              title: '1234567890',
              textType: 'barcode'
            }
          },
          {
            tid: 'defaultModule.qrcode',
            options: {
              left: paper.width - (isSmallLabel ? 30 : 40),
              top: isSmallLabel ? 40 : 52,
              width: isSmallLabel ? 22 : 30,
              height: isSmallLabel ? 22 : 30,
              title: 'https://ccsimple.github.io/vue-plugin-hiprint/',
              textType: 'qrcode'
            }
          },
          {
            tid: 'defaultModule.rect',
            options: {
              left: 8,
              top: isSmallLabel ? 70 : 92,
              width: contentWidth,
              height: isSmallLabel ? 34 : 48
            }
          },
          {
            tid: 'defaultModule.longText',
            options: {
              left: 12,
              top: isSmallLabel ? 76 : 100,
              width: contentWidth - 8,
              height: isSmallLabel ? 22 : 34,
              title: '这里是通用说明文本，可在右侧属性中修改内容、字体、边框和位置。',
              fontSize: isSmallLabel ? 8 : 10
            }
          }
        ]
      }
    ]
  };
}

export function createPrintSampleData() {
  return {
    text: '通用文本',
    barcode: '1234567890',
    qrcode: 'https://ccsimple.github.io/vue-plugin-hiprint/'
  } satisfies Record<string, unknown>;
}
