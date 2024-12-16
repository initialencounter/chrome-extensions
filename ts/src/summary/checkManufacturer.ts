import { CheckResult } from "../shared/types/index"

export function checkManufacturer(systemIdManufacturer: string, summaryManufacturer: string): CheckResult[] {
  if (!summaryManufacturer.includes(systemIdManufacturer.trim())) {
    return [{ ok: false, result: `制造商不一致, 系统上制造商为${systemIdManufacturer.trim()}, 概要制造商为${summaryManufacturer}` }]
  }
  return []
}