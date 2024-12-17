import { CheckResult } from "../shared/types/index";

export function checkMarket(market: string, summaryReportNo: string): CheckResult[] {
  if (market.trim() !== summaryReportNo.trim()) {
    return [{
      ok: false,
      result: '技术备注与测试报告编号不一致'
    }]
  }
  return []
}