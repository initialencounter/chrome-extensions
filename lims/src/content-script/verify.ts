const systemIdLowercase = window.location.pathname.startsWith('/pek')
  ? 'pek'
  : 'sek'
const host = window.location.host
;(async () => {
  await verifySleep(500)
  const targetChild = document.getElementById('openDocumentsBtn0')
  if (!targetChild) return
  const targetParent = targetChild.parentElement
  if (!targetParent) return
  const verifyButton = document.createElement('a')
  verifyButton.href = 'javascript:void(0);'
  verifyButton.className = 'easyui-linkbutton l-btn l-btn-small'
  verifyButton.style.background = '#ffffff'
  // hover
  verifyButton.onmouseover = function () {
    verifyButton.style.background = '#54a124'
  }
  verifyButton.onmouseout = function () {
    verifyButton.style.background = '#ffffff'
  }
  verifyButton.innerHTML = `
    <span class="l-btn-left" style="margin-top: 0px;">
        <span class="l-btn-text">验证</span>
    </span>
    `
  verifyButton.onclick = lims_verify_inspect
  targetParent.appendChild(verifyButton)
  console.log('验证按钮插入成功')
})()

function checkPekBtyType(currentData: PekData) {
  const result = []
  const btyType = getBtyTypeCode(currentData)
  // 品名
  const itemCName = currentData['itemCName']
  const itemEName = currentData['itemEName']
  // 型号
  const btyKind = currentData['model']
  // 瓦时
  const wattHour = Number(currentData['inspectionItem3Text1'])
  // 锂含量
  const liContent = Number(currentData['inspectionItem4Text1'])
  // 净重
  const netWeight = Number(currentData['netWeight'])
  // 单芯电池或电芯
  const isSingleCell = getIsSingleCell(btyType)
  // 电池形状
  const btyShape = currentData['shape']
  // 电池尺寸
  const btySize = currentData['size']
  // UN编号
  const unno = currentData['unno']
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
  if (itemCName.includes('芯') && !['501', '503'].includes(btyType))
    result.push({ ok: false, result: '电池类型应为电芯' })
  if (!itemCName) result.push({ ok: false, result: '中文品名为空' })
  if (!itemEName) result.push({ ok: false, result: '英文品名为空' })
  if (btySize.includes('m') && btySize.includes('M'))
    result.push({ ok: false, result: '电池尺寸缺失单位' })
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
  if (isCell) {
    // 1791,1794
    if (otherDescribe.includes('1791') || otherDescribe.includes('1794')) {
      result.push({ ok: false, result: '电芯类型不应该有电池描述' })
    }
  } else {
    // 1792,1795
    if (otherDescribe.includes('1792') || otherDescribe.includes('1795')) {
      result.push({ ok: false, result: '电池类型不应该有电芯描述' })
    }
  }
  // 电芯or电池
  if (
    isCell &&
    !currentData['otherDescribeCAddition'].includes('单块电芯') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '其他描述不为电芯' })
  if (
    !isCell &&
    !currentData['otherDescribeCAddition'].includes('单块电池') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '其他描述不为电池' })
  // 包装与其他描述验证
  // 包装类型 0 965 1 966 2 967
  const inspectionItem1 = String(currentData['inspectionItem1']) as
    | '0'
    | '1'
    | '2'
  const isIon = String(currentData['type1']) === '0'
  const pkgInfo = getPkgInfo(isIon, inspectionItem1)
  if (
    (pkgInfo === '965' || pkgInfo === '968') &&
    currentData['otherDescribeCAddition'].length > 30
  )
    result.push({ ok: false, result: '单独运输，其他描述长度错误' })
  if (
    (pkgInfo === '966' || pkgInfo === '969') &&
    !currentData['otherDescribeCAddition'].includes('包装') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '与设备包装在一起，其他描述错误' })
  if (
    (pkgInfo === '967' || pkgInfo === '970') &&
    !currentData['otherDescribeCAddition'].includes('设备内置') &&
    !currentData['otherDescribeCAddition'].includes('总净重')
  )
    result.push({ ok: false, result: '安装在设备上，其他描述错误' })
  if (currentData['otherDescribeChecked'] !== '1')
    result.push({ ok: false, result: '未勾选附加操作信息' })
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

  // 检验项目4
  if (Number(currentData['inspectionItem3']) !== 1)
    result.push({
      ok: false,
      result: '检验项目4错误，未勾选锂电池已通过 UN38.3 测试'
    })
  // 随附文件
  if (Number(currentData['inspectionItem5']) !== 0)
    result.push({ ok: false, result: '随附文件错误，未勾选否' })
  // 鉴别项目1
  if (isIon) {
    if (currentData['inspectionItem3Text1'] !== '')
      result.push({ ok: false, result: '鉴别项目1错误，瓦时数为空' })
    if (currentData['inspectionItem4Text1'] === '')
      result.push({ ok: false, result: '鉴别项目1错误，锂含量不为空' })
  } else {
    if (currentData['inspectionItem3Text1'] === '')
      result.push({ ok: false, result: '鉴别项目1错误，瓦时数不为空' })
    if (currentData['inspectionItem4Text1'] !== '')
      result.push({ ok: false, result: '鉴别项目1错误，锂含量为空' })
  }

  // 验证瓦数数
  const wattHourFromName = matchWattHour(currentData['itemCName'])
  const inspectionResult1 = currentData['inspectionItem3Text1']
  if (wattHourFromName > 0 && !isNaN(Number(inspectionResult1))) {
    if (Number(inspectionResult1) !== wattHourFromName)
      result.push({ ok: false, result: '瓦时数与项目名称不匹配' })
  }

  // 结论 非限制性 0 危险品 1
  const conclusions = Number(currentData['conclusions'])
  // DGR规定,资料核实
  const result1 = currentData['result1']
  if (result1 !== 'DGR规定,资料核实')
    result.push({ ok: false, result: 'DGR规定，资料核实错误，未勾选错误' })
  // 是否属于危险品
  if (isNaN(wattHour) && isNaN(liContent) && isNaN(netWeight)) {
    const isDangerous = pekIsDangerous(
      wattHour,
      pkgInfo,
      liContent,
      netWeight,
      isSingleCell
    )
    // 危险品
    if (isDangerous) {
      const UNNO = getUNNO(pkgInfo)
      const isCargoOnly = getIsCargoOnly(pkgInfo, netWeight)
      if (isCargoOnly && packPassengerCargo !== 'Forbidden') {
        result.push({ ok: false, result: '结论错误，客货机禁止运输' })
      }
      if (unno !== UNNO && unno !== 'UN3171') {
        result.push({ ok: false, result: '结论错误，UN编号应为' + UNNO })
      }
      if (conclusions !== 1) {
        result.push({ ok: false, result: '结论错误，应为危险品' })
      }
      if (String(classOrDiv) !== '9') {
        result.push({ ok: false, result: '结论错误，危险性类别应为9' })
      }
    } else {
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
      if (conclusions !== 0 && currentData['unno'] !== 'UN3171') {
        result.push({ ok: false, result: '结论错误，应为非限制性' })
      }
    }
  }
  if (currentData['market'] === '') {
    result.push({ ok: false, result: '技术备注为空' })
  }
  return result
}

function checkSekBtyType(currentData: SekData) {
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
  if (itemCName.includes('芯') && !['501', '503'].includes(btyType))
    result.push({ ok: false, result: '电池类型应为电芯' })
  if (!itemCName) result.push({ ok: false, result: '中文品名为空' })
  if (!itemEName) result.push({ ok: false, result: '英文品名为空' })
  const btyShape = currentData['btyShape']
  const btySize = currentData['btySize']
  // 尺寸或形状
  if (btySize.includes('m') && btySize.includes('M'))
    result.push({ ok: false, result: '电池尺寸缺失单位' })
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
  if (otherDescribe === '540' && currentData['btyGrossWeightChecked'] !== '1')
    result.push({ ok: false, result: '单独运输，未勾选毛重' })
  if (otherDescribe === '540' && btyGrossWeight === '')
    result.push({ ok: false, result: '单独运输，毛重不能为空' })

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
    otherDescribe === '540' &&
    currentData['otherDescribeCAddition'].length > 30
  )
    result.push({ ok: false, result: '单独运输，其他描述长度错误' })
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
          '结论错误，危险品物品，单独运输或与设备包装在一起，应达到II级包装性能'
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

/**
 * PekData
 */
export interface PekData {
  according: string
  appraiseDate: string
  appraiser: string
  appraiserName: string
  checkDate: number | null
  checked: boolean
  checker: string | null
  checkerName: string | null
  checkLocation: string
  checkLocationName: string
  classOrDiv: string
  conclusions: number
  createdBy: string
  createdDate: string
  editStatus: number
  grossWeight: string
  id: string
  inspectionItem1: number
  inspectionItem1Text1: string
  inspectionItem1Text2: string
  inspectionItem1Text3: string
  inspectionItem1Text4: string
  inspectionItem2: number
  inspectionItem3: number
  inspectionItem4: number
  inspectionItem4Text1: string
  inspectionItem5: number
  inspectionItem5Text1: string
  inspectionItem6: number
  itemCName: string
  itemEName: string
  modifiedBy: string
  modifiedDate: string
  otherDescribe: string
  otherDescribeChecked: string
  otherDescribeEAddition: string
  packCargo: string
  packPassengerCargo: string
  packSpecial: string
  packSubDanger: string
  pg: string
  principalName: null | string
  projectId: string
  projectNo: string
  psn: string
  remarks: string
  result1: string
  type1: number
  type2: number
  unno: string
  /**
   * 颜色
   */
  color: string
  /**
   * 形状
   */
  shape: string
  /**
   * 尺寸
   */
  size: string
  /**
   * 型号
   */
  model: string
  /**
   * 商标
   */
  brands: string
  /**
   * 电池数量
   */
  btyCount: string
  /**
   * 电池净重
   */
  netWeight: string
  /**
   * 操作信息
   */
  otherDescribeCAddition: string
  /**
   * 电压
   */
  inspectionItem2Text1: string
  /**
   * 容量
   */
  inspectionItem2Text2: string
  /**
   * 瓦时
   */
  inspectionItem3Text1: string
  /**
   * 技术备注
   */
  market: string
}

/**
 * SekData
 */
export interface SekData {
  according: string
  appraiseDate: string
  appraiser: string
  appraiserName: string
  btyCountChecked: string
  btyGrossWeightChecked: string
  btyNetWeightChecked: string
  btyType: string
  checkDate: null
  checked: boolean
  checker: null
  checkerName: null
  checkLocation: string
  checkLocationName: string
  classOrDiv: string
  comment: string
  commentExtra: null
  conclusions: number
  createdBy: string
  createdDate: string
  editStatus: number
  id: string
  inspectionItem1: string
  inspectionItem1Text2: string
  inspectionItem2: string
  inspectionItem3: string
  inspectionItem4: string
  inspectionItem5: string
  inspectionItem6: string
  inspectionItem7: string
  inspectionItem8Cn: string
  inspectionItem8En: string
  inspectionItem9Cn: string
  inspectionItem9En: string
  inspectionResult1: string
  inspectionResult2: string
  inspectionResult3: string
  inspectionResult4: string
  inspectionResult5: string
  inspectionResult6: string
  inspectionResult7: string
  inspectionResult8: string
  inspectionResult9: string
  itemCName: string
  itemEName: string
  modifiedBy: string
  modifiedDate: string
  otherDescribe: string
  otherDescribeChecked: string
  otherDescribeEAddition: string
  pg: string
  principalName: string | null
  projectId: string
  projectNo: string
  psn: string
  remarks: string
  unno: string
  /**
   * 颜色
   */
  btyColor: string
  /**
   * 形状
   */
  btyShape: string
  /**
   * 尺寸
   */
  btySize: string
  /**
   * 型号
   */
  btyKind: string
  /**
   * 商标
   */
  btyBrand: string
  /**
   * 电池数量
   */
  btyCount: string
  /**
   * 电池净重
   */
  btyNetWeight: string
  /**
   * 毛重
   */
  btyGrossWeight: string
  /**
   * 操作信息
   */
  otherDescribeCAddition: string
  /**
   * 瓦时
   */
  inspectionItem1Text1: string
  /**
   * 技术备注
   */
  market: string
}

/**
 * PekDifData
 */
export interface PekDifData {
  /**
   * 颜色
   */
  color: string
  /**
   * 形状
   */
  shape: string
  /**
   * 尺寸
   */
  size: string
  /**
   * 型号
   */
  model: string
  /**
   * 商标
   */
  brands: string
  /**
   * 电池数量
   */
  btyCount: string
  /**
   * 电池净重
   */
  netWeight: string
  /**
   * 操作信息
   */
  otherDescribeCAddition: string
  /**
   * 电压
   */
  inspectionItem2Text1: string
  /**
   * 容量
   */
  inspectionItem2Text2: string
  /**
   * 瓦时
   */
  inspectionItem3Text1: string
  /**
   * 技术备注
   */
  market: string
}
const PekDifDataKeys: Array<keyof PekDifData> = [
  'color',
  'shape',
  'size',
  'model',
  'brands',
  'btyCount',
  'netWeight',
  'otherDescribeCAddition',
  'inspectionItem2Text1',
  'inspectionItem2Text2',
  'inspectionItem3Text1',
  'market'
]

/**
 * SekDifData
 */
export interface SekDifData {
  /**
   * 颜色
   */
  btyColor: string
  /**
   * 形状
   */
  btyShape: string
  /**
   * 尺寸
   */
  btySize: string
  /**
   * 型号
   */
  btyKind: string
  /**
   * 商标
   */
  btyBrand: string
  /**
   * 电池数量
   */
  btyCount: string
  /**
   * 电池净重
   */
  btyNetWeight: string
  /**
   * 毛重
   */
  btyGrossWeight: string
  /**
   * 操作信息
   */
  otherDescribeCAddition: string
  /**
   * 瓦时
   */
  inspectionItem1Text1: string
  /**
   * 技术备注
   */
  market: string
}

const SekDifDataKeys: Array<keyof SekDifData> = [
  'btyColor',
  'btyShape',
  'btySize',
  'btyKind',
  'btyBrand',
  'btyCount',
  'btyNetWeight',
  'btyGrossWeight',
  'otherDescribeCAddition',
  'inspectionItem1Text1',
  'market'
]

const SekKey2PekKey: Record<keyof SekDifData, keyof PekDifData | null> = {
  btyColor: 'color',
  btyShape: 'shape',
  btySize: 'size',
  btyKind: 'model',
  btyBrand: 'brands',
  btyCount: 'btyCount',
  btyNetWeight: 'netWeight',
  otherDescribeCAddition: 'otherDescribeCAddition',
  inspectionItem1Text1: 'inspectionItem2Text1',
  market: 'market',
  btyGrossWeight: null
}

const PekKey2SekKey: Record<keyof PekDifData, keyof SekDifData | null> = {
  color: 'btyColor',
  shape: 'btyShape',
  size: 'btySize',
  model: 'btyKind',
  brands: 'btyBrand',
  btyCount: 'btyCount',
  netWeight: 'btyNetWeight',
  otherDescribeCAddition: 'otherDescribeCAddition',
  inspectionItem3Text1: 'inspectionItem1Text1',
  market: 'market',
  inspectionItem2Text1: null,
  inspectionItem2Text2: null
}

interface ReplaceStatus {
  ok: boolean
  result: string
}

function replaceData(
  currentData: SekData | PekData,
  targetData: SekData | PekData
): SekData | PekData {
  if (systemIdLowercase === 'sek') {
    return replaceSekFromPek(currentData as SekData, targetData as PekData)
  }
  return replacePekFromSek(currentData as PekData, targetData as SekData)
}

/**
 * 使用 SekDate 替换 PekData 中的数据
 * @returns PekData
 */
function replacePekFromSek(pekData: PekData, sekData: SekData): PekData {
  for (const key of PekDifDataKeys) {
    const sekKey = PekKey2SekKey[key]
    if (sekKey == null) {
      pekData[key] = ''
      continue
    }
    pekData[key] = sekData[sekKey]
  }
  return pekData
}

/**
 * 使用 PekData 替换 SekData 中的数据
 * @returns SekDifData
 */

function replaceSekFromPek(sekData: SekData, pekData: PekData): SekData {
  for (const key of SekDifDataKeys) {
    const pekKey = SekKey2PekKey[key]
    if (pekKey == null) {
      sekData[key] = ''
      continue
    }
    sekData[key] = pekData[pekKey]
  }
  return sekData
}

async function getData(projectId: string): Promise<SekData | PekData | null> {
  const response = await fetch(
    `https://${host}/rest/${systemIdLowercase}/inspect/battery/${projectId}`,
    {
      method: 'GET',
      credentials: 'include' // 包含 cookies
    }
  )
  if (!response.ok) return null
  return await response.json()
}

async function restDate(data: PekData | SekData): Promise<ReplaceStatus> {
  const response = await fetch(
    `https://${host}/rest/${systemIdLowercase}/inspect/battery`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 包含 cookies
      body: JSON.stringify(data)
    }
  )
  if (!response.ok) return { ok: false, result: '替换失败' }
  return { ok: true, result: '替换成功' }
}

function getCurrentProjectId() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  return urlParams.get('projectId')
}

async function getDataByProjectNo(
  projectNo: string
): Promise<SekData | PekData | null> {
  let systemId_ = 'pek'
  if (projectNo.indexOf('PEK') === -1) systemId_ = 'sek'
  const response = await fetch(
    `https://${host}/rest/${systemId_}/inspect/battery/query?projectNo=${projectNo}&page=1&rows=10`,
    {
      method: 'GET',
      credentials: 'include' // 包含 cookies
    }
  )
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  return data['rows'][0]
}

async function checkReverseProjectNo(projectNo: string) {
  if (!projectNo.startsWith(systemIdLowercase === 'sek' ? 'PEK' : 'SEK'))
    return false
  const reg = /[S|P]EK\w{2}20[1-3][0-9][0-2][0-9][0-3][0-9]\d{4}/
  if (!reg.test(projectNo)) return false
  return true
}

async function mainReplaceData(): Promise<ReplaceStatus> {
  const targetProjectNo = await getClipboardText()
  if (!targetProjectNo) return { ok: false, result: '剪切板中没有项目编号' }
  if (!checkReverseProjectNo(targetProjectNo))
    return { ok: false, result: '项目编号格式错误' }
  const targetDate = await getDataByProjectNo(targetProjectNo)
  if (!targetDate) return { ok: false, result: '未找到对应的项目编号' }
  const currentProjectId = getCurrentProjectId()
  if (currentProjectId === null)
    return { ok: false, result: '未找到当前项目编号' }
  const currentData = await getData(currentProjectId)
  if (currentData === null)
    return { ok: false, result: '未找到当前项目编号的数据' }
  const newData = replaceData(currentData, targetDate)
  return await restDate(newData)
}

async function lims_verify_inspect() {
  // await testVerify()
  // return
  const currentProjectId = getCurrentProjectId()
  if (currentProjectId === null)
    return { ok: false, result: '未找到当前项目编号' }
  const currentData = await getData(currentProjectId)
  if (currentData === null)
    return { ok: false, result: '未找到当前项目编号的数据' }
  let result = []
  if (systemIdLowercase === 'pek') {
    result = checkPekBtyType(currentData as PekData)
  } else {
    result = checkSekBtyType(currentData as SekData)
  }
  result.push(
    ...(await checkAttchmentFiles(currentData.projectNo, currentData.projectId))
  )
  if (!result.length) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['success']('初步验证通过')
    return
  }
  // @ts-expect-error: use Qmsg from assets
  Qmsg['warning']('初步验证未通过' + JSON.stringify(result, null, 2), {
    timeout: 4000
  })
}

function matchWattHour(projectName: string) {
  const matches = [...projectName.matchAll(/\s(\d+\.{0,1}\d+)k?[Ww]h/g)]
  const results = matches.map((match) => match[1])
  let wattHour = Number(results[0])
  if (!results.length) return 0
  if (isNaN(wattHour)) return 0
  if (projectName.includes('kWh')) wattHour *= 1000
  return wattHour
}

function getBtyTypeCode(
  currentData: PekData
): '500' | '501' | '504' | '502' | '503' | '505' {
  const isIon: boolean = String(currentData['type1']) === '0'
  const isCell: boolean = String(currentData['type2']) === '1'
  const isSingleCell: boolean = currentData['otherDescribe'].includes('1790')
  if (isIon) {
    if (isCell) return '501'
    else return isSingleCell ? '504' : '500'
  } else {
    if (isCell) return '503'
    else return isSingleCell ? '505' : '502'
  }
}

function getIsSingleCell(
  // 锂离子电池 锂离子电芯 锂金属电池 锂金属电芯 单芯锂离子电池 单芯锂金属电池
  // '500' | '501' | '504' | '502' | '503' | '505'
  btyType: '500' | '501' | '504' | '502' | '503' | '505'
) {
  return !['500', '502'].includes(btyType)
}

function pekIsDangerous(
  wattHour: number,
  pkgInfo: '965' | '966' | '967' | '968' | '969' | '970',
  liContent: number,
  netWeight: number,
  isSingleCell: boolean
): boolean {
  if (wattHour > 100) return true
  if (wattHour > 20 && isSingleCell) return true
  if (liContent > 2) return true
  if (liContent > 1 && isSingleCell) return true
  switch (pkgInfo) {
    case '965':
      return true
    case '966':
    case '967':
      if (netWeight > 5) return true
    case '968':
      return true
    case '969':
    case '970':
      if (netWeight > 5) return true
  }
  return false
}

function getPkgInfo(
  isIon: boolean,
  otherDescribe: '0' | '1' | '2'
): '965' | '966' | '967' | '968' | '969' | '970' {
  switch (otherDescribe) {
    case '0':
      return isIon ? '965' : '968'
    case '1':
      return isIon ? '966' : '969'
    case '2':
      return isIon ? '967' : '970'
  }
}

function getUNNO(
  pkgInfo: '965' | '966' | '967' | '968' | '969' | '970'
): 'UN3480' | 'UN3481' | 'UN3090' | 'UN3091' {
  switch (pkgInfo) {
    case '965':
      return 'UN3480'
    case '966':
    case '967':
      return 'UN3481'
    case '968':
      return 'UN3090'
    case '969':
    case '970':
      return 'UN3091'
  }
}

function getIsCargoOnly(
  pkgInfo: '965' | '966' | '967' | '968' | '969' | '970',
  netWeight: number
) {
  switch (pkgInfo) {
    case '965':
    case '968':
      return true
    case '966':
    case '967':
    case '969':
    case '970':
      if (netWeight > 5) return true
  }
}

async function testVerify() {
  const response = await fetch(
    `https://${host}/rest/inspect/query?category=battery&projectNo=${systemIdLowercase.toUpperCase()}GZ&startDate=2024-09-03&endDate=2024-09-03&page=1&rows=100`,
    {
      method: 'GET',
      credentials: 'include' // 包含 cookies
    }
  )
  if (!response.ok) {
    console.log('请求失败1')
    return
  }
  const { total, rows }: { total: number; rows: PekData[] } =
    await response.json()
  const output: Record<string, Array<{ ok: boolean; result: string }>> = {}
  for (let i = 0; i < total; i++) {
    await verifySleep(100)
    if (rows[i]['editStatus'] !== 3) continue
    const projectId = rows[i]['projectId']
    console.log(rows[i]['projectNo'])
    const currentData = await getData(projectId)
    if (currentData === null) {
      console.log(projectId)
      console.log('请求失败2')
      continue
    }
    let result = []
    if (systemIdLowercase === 'pek') {
      result = checkPekBtyType(currentData as PekData)
    } else {
      result = checkSekBtyType(currentData as SekData)
    }
    if (result.length) {
      output[rows[i]['projectNo']] = result
    }
  }
  console.log(output)
}

async function verifySleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getAttchmentFiles(
  type: 'goodsfile' | 'batteryfile',
  projectId: string
) {
  const response = await fetch(
    `https://${window.location.host}/document/project/${type}/${projectId}`,
    {
      method: 'GET',
      credentials: 'include' // 包含 cookies
    }
  )
  if (!response.ok) {
    return ''
  }
  const res = await response.text()
  return res
}

async function checkAttchmentFile(
  type: 'goodsfile' | 'batteryfile',
  projectNo: string,
  projectId: string
) {
  const attchmentFilesName = type === 'goodsfile' ? '图片' : '概要'
  const attchmentFilesText = await getAttchmentFiles(type, projectId)
  if (!attchmentFilesText)
    return [{ ok: false, result: attchmentFilesName + '未上传' }]
  const rawFileName = attchmentFilesText.match(/"filename":"(.*?)\.pdf"/g)
  if (!rawFileName?.length)
    return [{ ok: false, result: attchmentFilesName + '未上传' }]
  const fileName = rawFileName[0].slice(12, 29)
  if (fileName !== projectNo)
    return [{ ok: false, result: attchmentFilesName + '上传错误' }]
  return []
}

async function checkAttchmentFiles(projectNo: string, projectId: string) {
  const check1 = await checkAttchmentFile('goodsfile', projectNo, projectId)
  const check2 = await checkAttchmentFile('batteryfile', projectNo, projectId)
  return [...check1, ...check2]
}
// 验证资料上传
// (async () => {console.log(await checkAttchmentFiles('SEKGZ202410245479','2c9180839267761d0192bd77b32f1091'))})()
