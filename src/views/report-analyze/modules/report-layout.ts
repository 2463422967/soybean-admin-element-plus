export function getReportPageClass(embedded = false) {
  if (embedded) {
    return 'flex-col-stretch gap-16px pb-16px';
  }

  return 'min-h-500px flex-col-stretch gap-16px overflow-y-auto pb-16px';
}
