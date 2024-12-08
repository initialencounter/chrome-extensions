import { CheckResult } from "../shared/types/index";

/**
 * 金属结论检测
 * @param conclusions 结论
 * @param otherDescribe 其他描述
 * @param inspectionResult1 锂含量范围
 * @param btyGrossWeight 毛重
 * @param unno UN编号
 * @param comment 备注
 * @returns 
 */
export function metalConclusionsCheck(
  conclusions: number,
  otherDescribe: string,
  inspectionResult1: string,
  btyGrossWeight: number,
  unno: string,
  comment: string): CheckResult[] {
  let result: CheckResult[] = []
  if (['>2g', '>1g'].includes(inspectionResult1)) {
    // 危险品
    // 结论
    if (conclusions !== 1)
      result.push({
        ok: false,
        result: '结论错误，锂含量大于1g或2g，应为危险物品'
      })
    // UN编号
    if (otherDescribe === '540' && unno !== 'UN3090')
      result.push({
        ok: false,
        result: '结论错误，单独运输，UN编号应为UN3090'
      })
    if (otherDescribe !== '540' && unno !== 'UN3091')
      result.push({ ok: false, result: '结论错误，UN编号应为UN3091' })
    if (
      ['540', '541'].includes(otherDescribe) &&
      comment !== '1200'
    ) {
      // II级包装性能
      result.push({
        ok: false,
        result:
          '结论错误，危险品，单独运输或与设备包装在一起，应达到II级包装性能'
      })
    }
  }
  if (['≤100Wh', '≤20Wh'].includes(inspectionResult1)) {
    // 非限制性
    if (otherDescribe === '540' && btyGrossWeight > 30)
      result.push({
        ok: false,
        result: '结论错误，单独运输，毛重大于30kg，应为危险品'
      })
    if (conclusions !== 0 && unno !== 'UN3557') {
      result.push({
        ok: false,
        result: '结论错误，锂含量小于1g或2g，应为非限制性'
      })
    }
  }
  return result
}
