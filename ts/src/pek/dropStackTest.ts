import { CheckResult, PkgInfoSubType } from "../shared/types/index"

/**
 * 跌落和堆码检测
 * @param pkgInfoSubType 带有IA IB的包装说明
 * @param stackTest 堆码
 * @param dropTest 跌落
 * @param stackTestEvaluation 堆码评估
 * @returns 
 */
export function dropStackTest(pkgInfoSubType: PkgInfoSubType, stackTest: boolean, dropTest: boolean, stackTestEvaluation: boolean): CheckResult[] {
  let result: CheckResult[] = []
  // 跌落和堆码检测
  if (!stackTest && !stackTestEvaluation) {
    if (pkgInfoSubType === '967, I' || pkgInfoSubType === '970, I' || pkgInfoSubType === '967, II' || pkgInfoSubType === '970, II') {
      result.push({ ok: false, result: '967/970 未勾选堆码，或堆码评估，如果是24年报告请忽略' })
    }
    if (pkgInfoSubType === '966, II' || pkgInfoSubType === '969, II') {
      result.push({ ok: false, result: '966/969 第II部分未勾选堆码，或堆码评估，如果是24年报告请忽略' })
    }
  }
  if (stackTest && stackTestEvaluation) {
    result.push({ ok: false, result: '重复勾选堆码和堆码评估' })
  }
  if (pkgInfoSubType === '965, IB') {
    if (!stackTest) {
      result.push({ ok: false, result: '965，IB未勾选堆码' })
    }
    if (!dropTest) {
      result.push({ ok: false, result: '965，IB未勾选跌落' })
    }
  }
  if (pkgInfoSubType === '965, IA' || pkgInfoSubType === '966, I' || pkgInfoSubType === '969, I') {
    if (dropTest) {
      result.push({ ok: false, result: '965，IA不应勾选跌落' })
    }
    if (stackTest) {
      result.push({ ok: false, result: '965，IA不应勾选堆码' })
    }
  }
  if (pkgInfoSubType === '967, II' || pkgInfoSubType === '969, II') {
    if (dropTest) {
      result.push({ ok: false, result: '967，II不应勾选跌落' })
    }
  }
  if ((pkgInfoSubType === '966, II') && !dropTest) {
    result.push({ ok: false, result: '966，II未勾选跌落' })
  }
  return result
}
