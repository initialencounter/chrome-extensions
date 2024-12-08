import { CheckResult } from "../shared/types/index"

/**
 * 锂离子电池结论检测
 * @param conclusions 结论
 * @param unno UN编号
 * @param otherDescribe 其他描述
 * @param inspectionResult1 瓦时数
 * @param btyGrossWeight 毛重
 * @param comment 备注
 * @returns 
 */
export function ionConclusionsCheck(
  conclusions: number,
  unno: string,
  otherDescribe: string,
  inspectionResult1: string,
  btyGrossWeight: number,
  comment: string
): CheckResult[] {
  let result: CheckResult[] = []
  if (['>100Wh', '>20Wh'].includes(inspectionResult1)) {
    // 危险品
    // 结论
    if (conclusions !== 1)
      result.push({
        ok: false,
        result: '结论错误，瓦时数大于100Wh或者20Wh，应为危险物品'
      })
    // UN编号
    if (otherDescribe === '540' && unno !== 'UN3480')
      result.push({
        ok: false,
        result: '结论错误，单独运输，UN编号应为UN3480'
      })
    if (
      otherDescribe !== '540' &&
      unno !== 'UN3481' &&
      unno !== 'UN3171'
    )
      result.push({ ok: false, result: '结论错误，UN编号应为UN3481' })
    if (
      ['540', '541'].includes(otherDescribe) &&
      comment !== '1200'
    ) {
      // II级包装性能
      result.push({
        ok: false,
        result:
          '结论错误，危险品物品，单独运输或与设备包装在一起，应达到II级包装性能'
      })
    }
  }
  if (
    ['≤100Wh', '≤20Wh'].includes(inspectionResult1) &&
    unno !== 'UN3171'
  ) {
    // 非限制性
    if (otherDescribe === '540' && btyGrossWeight > 30)
      result.push({
        ok: false,
        result: '结论错误，单独运输，毛重大于30kg，应为危险品'
      })
    if (conclusions !== 0) {
      result.push({
        ok: false,
        result: '结论错误，瓦时数小于100Wh或者20Wh，应为非限制性'
      })
    }
  }
  return result
}
