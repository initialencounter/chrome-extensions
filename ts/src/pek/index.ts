import { CheckResult, PekData, PekPkgInfo, PekUNNO, PkgInfoSubType } from "../types/index"
import {
  matchWattHour, getBtyTypeCode, getIsSingleCell, pekIsDangerous,
  getPkgInfo, isBatteryLabel, getPkgInfoByPackCargo, getPkgInfoSubType,
  getUNNO, getIsCargoOnly, pkgInfoIsIA,
  parseNetWeight,
  matchNumber
} from "../utils/index"

function checkPekBtyType(currentData: PekData): CheckResult[] {
  const result = []
  const btyType = getBtyTypeCode(currentData)
  // 品名
  const itemCName = currentData['itemCName']
  const itemEName = currentData['itemEName']
  // 型号
  const btyKind = currentData['model']
  // 电压
  const voltage = matchNumber(currentData['inspectionItem2Text1'])
  // 容量
  const capacity = matchNumber(currentData['inspectionItem2Text2'])
  // 瓦时
  const wattHour = matchNumber(currentData['inspectionItem3Text1'])
  const wattHourFromName = matchWattHour(currentData['itemCName'])
  // 锂含量
  const liContent = matchNumber(currentData['inspectionItem4Text1'])
  // 电池数量
  const btyCount = Number(currentData['btyCount'])
  // 净重
  const netWeight = parseNetWeight(currentData['netWeight'])
  // 单芯电池或电芯
  const isSingleCell = getIsSingleCell(btyType)
  // 电池形状
  const btyShape = currentData['shape']
  // 电池尺寸
  const btySize = currentData['size']
  // UN编号
  const unno = currentData['unno'] as PekUNNO
  // 电芯
  const isCell: boolean = String(currentData['type2']) === '1'
  // 危险性类别
  const classOrDiv = currentData['classOrDiv']
  // 操作信息
  const otherDescribe = currentData['otherDescribe']
  // 客货机
  const packPassengerCargo = currentData['packPassengerCargo']
  // 仅限货机
  const packCargo = currentData['packCargo']
  // 包装类型 0 965 1 966 2 967
  const inspectionItem1 = String(currentData['inspectionItem1']) as
    | '0'
    | '1'
    | '2'
  // 是否锂离子电池
  const isIon = String(currentData['type1']) === '1'
  // 包装类型, 通过UN编号、电池类型、包装类型获取，录入错误的信息可能会导致判断错误
  const pkgInfo: PekPkgInfo = getPkgInfo(unno, isIon, inspectionItem1)
  // 参见包装说明，可能为空，通常来自于模板
  const inspectionItem5Text1: PekPkgInfo = currentData['inspectionItem5Text1']
  // 结论的包装类型，通常来自于模板
  const pkgInfoByPackCargo: PekPkgInfo = getPkgInfoByPackCargo(inspectionItem5Text1, packCargo)
  // 第二个包装说明，可能为空, 可以区分I II IA IB，通常来自于模板
  const pkgInfoSubType: PkgInfoSubType = getPkgInfoSubType(inspectionItem5Text1, packCargo)
  const inspectionItem6 = currentData['inspectionItem6'] // 堆码
  const inspectionItem2 = currentData['inspectionItem2'] // 跌落
  const according = currentData['according'] // 鉴定依据
  // 是否为充电盒或关联报告
  const isChargeBoxOrRelated = currentData['otherDescribeCAddition'].includes('总净重')
  // 是否为危险品，通过包装、电池瓦时、锂含量、净重、电芯类型判断
  const isDangerous = pekIsDangerous(
    wattHour,
    pkgInfo,
    liContent,
    netWeight,
    isSingleCell
  )
  const isIA = pkgInfoIsIA(wattHour, pkgInfo, liContent, netWeight, isSingleCell)
  if (itemCName.includes('芯') && !['501', '503'].includes(btyType))
    result.push({ ok: false, result: '电池类型应为电芯' })
  if (!itemCName) result.push({ ok: false, result: '中文品名为空' })
  if (!itemEName) result.push({ ok: false, result: '英文品名为空' })
  if (btySize.replace(/ /g, '').length > 0) {
    if (!btySize.includes('m') && !btySize.includes('M'))
      result.push({ ok: false, result: '电池尺寸缺失单位' })
  }
  if (
    btySize.includes('Φ') ||
    btySize.includes('φ') ||
    btySize.includes('Ø') ||
    btySize.includes('ø')
  ) {
    // 扣式 近圆柱体 圆柱体 球形
    if (
      ![
        '8aad92b65aae82c3015ab094788a0026',
        '8aad92b65d7a7078015d7e1bb1a2245d',
        '521',
        '2c9180838b90642e018bf132f37f5a60'
      ].includes(btyShape)
    ) {
      result.push({ ok: false, result: '电池形状或尺寸错误，应为扣式 近圆柱体 圆柱体 球形' })
    }
  }
  if (!btyKind) result.push({ ok: false, result: '电池型号为空' })
  // 电池净重
  if (netWeight === 0) result.push({ ok: false, result: '电池净重为空' })
  if (pkgInfoSubType === '') {
    result.push({ ok: false, result: '包装说明为空' })
  }
  if (!isNaN(netWeight)) {
    if (netWeight > 2.5) {
      if (pkgInfoSubType === '968, IB') {
        result.push({ ok: false, result: '968，IB 电池净重超过2.5kg' })
      }
    } else if (netWeight > 5) {
      if (pkgInfoSubType === '966, II' || pkgInfoSubType === '967, II' || pkgInfoSubType === '969, II' || pkgInfoSubType === '970, II') {
        result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过5kg` })
      }
    } else if (netWeight > 10) {
      if (pkgInfoSubType === '965, IB') {
        result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过10kg` })
      }
    } else if (netWeight > 35) {
      if (pkgInfoSubType === '965, IA' || pkgInfoSubType === '966, I' || pkgInfoSubType === '967, I' || pkgInfoSubType === '968, IA' || pkgInfoSubType === '969, I' || pkgInfoSubType === '970, I') {
        result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过35kg` })
      }
    }
  }
  if (isCell) {
    // 1791,1794
    if (otherDescribe.includes('1791') || otherDescribe.includes('1794')) {
      result.push({ ok: false, result: '物品为电芯，不应勾选: 该电池已经做好防短路...或该锂电池不属于召回电芯...' })
    }
  } else {
    // 1792,1795
    if (otherDescribe.includes('1792') || otherDescribe.includes('1795')) {
      result.push({ ok: false, result: '物品为电池，不应勾选: 该电芯已经做好防短路...或该锂电芯不属于召回电芯...' })
    }
  }
  // 荷电状态≤30%
  if (pkgInfo === '965' && !otherDescribe.includes('8aad92b65887a3a8015889d0cd7d0093')) {
    result.push({ ok: false, result: '965 应勾选: 荷电状态≤30%' })
  }
  if (pkgInfo !== '965' && otherDescribe.includes('8aad92b65887a3a8015889d0cd7d0093')) {
    result.push({ ok: false, result: '非 965 不应勾选: 荷电状态≤30%' })
  }
  // 描述操作信息
  // 电芯or电池
  if (
    isCell &&
    !currentData['otherDescribeCAddition'].includes('单块电芯') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '物品为电芯时，描述中不应该出现单块电池' })
  if (
    !isCell &&
    !currentData['otherDescribeCAddition'].includes('单块电池') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '物品为电池时，描述中不应该出现单块电芯' })
  // 包装与其他描述验证
  if (pkgInfo !== pkgInfoByPackCargo) {
    console.log(pkgInfo, pkgInfoByPackCargo)
    result.push({ ok: false, result: `${pkgInfo}包装，但结论是${pkgInfoByPackCargo}` })
  }
  if (
    (pkgInfo === '966' || pkgInfo === '969') &&
    !currentData['otherDescribeCAddition'].includes('包装在一起') &&
    !isChargeBoxOrRelated
  )
    result.push({ ok: false, result: '与设备包装在一起，其他描述中没有包装在一起5个字' })
  if (
    (pkgInfo === '967' || pkgInfo === '970') &&
    !currentData['otherDescribeCAddition'].includes('设备内置') &&
    !isChargeBoxOrRelated
  )
    result.push({ ok: false, result: '安装在设备上，其他描述中没有设备内置4个字' })
  if (currentData['otherDescribeChecked'] !== '1')
    result.push({ ok: false, result: '应勾选附加操作信息' })
  if (!itemCName.includes(btyKind))
    result.push({
      ok: false,
      result: '型号或中文品名错误，电池型号不在项目中文名称中'
    })
  if (!itemEName.includes(btyKind))
    result.push({
      ok: false,
      result: '型号或英文品名错误，电池型号不在项目英文名称中'
    })

  // 跌落和堆码检测
  if (String(inspectionItem6) === '0' && !otherDescribe.includes('2c9180849267773c0192dc73c77e5fb2')) {
    if (pkgInfoSubType === '967, I' || pkgInfoSubType === '970, I' || pkgInfoSubType === '967, II' || pkgInfoSubType === '970, II') {
      result.push({ ok: false, result: '967/970 未勾选堆码，或堆码评估，如果是24年报告请忽略' })
    }
    if (pkgInfoSubType === '966, II' || pkgInfoSubType === '969, II') {
      result.push({ ok: false, result: '966/969 第II部分未勾选堆码，或堆码评估，如果是24年报告请忽略' })
    }
  }
  if (pkgInfoSubType === '965, IB') {
    if (String(inspectionItem6) === '0') {
      result.push({ ok: false, result: '965，IB未勾选堆码' })
    }
    if (String(inspectionItem2) === '0') {
      result.push({ ok: false, result: '965，IB未勾选跌落' })
    }
  }
  if ((pkgInfoSubType === '966, II' || inspectionItem5Text1 === '966') && String(inspectionItem2) === '0') {
    result.push({ ok: false, result: '966，II未勾选跌落' })
  }

  // 检验项目4
  if (Number(currentData['inspectionItem3']) !== 1)
    result.push({
      ok: false,
      result: '检验项目4错误，未勾选锂电池已通过 UN38.3 测试'
    })
  // 检查项目5 是否加贴锂电池标记
  if (isBatteryLabel(pkgInfoSubType, btyShape)) {
    if (Number(currentData['inspectionItem4']) !== 1)
      if (pkgInfoSubType === '970, II')
        result.push({ ok: false, result: `检验项目5错误，970, II，非纽扣电池，应勾选加贴锂电池标记` })
      else
        result.push({ ok: false, result: `检验项目5错误，${pkgInfoSubType}应勾选加贴锂电池标记` })
  } else {
    if (Number(currentData['inspectionItem4']) !== 0)
      if (pkgInfoSubType === '970, II' && btyShape === '8aad92b65aae82c3015ab094788a0026')
        result.push({ ok: false, result: `检验项目5错误，设备内置纽扣电池不应勾选加贴锂电池标记` })
      else
        result.push({ ok: false, result: `检验项目5错误，${pkgInfoSubType}不应勾选加贴锂电池标记` })
  }
  // 包装说明
  if (isDangerous) {
    if (inspectionItem5Text1 !== '') {
      result.push({ ok: false, result: '危险品，参见包装说明应为空' })
    }
  } else {
    if (isNaN(Number(inspectionItem5Text1))) {
      result.push({ ok: false, result: '非限制性，包装说明应为数字' })
    }
  }
  // 检查项目6 是否含随附文件
  if (Number(currentData['inspectionItem5']) !== 0)
    result.push({ ok: false, result: '检查项目6错误，附有随机文件应为：否' })
  // 电压大于7V，可能为电池组
  if (voltage > 7 && (btyType === '503' || btyType === '501')) {
    result.push({ ok: false, result: '电压大于7V，可能为电池组' })
  }
  // 容量*电压 与 瓦时数 误差大于5%
  if (capacity && voltage && wattHour && wattHourFromName === wattHour) {
    let expectedWattHour = capacity * voltage / 1000
    let abs = Math.abs((expectedWattHour - wattHour) / wattHour)
    //     console.log(`
    // projectName: ${itemCName}
    // voltage: ${voltage}
    // capacity: ${capacity}
    // expectedWattHour: ${expectedWattHour}
    // wattHour: ${wattHour}
    // abs: ${abs}`)
    if (abs > 0.05) {
      result.push({ ok: false, result: '容量*电压 与 瓦时数 误差大于5%' })
    }
  }
  // 鉴别项目1
  if (isIon) {
    if (currentData['inspectionItem3Text1'] === '')
      result.push({ ok: false, result: '鉴别项目1错误，瓦时数为空' })
    if (currentData['inspectionItem4Text1'] !== '')
      result.push({ ok: false, result: '鉴别项目1错误，锂含量不为空' })
  } else {
    if (currentData['inspectionItem3Text1'] !== '')
      result.push({ ok: false, result: '鉴别项目1错误，瓦时数不为空' })
    if (currentData['inspectionItem4Text1'] === '')
      result.push({ ok: false, result: '鉴别项目1错误，锂含量为空' })
  }

  // 验证瓦数数
  if (wattHourFromName > 0 && !isNaN(wattHour) && isIon) {
    if (wattHour !== wattHourFromName)
      result.push({ ok: false, result: '瓦时数与项目名称不匹配' })
  }

  // 结论 非限制性 0 危险品 1
  const conclusions = Number(currentData['conclusions'])
  // DGR规定,资料核实
  const result1 = currentData['result1']
  if (result1 !== 'DGR规定,资料核实')
    result.push({ ok: false, result: 'DGR规定，资料核实错误，未勾选错误' })
  // 是否属于危险品
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
    if (inspectionItem5Text1 !== '') {
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
  if (isIon) {
    if (isNaN(wattHour) || isNaN(netWeight)) {
      result.push({ ok: false, result: '瓦时数，净重，二者中有非数字，表单验证可能不准确' })
    }
  } else {
    if (isNaN(liContent) || isNaN(netWeight)) {
      result.push({ ok: false, result: '锂含量，净重，二者中有非数字，表单验证可能不准确' })
    }
  }

  if (isIA) {
    if (pkgInfoSubType === '965, IB' || pkgInfoSubType === '968, IB') {
      result.push({ ok: false, result: '应为IA' })
    }
  } else {
    if (pkgInfoSubType === '965, IA' || pkgInfoSubType === '968, IA') {
      result.push({ ok: false, result: '应为IB' })
    }
  }
  if (currentData['market'] === '') {
    result.push({ ok: false, result: '技术备注为空' })
  }
  return result
}


export { checkPekBtyType }