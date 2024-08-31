const systemIdLowercase = window.location.pathname.startsWith('/pek')
  ? 'pek'
  : 'sek'
const host = window.location.host
;(async () => {
  await sleep(200)
  console.log('replaceData is running...')
  chrome.runtime.onMessage.addListener(async function (message) {
    if (message !== 'lims_replace_data') return
    console.log('Message received from background script:', message)
    // const status = await mainReplaceData()
    // if (status.ok) {
    //   // @ts-expect-error: use Qmsg from assets
    //   Qmsg['success'](status.result)
    //   location.reload()
    // } else {
    //   // @ts-expect-error: use Qmsg from assets
    //   Qmsg['error'](status.result)
    // }
  })
})()

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
  if (!response.ok) {
    return null
  }
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
  if (!response.ok) {
    return { ok: false, result: '替换失败' }
  }
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
  if (projectNo.indexOf('PEK') === -1) {
    systemId_ = 'sek'
  }
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
  if (!checkReverseProjectNo(targetProjectNo)) {
    return { ok: false, result: '项目编号格式错误' }
  }
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
