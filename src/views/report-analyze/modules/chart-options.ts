import type { ECOption } from '@/hooks/common/echarts';

const CHART_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#64748b'];

const HIDDEN_STOCK_COMPARISON_WAREHOUSES = new Set(['中间品库(2楼)', '2楼仓库', '化学品仓库', '二次料仓']);

function toNumber(value: number | string | undefined) {
  const parsed = Number(value ?? 0);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function getBaseGrid() {
  return {
    bottom: 24,
    containLabel: true,
    left: 16,
    right: 20,
    top: 24
  };
}

function withReportChartDefaults(options: ECOption): ECOption {
  return {
    animation: false,
    animationDuration: 0,
    animationDurationUpdate: 0,
    ...options
  } as ECOption;
}

export function getInventoryCategoryOptions(data: Wms.ReportAnalysis.InventoryCategoryRatio[] = []): ECOption {
  return withReportChartDefaults({
    legend: {
      bottom: 0,
      type: 'scroll'
    },
    series: [
      {
        data: data.map((item, index) => ({
          itemStyle: { color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length] },
          name: item.materialGroupName || '未分组',
          value: toNumber(item.materialGroupNum)
        })),
        name: '库存分类',
        radius: ['42%', '68%'],
        type: 'pie'
      }
    ],
    tooltip: {
      trigger: 'item'
    }
  });
}

export function getInventoryWarningDistributionOptions(
  data: Wms.ReportAnalysis.InventoryWarningDistribution[] = []
): ECOption {
  return withReportChartDefaults({
    grid: getBaseGrid(),
    series: [
      {
        data: data.map((item, index) => ({
          itemStyle: { color: CHART_COLORS[index % CHART_COLORS.length] },
          value: item.warningNum || 0
        })),
        label: {
          show: true,
          position: 'right'
        },
        name: '数量',
        type: 'bar'
      }
    ],
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      data: data.map(item => item.warningGroupName || '未分类'),
      type: 'category'
    }
  });
}

export function getWarehouseComparisonOptions(data: Wms.ReportAnalysis.InventoryStockComparison[] = []): ECOption {
  const filteredData = data.filter(item => !HIDDEN_STOCK_COMPARISON_WAREHOUSES.has(item.warehouseName || ''));

  return withReportChartDefaults({
    grid: getBaseGrid(),
    series: [
      {
        data: filteredData.map((item, index) => ({
          itemStyle: { color: CHART_COLORS[index % CHART_COLORS.length] },
          value: toNumber(item.stockNum)
        })),
        label: {
          show: true,
          position: 'top'
        },
        name: '库存数量',
        type: 'bar'
      }
    ],
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      axisLabel: {
        interval: 0,
        formatter: (value: string) => value.replace(/(.{5})/g, '$1\n')
      },
      data: filteredData.map(item => item.warehouseName || '未命名仓库'),
      type: 'category'
    },
    yAxis: {
      name: '库存数量',
      type: 'value'
    }
  });
}

export function getWorkloadTrendOptions(data: Wms.ReportAnalysis.WorkloadTrend[] = []): ECOption {
  return withReportChartDefaults({
    grid: getBaseGrid(),
    legend: {
      bottom: 0,
      data: ['收货作业', '拣货作业', '库内作业']
    },
    series: [
      {
        data: data.map(item => item.receivingCount || 0),
        name: '收货作业',
        smooth: true,
        type: 'line'
      },
      {
        data: data.map(item => item.pickingCount || 0),
        name: '拣货作业',
        smooth: true,
        type: 'line'
      },
      {
        data: data.map(item => item.internalCount || 0),
        name: '库内作业',
        smooth: true,
        type: 'line'
      }
    ],
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      data: data.map(item => item.date || ''),
      type: 'category'
    },
    yAxis: {
      name: '作业量',
      type: 'value'
    }
  });
}

export function getAssignmentTypeOptions(data: Wms.ReportAnalysis.AssignmentTypeDistribution[] = []): ECOption {
  return withReportChartDefaults({
    legend: {
      bottom: 0,
      type: 'scroll'
    },
    series: [
      {
        data: data.map((item, index) => ({
          itemStyle: { color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length] },
          name: item.assignmentType || '未分类',
          value: item.assignmentCount || 0
        })),
        name: '作业类型',
        radius: ['42%', '68%'],
        type: 'pie'
      }
    ],
    tooltip: {
      trigger: 'item'
    }
  });
}

export function getPersonPerformanceOptions(data: Wms.ReportAnalysis.PersonPerformanceComparison[] = []): ECOption {
  return withReportChartDefaults({
    grid: {
      ...getBaseGrid(),
      bottom: 48
    },
    legend: {
      bottom: 0,
      data: ['收货', '拣货']
    },
    series: [
      {
        data: data.map(item => item.receivingCount || 0),
        name: '收货',
        type: 'bar'
      },
      {
        data: data.map(item => item.pickingCount || 0),
        name: '拣货',
        type: 'bar'
      }
    ],
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      data: data.map(item => item.personName || '未命名'),
      type: 'category'
    },
    yAxis: {
      name: '完成作业数',
      type: 'value'
    }
  });
}

export function getWorkQualityAnalysisOptions(data: Wms.ReportAnalysis.WorkQualityAnalysis = {}): ECOption {
  const labels = ['收货作业', '上架作业', '拣货作业', '库内作业', '待上架作业', '待检验作业'];
  const values = [
    data.receivingCount || 0,
    data.shelfCount || 0,
    data.pickingCount || 0,
    data.internalCount || 0,
    data.waitShelfCount || 0,
    data.waitInspectionCount || 0
  ];

  return withReportChartDefaults({
    grid: getBaseGrid(),
    series: [
      {
        data: values.map((value, index) => ({
          itemStyle: { color: CHART_COLORS[index % CHART_COLORS.length] },
          value
        })),
        label: {
          show: true,
          position: 'right'
        },
        name: '数量',
        type: 'bar'
      }
    ],
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      data: labels,
      type: 'category'
    }
  });
}
