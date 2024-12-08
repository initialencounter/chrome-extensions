import { baseCheck } from "../shared/index"
import { CheckResult, PekPkgInfo, PekUNNO, SekBtyType, SekData } from "../shared/types/index"
import {
  getIsCell,
  getIsIon,
  getIsSingleCell,
  getPkgInfo,
  matchBatteryWeight,
  matchCapacity,
  matchNumber,
  matchVoltage,
  matchWattHour
} from "../shared/utils/index"
import { metalConclusionsCheck } from "./metalConclusionsCheck"
import { ionConclusionsCheck } from "./ionConclusionsCheck"
import { liContentScope } from "./liContentScope"
import { wattHourScope } from "./wattHourScope"
import { packetOrContain } from "./packetOrContain"

function checkSekBtyType(currentData: SekData): CheckResult[] {
  const result = []
  const checkMap = {
    '500': ['≤100Wh', '>100Wh'],
    '501': ['≤20Wh', '>20Wh'],
    '504': ['≤20Wh', '>20Wh'],
    '502': ['>2g', '≤2g'],
    '503': ['>1g', '≤1g'],
    '505': ['>1g', '≤1g']
  }
  const btyType = currentData['btyType'] as SekBtyType
  const {
    // 中文品名
    itemCName,
    // 英文品名
    itemEName,
    // 电池尺寸
    btySize,
    // 电池形状
    // 锂离子电池 锂离子电芯 锂金属电池 锂金属电芯 单芯锂离子电池 单芯锂金属电池
    // '500'    | '501'    | '504'  |  '502'   | '503'       | '505'
    btyShape,
    // 电池型号
    btyKind,
    // 其他描述
    otherDescribe,
    // 备注
    comment,
    // 技术备注
    market
  } = currentData
  const btyCount = matchNumber(currentData['btyCount'])
  // 电压
  const voltage = matchVoltage(itemCName)
  // 容量
  const capacity = matchCapacity(itemCName)
  // 瓦时
  const wattHour = matchNumber(currentData['inspectionItem1Text1'])
  const wattHourFromName = matchWattHour(itemCName)
  // 锂含量
  const liContent = matchNumber(currentData['inspectionItem1Text2'])
  // 净重 单位：g
  const netWeight = matchNumber(currentData['btyNetWeight'])
  // 真实显示净重数字 单位：g
  const netWeightDisplay = matchNumber(currentData['btyNetWeight']) * 1000
  // 描述
  const otherDescribeCAddition = currentData['otherDescribeCAddition']
  // 电池重量
  const batteryWeight = matchBatteryWeight(currentData['otherDescribeCAddition'])
  // 单芯电池或电芯
  const isSingleCell = getIsSingleCell(btyType)
  // UN编号
  const unno = currentData['unno'] as PekUNNO
  // 电芯
  const isCell: boolean = getIsCell(btyType)
  // 包装类型 0 965 1 966 2 967
  const inspectionItem1 = String(currentData['inspectionItem1']) as
    | '0'
    | '1'
    | '2'
  // 是否锂离子电池
  const isIon = getIsIon(btyType)
  // 包装类型, 通过UN编号、电池类型、包装类型获取，录入错误的信息可能会导致判断错误
  const pkgInfo: PekPkgInfo = getPkgInfo(unno, isIon, inspectionItem1)
  // 参见包装说明，可能为空，通常来自于模板
  const unTest = String(currentData['inspectionResult2']) === '0'// UN38.3 测试
  const dropTest = String(currentData['inspectionResult5']) === "0"// 跌落
  const according = currentData['according'] // 鉴定依据
  const otherDescribeChecked = currentData['otherDescribeChecked'] === '1'
  // 是否为充电盒或关联报告
  const isChargeBoxOrRelated = otherDescribeCAddition.includes('总净重')
  if (!itemCName) result.push({ ok: false, result: '中文品名为空' })
  if (!itemEName) result.push({ ok: false, result: '英文品名为空' })
  if (!btyKind) result.push({ ok: false, result: '电池型号为空' })
  if (!otherDescribe) result.push({ ok: false, result: '其他描述包装方式为空' })
  if (!otherDescribeChecked) result.push({ ok: false, result: '未勾选其他描述' })
  if (!unTest) result.push({ ok: false, result: '未勾选通过 UN38.3 测试' })
  if (!market) result.push({ ok: false, result: '技术备注为空' })
  if (otherDescribe.length > 3)
    result.push({ ok: false, result: '其他描述包装方式不唯一' })
  // 基础检查
  result.push(...baseCheck(btySize,
    btyShape,
    batteryWeight,
    btyCount,
    netWeightDisplay,
    btyType,
    otherDescribeCAddition,
    isChargeBoxOrRelated,
    isCell,
    itemCName,
    itemEName,
    btyKind,
    voltage,
    capacity,
    wattHour,
    wattHourFromName,
  ))
  // 包装与其他描述验证
  result.push(...packetOrContain(otherDescribe, otherDescribeCAddition, isChargeBoxOrRelated))

  // 检验结果3
  const inspectionResult3 = currentData['inspectionResult3']
  if (inspectionResult3 !== '0')
    result.push({
      ok: false,
      result: '检验结果3错误，未勾选电池按照规定的质量管理体系进行制造。'
    })

  // 检验结果4
  const inspectionResult4 = currentData['inspectionResult4']
  if (inspectionResult4 !== '0')
    result.push({
      ok: false,
      result:
        '检验结果4错误，未勾选该锂电池不属于召回电池，不属于废弃和回收电池。'
    })

  // 检验结果5 1.2米跌落
  const conclusions = currentData['conclusions']
  if (!dropTest) {
    if (otherDescribe.includes('540') && String(conclusions) === "0") {
      result.push({ ok: false, result: '单独运输非限制性，未通过1.2米跌落' })
    }
  }
  // 随附文件
  if (currentData['inspectionResult7'] !== '2')
    result.push({ ok: false, result: '随附文件错误，未勾选不适用' })
  // 鉴别项目8，9
  if (
    currentData['inspectionResult8'] !== '2' ||
    currentData['inspectionResult9'] !== '2'
  )
    result.push({ ok: false, result: '鉴别项目8，9 错误，未勾选不适用' })
  if (
    currentData['inspectionItem8Cn'] !== '' ||
    currentData['inspectionItem8En'] !== '' ||
    currentData['inspectionItem9Cn'] !== '' ||
    currentData['inspectionItem9En'] !== ''
  )
    result.push({ ok: false, result: '鉴别项目8，9 不为空' })
  if (isIon) {
    result.push(...checkSekIonBtyType(currentData, checkMap, btyType, unno, comment))
  } else {
    result.push(...checkSekMetalBtyType(currentData, checkMap, btyType, unno, comment))
  }
  return result
}

function checkSekIonBtyType(
  currentData: SekData,
  checkMap: Record<string, string[]>,
  btyType: string,
  unno: string,
  comment: string
) {
  const result = []
  // 鉴别项目1
  if (currentData['inspectionItem1'] !== '1111')
    result.push({ ok: false, result: '鉴别项目1错误，未勾选瓦时数' })
  if (currentData['inspectionItem1Text1'] === '')
    result.push({ ok: false, result: '鉴别项目1错误，瓦时数为空' })
  if (currentData['inspectionItem1Text2'] !== '')
    result.push({ ok: false, result: '鉴别项目1错误，锂含量不为空' })

  // 验证瓦数数
  const wattHourFromName = matchWattHour(currentData['itemCName'])
  const inspectionResult1 = currentData['inspectionResult1']
  if (!checkMap[btyType].includes(inspectionResult1))
    result.push({ ok: false, result: '检验结果1错误，瓦时数取值范围错误' })
  if (
    wattHourFromName > 0 &&
    !isNaN(Number(currentData['inspectionItem1Text1']))
  ) {
    if (Number(currentData['inspectionItem1Text1']) !== wattHourFromName)
      result.push({ ok: false, result: '瓦时数与项目名称不匹配' })
  }
  result.push(...wattHourScope(btyType, inspectionResult1, wattHourFromName))
  // 随附文件 Ion 1125 metal 1126
  if (currentData['inspectionItem7'] !== '1125')
    result.push({ ok: false, result: '随附文件错误，未勾选锂离子电池' })
  // 结论
  const otherDescribe = currentData['otherDescribe']
  const btyGrossWeight = Number(currentData['btyGrossWeight'])
  const conclusions = Number(currentData['conclusions'])
  result.push(...ionConclusionsCheck(
    conclusions,
    unno,
    otherDescribe,
    inspectionResult1,
    btyGrossWeight,
    comment
  ))
  return result
}

function checkSekMetalBtyType(
  currentData: SekData,
  checkMap: Record<string, string[]>,
  btyType: string,
  unno: string,
  comment: string
) {
  const result = []
  // 鉴别项目1
  if (currentData['inspectionItem1'] !== '1112')
    result.push({ ok: false, result: '鉴别项目1错误，未勾选锂含量' })
  if (currentData['inspectionItem1Text2'] === '')
    result.push({ ok: false, result: '鉴别项目1错误，锂含量为空' })
  if (currentData['inspectionItem1Text1'] !== '')
    result.push({ ok: false, result: '鉴别项目1错误，瓦时数不为空' })

  // 验证锂含量
  const inspectionResult1 = currentData['inspectionResult1']
  const liContent = Number(currentData['inspectionItem1Text2'])
  if (!checkMap[btyType].includes(inspectionResult1))
    result.push({ ok: false, result: '检验结果1错误，锂含量取值范围错误' })
  result.push(...liContentScope(btyType, inspectionResult1, liContent))
  // 随附文件 Ion 1125 metal 1126
  if (currentData['inspectionItem7'] !== '1126')
    result.push({ ok: false, result: '随附文件错误，未勾选锂金属电池' })
  // 结论
  const otherDescribe = currentData['otherDescribe']
  const btyGrossWeight = Number(currentData['btyGrossWeight'])
  const conclusions = Number(currentData['conclusions'])
  result.push(...metalConclusionsCheck(
    conclusions,
    otherDescribe,
    inspectionResult1,
    btyGrossWeight,
    unno,
    comment
  ))

  return result
}

export { checkSekBtyType }