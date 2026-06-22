export const labelPrintStyle = `
  @page {
    margin: 0;
  }

  html,
  body {
    margin: 0;
    background: #fff;
  }

  #label-print-area {
    position: static !important;
    top: 0 !important;
    left: 0 !important;
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
    background: #fff !important;
  }

  #label-print-area .label-preview {
    margin: 0 auto;
    break-after: page;
    page-break-after: always;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  #label-print-area .label-preview:last-child {
    break-after: auto;
    page-break-after: auto;
  }
`;
