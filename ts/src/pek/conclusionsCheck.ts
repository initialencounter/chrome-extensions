import { CheckResult, PekPkgInfo, PkgInfoSubType } from "../shared/types/index"
import { getIsCargoOnly } from "../shared/utils/index"
import { getUNNO } from "../shared/utils/index"

/**
 * 结论检测
 * @param conclusions 结论
 * @param isDangerous 是否为危险品
 * @param pkgInfoByPackCargo 包装说明，含IA,IB，检验单展示的数据
 * @param pkgInfo 包装说明，不含IA,IB
 * @param unno UN编号
 * @param netWeight 净重
 * @param packPassengerCargo 客货机
 * @param classOrDiv 危险性类别
 * @param pkgInfoReference 参见包装说明
 * @param isIon 是否为锂电池
 * @param packCargo 仅限货机
 * @returns 
 */
export function conclusionsCheck(
  conclusions: number,
  isDangerous: boolean,
  pkgInfoByPackCargo: PekPkgInfo,
  pkgInfo: PekPkgInfo,
  unno: string,
  netWeight: number,
  packPassengerCargo: string,
  classOrDiv: string,
  pkgInfoReference: string,
  isIon: boolean,
  packCargo: string
): CheckResult[] {
  let result: CheckResult[] = []
  // 危险品
  if (conclusions === 1) {
    if (!isDangerous) {
      result.push({ ok: false, result: '结论错误，经包装、电池瓦时、锂含量、净重、电芯类型判断，物品为非限制性货物' })
    }
    const UNNO = getUNNO(pkgInfoByPackCargo, isIon)
    const isCargoOnly = getIsCargoOnly(pkgInfo, netWeight)
    if (isCargoOnly && packPassengerCargo !== 'Forbidden') {
      result.push({ ok: false, result: '结论错误，客货机禁止运输' })
    }
    if (unno !== UNNO) {
      if (UNNO === "UN3556") {
        result.push({ ok: false, result: '结论错误，UN编号应为UN3556, 如果是25年报告请忽略' })
      } else {
        result.push({ ok: false, result: '结论错误，UN编号应为' + UNNO })
      }
    }
    if (String(classOrDiv) !== '9') {
      result.push({ ok: false, result: '结论错误，危险性类别应为9' })
    }
    if (pkgInfoReference !== '') {
      result.push({ ok: false, result: '结论错误，危险品，参见包装说明应为空' })
    }
  } else if (conclusions === 0) {
    // 非限制性
    if (packCargo !== '') {
      result.push({ ok: false, result: '结论错误，仅限货机应为空' })
    }
    if (packPassengerCargo !== '') {
      result.push({ ok: false, result: '结论错误，客货机应为空' })
    }
    if (classOrDiv !== '') {
      result.push({ ok: false, result: '结论错误，危险性类别应为空' })
    }
    if (unno !== '') {
      result.push({ ok: false, result: '结论错误，非限制性，UN编号应为空' })
    }
  }
  return result
}
