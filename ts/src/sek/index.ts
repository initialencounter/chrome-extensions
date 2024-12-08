import { CheckResult, SekData } from "../types/index"
import { matchCapacity, matchNumber, matchVoltage, matchWattHour } from "../utils/index"

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
  const btyType = currentData['btyType'] as
    | '500'
    | '501'
    | '504'
    | '502'
    | '503'
    | '505'
  if (!checkMap[btyType]) result.push({ ok: false, result: '不适用的电池类型' })
  // 型号或中文品名
  const itemCName = currentData['itemCName']
  const itemEName = currentData['itemEName']
  const btyKind = currentData['btyKind']
  // 锂离子电池 锂离子电芯 锂金属电池 锂金属电芯 单芯锂离子电池 单芯锂金属电池
  // '500'    | '501'    | '504'  |  '502'   | '503'       | '505'
  const voltage = matchVoltage(itemCName)
  const capacity = matchCapacity(itemCName)
  const wattHour = matchNumber(currentData['inspectionItem1Text1'])
  const wattHourFromName = matchWattHour(itemCName)
  if (itemCName.includes('芯') && !['501', '503'].includes(btyType))
    result.push({ ok: false, result: '电池类型应为电芯' })
  // 电压大于7V，可能为电池组
  if (voltage > 7 && (btyKind === '503' || btyKind === '501')) {
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
  if (!itemCName) result.push({ ok: false, result: '中文品名为空' })
  if (!itemEName) result.push({ ok: false, result: '英文品名为空' })
  const btyShape = currentData['btyShape']
  const btySize = currentData['btySize']
  // 尺寸或形状
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
      result.push({ ok: false, result: '电池形状或尺寸错误' })
    }
  }
  const otherDescribe = currentData['otherDescribe']
  const btyGrossWeight = currentData['btyGrossWeight']
  if (!otherDescribe) result.push({ ok: false, result: '其他描述包装方式为空' })
  if (otherDescribe.length > 3)
    result.push({ ok: false, result: '其他描述包装方式不唯一' })

  // 电芯or电池
  if (
    ['501', '503'].includes(btyType) &&
    !currentData['otherDescribeCAddition'].includes('单块电芯') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '其他描述不为电芯' })
  if (
    !['501', '503'].includes(btyType) &&
    !currentData['otherDescribeCAddition'].includes('单块电池') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '其他描述不为电池' })

  // 包装与其他描述验证
  if (
    otherDescribe === '541' &&
    !currentData['otherDescribeCAddition'].includes('包装') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '与设备包装在一起，其他描述错误' })
  if (
    otherDescribe === '542' &&
    !currentData['otherDescribeCAddition'].includes('设备内置') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '安装在设备上，其他描述错误' })
  if (currentData['otherDescribeChecked'] !== '1')
    result.push({ ok: false, result: '未勾选其他描述' })
  if (!btyKind) result.push({ ok: false, result: '电池型号为空' })
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

  // 检验结果2
  const inspectionResult2 = currentData['inspectionResult2']
  if (inspectionResult2 !== '0')
    result.push({
      ok: false,
      result: '检验结果2错误，未勾选锂电池已通过 UN38.3 测试'
    })

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
  const inspectionResult5 = currentData['inspectionResult5']
  const conclusions = currentData['conclusions']
  if (String(inspectionResult5) !== "0") { // 未通过堆码试验
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
  if (['500', '501', '504'].includes(btyType)) {
    result.push(...checkSekIonBtyType(currentData, checkMap, btyType))
  } else {
    result.push(...checkSekMetalBtyType(currentData, checkMap, btyType))
  }
  return result
}

function checkSekIonBtyType(
  currentData: SekData,
  checkMap: Record<string, string[]>,
  btyType: string
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
  if (['501', '504'].includes(btyType)) {
    if (wattHourFromName > 20) {
      if (inspectionResult1 !== '>20Wh')
        result.push({ ok: false, result: '瓦时数结果错误，应为>20Wh' })
    } else {
      if (inspectionResult1 !== '≤20Wh')
        result.push({ ok: false, result: '瓦时数结果错误，应为≤20Wh' })
    }
  } else {
    if (wattHourFromName > 100) {
      if (inspectionResult1 !== '>100Wh')
        result.push({ ok: false, result: '瓦时数结果错误，应为>100Wh' })
    } else {
      if (inspectionResult1 !== '≤100Wh')
        result.push({ ok: false, result: '瓦时数结果错误，应为≤100Wh' })
    }
  }
  // 随附文件 Ion 1125 metal 1126
  if (currentData['inspectionItem7'] !== '1125')
    result.push({ ok: false, result: '随附文件错误，未勾选锂离子电池' })
  // 结论
  const otherDescribe = currentData['otherDescribe']
  const btyGrossWeight = Number(currentData['btyGrossWeight'])
  const conclusions = Number(currentData['conclusions'])
  if (['>100Wh', '>20Wh'].includes(inspectionResult1)) {
    // 危险品
    // 结论
    if (conclusions !== 1)
      result.push({
        ok: false,
        result: '结论错误，瓦时数大于100Wh或者20Wh，应为危险物品'
      })
    // UN编号
    if (otherDescribe === '540' && currentData['unno'] !== 'UN3480')
      result.push({
        ok: false,
        result: '结论错误，单独运输，UN编号应为UN3480'
      })
    if (
      otherDescribe !== '540' &&
      currentData['unno'] !== 'UN3481' &&
      currentData['unno'] !== 'UN3171'
    )
      result.push({ ok: false, result: '结论错误，UN编号应为UN3481' })
    if (
      ['540', '541'].includes(otherDescribe) &&
      currentData['comment'] !== '1200'
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
    currentData['unno'] !== 'UN3171'
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
  if (currentData['market'] === '') {
    result.push({ ok: false, result: '技术备注为空' })
  }
  return result
}

function checkSekMetalBtyType(
  currentData: SekData,
  checkMap: Record<string, string[]>,
  btyType: string
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
  if (isNaN(liContent)) {
    if (['503', '505'].includes(btyType)) {
      if (liContent > 1) {
        if (inspectionResult1 !== '>1g')
          result.push({ ok: false, result: '锂含量取值范围错误，应>1g' })
      } else {
        if (inspectionResult1 !== '≤1g')
          result.push({ ok: false, result: '锂含量取值范围错误，应≤1g' })
      }
    } else {
      if (liContent > 2) {
        if (inspectionResult1 !== '>2g')
          result.push({ ok: false, result: '锂含量取值范围错误，应>2g' })
      } else {
        if (inspectionResult1 !== '≤2g')
          result.push({ ok: false, result: '锂含量取值范围错误，应≤2g' })
      }
    }
  }
  // 随附文件 Ion 1125 metal 1126
  if (currentData['inspectionItem7'] !== '1126')
    result.push({ ok: false, result: '随附文件错误，未勾选锂金属电池' })
  // 结论
  const otherDescribe = currentData['otherDescribe']
  const btyGrossWeight = Number(currentData['btyGrossWeight'])
  const conclusions = Number(currentData['conclusions'])
  if (['>2g', '>1g'].includes(inspectionResult1)) {
    // 危险品
    // 结论
    if (conclusions !== 1)
      result.push({
        ok: false,
        result: '结论错误，锂含量大于1g或2g，应为危险物品'
      })
    // UN编号
    if (otherDescribe === '540' && currentData['unno'] !== 'UN3090')
      result.push({
        ok: false,
        result: '结论错误，单独运输，UN编号应为UN3090'
      })
    if (otherDescribe !== '540' && currentData['unno'] !== 'UN3091')
      result.push({ ok: false, result: '结论错误，UN编号应为UN3091' })
    if (
      ['540', '541'].includes(otherDescribe) &&
      currentData['comment'] !== '1200'
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
    if (conclusions !== 0 && currentData['unno'] !== 'UN3171') {
      result.push({
        ok: false,
        result: '结论错误，锂含量小于1g或2g，应为非限制性'
      })
    }
  }
  if (currentData['market'] === '')
    result.push({ ok: false, result: '技术备注为空' })

  return result
}

export { checkSekBtyType }