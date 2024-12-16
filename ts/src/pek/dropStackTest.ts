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
  // 需要堆码或堆码评估单的包装
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
  // 不需要堆码的包装
  if (['965, IA', '966, I', '968, IA', '969, I'].includes(pkgInfoSubType)) {
    if (stackTest) {
      result.push({ ok: false, result: `${pkgInfoSubType}不应勾选堆码` })
    }
  }
  // 要堆码的包装
  if (pkgInfoSubType === '965, IB' || pkgInfoSubType === '968, IB') {
    if (!stackTest) {
      result.push({ ok: false, result: `${pkgInfoSubType}未勾选堆码` })
    }
  }
  // 不需要跌落的包装
  if (['965, IA', '966, I', '967, I', '967, II', '968, IA', '969, I', '970, I', '970, II'].includes(pkgInfoSubType)) {
    if (dropTest) {
      result.push({ ok: false, result: `${pkgInfoSubType}不应勾选跌落` })
    }
  }
  // 要跌落的包装
  if (['965, IB', '968, IB', '966, II', '969, II'].includes(pkgInfoSubType)) {
    if (dropTest) {
      result.push({ ok: false, result: `${pkgInfoSubType}未勾选跌落` })
    }
  }
  return result
}
