import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import {
  getAssignmentTypeOptions,
  getInventoryCategoryOptions,
  getInventoryWarningDistributionOptions,
  getPersonPerformanceOptions,
  getWarehouseComparisonOptions,
  getWorkQualityAnalysisOptions,
  getWorkloadTrendOptions
} from './chart-options';
import { getReportPageClass } from './report-layout';

const reportPagePaths = ['../inventory-report/index.vue', '../operation-report/index.vue', '../total-report/index.vue'];

for (const reportPagePath of reportPagePaths) {
  const source = readFileSync(fileURLToPath(new URL(reportPagePath, import.meta.url)), 'utf-8');

  assert.match(source, /getReportPageClass/, `${reportPagePath} should use report layout classes`);
  assert.doesNotMatch(
    source,
    /overflow-hidden\s+lt-sm:overflow-auto/,
    `${reportPagePath} should not clip desktop report content`
  );
}

assert.equal(getReportPageClass(false), 'min-h-500px flex-col-stretch gap-16px overflow-y-auto pb-16px');
assert.equal(getReportPageClass(true), 'flex-col-stretch gap-16px pb-16px');

const chartOptions = [
  getInventoryCategoryOptions([]),
  getInventoryWarningDistributionOptions([]),
  getWarehouseComparisonOptions([]),
  getWorkloadTrendOptions([]),
  getAssignmentTypeOptions([]),
  getPersonPerformanceOptions([]),
  getWorkQualityAnalysisOptions({})
];

for (const options of chartOptions) {
  const animationOptions = options as {
    animation?: boolean;
    animationDuration?: number;
    animationDurationUpdate?: number;
  };

  assert.equal(animationOptions.animation, false);
  assert.equal(animationOptions.animationDuration, 0);
  assert.equal(animationOptions.animationDurationUpdate, 0);
}
