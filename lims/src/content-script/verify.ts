declare global {
  function checkPekBtyType(data: PekData): Array<{ ok: boolean; result: string }>
  function checkSekBtyType(data: SekData): Array<{ ok: boolean; result: string }>
}

const manifest = chrome.runtime.getManifest();
const WASM_MOD_URL = chrome.runtime.getURL('js/wasm/validators.js');
const WASM_ENABLE = JSON.stringify(manifest?.web_accessible_resources)?.includes('js/wasm/validators.js')
let mod: any = null;
const loadWasmModule = async () => {
  const mod = await import(WASM_MOD_URL);

  const isOk = await mod.default().catch((e: any) => {
    console.warn('Failed to init wasm module in content script. Probably CSP of the page has restricted wasm loading.', e);
    return null;
  });

  return isOk ? mod : null;
};
const systemIdLowercase = window.location.pathname.startsWith('/pek')
  ? 'pek'
  : 'sek'
const host = window.location.host
  ; (async () => {
    if (WASM_ENABLE) {
      console.log('wasm enabled')
      mod = await loadWasmModule();
      window.checkPekBtyType = mod.check_pek_bty
      window.checkSekBtyType = mod.check_sek_bty
    }
    await verifySleep(500)
    if (category !== "battery") return
    if (localConfig.verify === false) {
      console.log('未启用验证，退出脚本')
      return
    }
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
    // verifyButton.onclick = testVerify
    verifyButton.onclick = lims_verify_inspect
    targetParent.appendChild(verifyButton)
    console.log('验证按钮插入成功')
  })()

export type PekUNNO = '' | 'UN3480' | 'UN3481' | 'UN3090' | 'UN3091' | 'UN3171' | 'UN3556' | 'UN3557' | 'UN3558'
export type PekPkgInfo = '' | '965' | '966' | '967' | '968' | '969' | '970' | '952'
export type PkgInfoSubType = '' | '968, IB' | '966, II' | '967, II' | '969, II' | '970, II' | '965, IB' | '965, IA' | '966, I' | '967, I' | '968, IA' | '969, I' | '970, I' | '952'
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
  inspectionItem5Text1: '' | '965' | '966' | '967' | '968' | '969' | '970'
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
    result = window.checkPekBtyType(currentData as PekData)
  } else {
    result = window.checkSekBtyType(currentData as SekData)
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


// tests
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
      result = window.checkPekBtyType(currentData as PekData)
    } else {
      result = window.checkSekBtyType(currentData as SekData)
    }
    if (result.length) {
      output[rows[i]['projectNo']] = result
    }
  }
  console.log(output)
}