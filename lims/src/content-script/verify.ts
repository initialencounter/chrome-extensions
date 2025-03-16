import type { PekData, SekData } from '../../Validators/ts/src/shared/types/index'
import type { AttachmentInfo, SummaryFromLLM, SummaryInfo } from '../../Validators/ts/src/shared/types/attachment'
import type { EntrustModelDocx } from '../../Validators/ts/src/shared/types/entrust'

declare global {
  function checkPekBtyType(data: PekData): Array<{ ok: boolean; result: string }>
  function checkSekBtyType(data: SekData): Array<{ ok: boolean; result: string }>
  function checkPekAttachment(data: PekData, attachmentInfo: AttachmentInfo, entrustData: EntrustModelDocx): Array<{ ok: boolean; result: string }>
  function checkSekAttachment(data: SekData, attachmentInfo: AttachmentInfo, entrustData: EntrustModelDocx): Array<{ ok: boolean; result: string }>
  function checkSummaryFromLLM(summaryFromLLM: SummaryFromLLM, summaryInfo: SummaryInfo): Array<{ ok: boolean; result: string }>
}

const isInspect = new URLSearchParams(window.location.search).get('from') === null;
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
    verifyButton.id = 'lims-verifyButton'
    verifyButton.href = 'javascript:void(0);'
    verifyButton.className = 'easyui-linkbutton l-btn l-btn-small'
    verifyButton.style.background = '#ffffff'
    // verifyButton.style.margin = '0 3px 0 3px'
    // hover
    verifyButton.onmouseover = function () {
      verifyButton.style.background = '#54a124'
    }
    verifyButton.onmouseout = function () {
      verifyButton.style.background = '#ffffff'
    }
    verifyButton.innerHTML = `
    <span class="l-btn-left l-btn-icon-left">
      <span class="l-btn-text">验证</span>
      <svg class="l-btn-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#bbbbbb"><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/></svg>
    </span>
    `
    // verifyButton.onclick = testVerify
    verifyButton.onclick = lims_verify_inspect
    const verifyButton2 = document.createElement('a')
    verifyButton2.id = 'lims-verifyButton2'
    verifyButton2.href = 'javascript:void(0);'
    verifyButton2.className = 'easyui-linkbutton l-btn l-btn-small'
    verifyButton2.style.background = '#ffffff'
    verifyButton2.onmouseover = function () {
      verifyButton2.style.background = '#54a124'
    }
    verifyButton2.onmouseout = function () {
      verifyButton2.style.background = '#ffffff'
    }
    verifyButton2.innerHTML = `
    <span class="l-btn-left l-btn-icon-left">
      <span class="l-btn-text">验证</span>
      <svg class="l-btn-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#bbbbbb"><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/></svg>
    </span>
    `
    verifyButton2.onclick = lims_verify_inspect
    const targetChild2 = document.getElementById('importBtn')
    if (!targetChild2) return
    const targetParent2 = targetChild2.parentElement
    if (!targetParent2) return
    targetParent2.appendChild(verifyButton2)
    const submit = document.getElementById('submitBtn0')
    const submit2 = document.getElementById('submitBtn')
    if (isInspect && submit && localConfig.verifyButtonOnMiddle === true) {
      targetParent.insertBefore(verifyButton, submit)
      targetParent2.insertBefore(verifyButton2, submit2)
    } else {
      targetParent.appendChild(verifyButton)
      targetParent2.appendChild(verifyButton2)
    }
    createMask()
    console.log('验证按钮插入成功')
  })()

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

function getCurrentProjectNo() {
  const projectNoElement = document.getElementById('projectNo') as HTMLInputElement
  if (!projectNoElement) return null
  const projectNo = projectNoElement.innerHTML
  if (!projectNo) return null
  return projectNo
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
  if (currentProjectId === null) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['warning']('获取项目ID失败')
    return
  }
  const projectNo = getCurrentProjectNo()
  if (!projectNo) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['warning']('获取项目编号失败')
    return
  }

  let result = []
  let dataFromForm: PekData | SekData
  if (systemIdLowercase === 'pek') {
    dataFromForm = getFormData<PekData>(systemIdLowercase)
    result = window.checkPekBtyType(dataFromForm)
  } else {
    dataFromForm = getFormData<SekData>(systemIdLowercase)
    result = window.checkSekBtyType(dataFromForm)
  }
  result.push(
    ...(await checkAttchmentFiles(projectNo, currentProjectId))
  )

  result.push(...(await checkAttachment()))

  if (!result.length) {
    const verifyButton = document.getElementById('lims-verifyButton')?.children[0]?.children[1] as SVGAElement
    const verifyButton2 = document.getElementById('lims-verifyButton2')?.children[0]?.children[1] as SVGAElement
    if (verifyButton) verifyButton.setAttribute('fill', '#54a124')
    if (verifyButton2) verifyButton2.setAttribute('fill', '#54a124')
    // @ts-expect-error: use Qmsg from assets
    Qmsg['success']('初步验证通过', { timeout: 500 })
    return
  }
  // @ts-expect-error: use Qmsg from assets
  Qmsg['warning']('初步验证未通过' + JSON.stringify(result, null, 2), {
    showClose: true,
    timeout: 4000
  })
}

async function checkAttachment() {
  if (localConfig.enableCheckAttachment === false) return []
  try {
    const projectNo = getCurrentProjectNo()
    if (!projectNo) return []
    const attachmentInfo: AttachmentInfo = await getProjectAttachmentInfo(projectNo)
    if (!localConfig.enableLabelCheck) {
      attachmentInfo.goods.labels = ['pass']
    }
    console.log(attachmentInfo, 'attachmentInfo')
    if (!attachmentInfo) return []
    const entrustDataText = await getEntrustData()
    const entrustData = parseEntrust(entrustDataText)
    return checkSummary(attachmentInfo, entrustData)
  } catch (e) {
    console.log(e)
    return [{ ok: false, result: "附件解析失败" }]
  }
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
  for (let i = 0; i < 100; i++) {
    await verifySleep(100)
    // if (rows[i]['editStatus'] !== 3) continue
    try {
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
        if (result.length === 1 && result[0].result.includes("请忽略")) {
        } else {
          console.log(result)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}

const PekFullData = {
  "createdBy": "",
  "createdDate": "",
  "modifiedBy": "",
  "modifiedDate": "",
  "id": "",
  "projectId": "",
  "brands": "",
  "color": "",
  "model": "",
  "shape": "",
  "size": "",
  "grossWeight": "",
  "btyCount": "",
  "netWeight": "",
  "type1": 1,
  "type2": 0,
  "otherDescribe": "",
  "otherDescribeChecked": "",
  "otherDescribeCAddition": "",
  "otherDescribeEAddition": "",
  "inspectionItem1": 1,
  "inspectionItem1Text1": "",
  "inspectionItem1Text2": "",
  "inspectionItem1Text3": "",
  "inspectionItem1Text4": "",
  "inspectionItem2": 1,
  "inspectionItem2Text1": "",
  "inspectionItem2Text2": "",
  "inspectionItem3": 1,
  "inspectionItem3Text1": "",
  "inspectionItem4": 1,
  "inspectionItem4Text1": "",
  "inspectionItem5": 0,
  "inspectionItem5Text1": "",
  "inspectionItem6": 0,
  "result1": "",
  "packPassengerCargo": "",
  "packSubDanger": "",
  "packCargo": "",
  "packSpecial": "",
  "remarks": "",
  "projectNo": "",
  "principalName": null,
  "itemCName": "",
  "itemEName": "",
  "checkLocation": "",
  "checkLocationName": "",
  "appraiser": "",
  "appraiserName": "",
  "appraiseDate": "",
  "according": "",
  "conclusions": 0,
  "unno": "",
  "psn": "",
  "classOrDiv": "",
  "pg": "",
  "checked": false,
  "checker": null,
  "checkerName": null,
  "checkDate": null,
  "editStatus": 0,
  "market": ""
}

const SekFullData = {
  "according": "",
  "appraiseDate": "",
  "appraiser": "",
  "appraiserName": "",
  "btyBrand": "",
  "btyColor": "",
  "btyCount": "",
  "btyCountChecked": "",
  "btyGrossWeight": "",
  "btyGrossWeightChecked": "",
  "btyKind": "",
  "btyNetWeight": "",
  "btyNetWeightChecked": "",
  "btyShape": "",
  "btySize": "",
  "btyType": "",
  "checkDate": 1725614365000,
  "checked": false,
  "checker": "",
  "checkerName": "",
  "checkLocation": "",
  "checkLocationName": "",
  "classOrDiv": "",
  "comment": "",
  "commentExtra": "",
  "conclusions": 0,
  "createdBy": "",
  "createdDate": "",
  "editStatus": 3,
  "id": "",
  "inspectionItem1": "",
  "inspectionItem1Text1": "",
  "inspectionItem1Text2": "",
  "inspectionItem2": "",
  "inspectionItem3": "",
  "inspectionItem4": "",
  "inspectionItem5": "",
  "inspectionItem6": "",
  "inspectionItem7": "",
  "inspectionItem8Cn": "",
  "inspectionItem8En": "",
  "inspectionItem9Cn": "",
  "inspectionItem9En": "",
  "inspectionResult1": "",
  "inspectionResult2": "",
  "inspectionResult3": "",
  "inspectionResult4": "",
  "inspectionResult5": "",
  "inspectionResult6": "",
  "inspectionResult7": "",
  "inspectionResult8": "",
  "inspectionResult9": "",
  "itemCName": "",
  "itemEName": "",
  "market": "",
  "modifiedBy": "",
  "modifiedDate": "",
  "otherDescribe": "",
  "otherDescribeCAddition": "",
  "otherDescribeChecked": "",
  "otherDescribeEAddition": "",
  "pg": "",
  "principalName": null,
  "projectId": "",
  "projectNo": "",
  "psn": "",
  "remarks": "",
  "unno": ""
}

const PekTypeTransMap = [
  'type1',
  'type2',
  'inspectionItem1',
  'inspectionItem2',
  'inspectionItem3',
  'inspectionItem4',
  'inspectionItem5',
  'inspectionItem6',
  'conclusions',
]

const SekTypeTransMap = [
  'conclusions',
]
function getFormData<T>(systemId: 'pek' | 'sek'): T {
  const form = document.querySelector("#batteryInspectForm") as HTMLFormElement;
  // 获取表单数据
  const formData = new FormData(form);
  const data: Partial<T> = {};

  let projectNo = getCurrentProjectNo()
  // @ts-ignore
  data['projectNo'] = projectNo ?? ''
  // 遍历 FormData 并构建数据对象
  formData.forEach((value, name) => {
    if (data[name as keyof Partial<T>]) {
      // 如果已存在该字段，添加逗号并附加新值
      data[name as keyof Partial<T>] = (data[name as keyof Partial<T>] + `,${value}`) as T[keyof T];
    } else {
      // 如果是新字段，直接赋值
      data[name as keyof Partial<T>] = value as T[keyof T];
    }
  })
  if (!(data['unno' as keyof Partial<T>] as string).startsWith('UN') && (data['unno' as keyof Partial<T>] as string).trim().length > 0) {
    (data['unno' as keyof Partial<T>] as string) = 'UN' + data['unno' as keyof Partial<T>]
  }
  if (systemId === 'pek') {
    Object.keys(PekFullData).forEach(key => {
      if (data[key as keyof Partial<T>] === undefined) {
        // @ts-ignore
        data[key as keyof Partial<T>] = PekFullData[key]
      }
    });
    PekTypeTransMap.forEach(key => {
      if (data[key as keyof Partial<T>] !== undefined) {
        data[key as keyof Partial<T>] = Number(data[key as keyof Partial<T>]) as T[keyof T]
      }
    })
  } else {
    Object.keys(SekFullData).forEach(key => {
      if (data[key as keyof Partial<T>] === undefined) {
        // @ts-ignore
        data[key as keyof Partial<T>] = SekFullData[key]
      }
    });
    SekTypeTransMap.forEach(key => {
      if (data[key as keyof Partial<T>] !== undefined) {
        data[key as keyof Partial<T>] = Number(data[key as keyof Partial<T>]) as T[keyof T]
      }
    })
  }
  return data as T;
}


async function getEntrustData() {
  const entrustId = new URLSearchParams(window.location.search).get('entrustId')
  if (!entrustId) return null
  const response = await fetch(
    `${window.location.origin}//document/basicinfo/${entrustId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'text/html',
        'Referer': window.location.href,
      }
    }
  )
  if (!response.ok) return null
  return await response.text() as string
}

function parseEntrust(entrustData: string | null): EntrustModelDocx {
  let res: EntrustModelDocx = {
    consignor: '',
    manufacturer: '',
  }
  if (!entrustData) return res
  const parser = new DOMParser();
  const doc = parser.parseFromString(entrustData, 'text/html');
  if (!doc) return res
  const consignor = doc.querySelector("body > div.main-content > div:nth-child(3) > div:nth-child(2) > div > div > div")
  const manufacturer = doc.querySelector("body > div.main-content > div:nth-child(7) > div:nth-child(1) > div > div > div")
  if (!consignor || !manufacturer) return res
  return {
    consignor: consignor.innerHTML.trim(),
    manufacturer: manufacturer.innerHTML.trim(),
  }
}

async function getProjectAttachmentInfo(projectNo: string) {
  // const response = await fetch(
  //   `${localConfig.aircraftServer}/get-attachment-info/${projectNo}?label=${localConfig.enableLabelCheck ? '1' : '0'}`,
  //   {
  //     method: 'GET',
  //     mode: 'cors',
  //   }
  // )
  // if (!response.ok) {
  //   console.error('获取项目信息失败:', response)
  //   return null
  // }
  // return await response.json()
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getAttachmentInfo',
      aircraftServer: localConfig.aircraftServer,
      projectNo: projectNo,
      label: localConfig.enableLabelCheck ? '1' : '0'
    });
    return response;
  } catch (error) {
    console.error('获取项目信息失败:', error);
    return null;
  }
}


function checkSummary(attachmentInfo: AttachmentInfo, entrustData: EntrustModelDocx) {
  let result = []
  let dataFromForm: PekData | SekData
  if (systemIdLowercase === 'pek') {
    dataFromForm = getFormData<PekData>(systemIdLowercase)
    result = window.checkPekAttachment(dataFromForm, attachmentInfo, entrustData)
  } else {
    dataFromForm = getFormData<SekData>(systemIdLowercase)
    result = window.checkSekAttachment(dataFromForm, attachmentInfo, entrustData)
  }
  return result
}

function createMask() {
  const mask = document.createElement('div');
  mask.id = 'upload-mask';
  mask.style.position = 'fixed';
  mask.style.top = '0';
  mask.style.left = '0';
  mask.style.width = '100%';
  mask.style.height = '100%';
  mask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  mask.style.zIndex = '9999';
  mask.style.display = 'none';
  document.body.appendChild(mask);
}

function showMask() {
  const mask = document.getElementById('upload-mask');
  if (mask) {
    mask.style.display = 'block';
  }
}

function hideMask() {
  const mask = document.getElementById('upload-mask');
  if (mask) {
    mask.style.display = 'none';
  }
}


function preventDefault(event: DragEvent) {
  event.stopPropagation();
  event.preventDefault();
}

interface FileData {
  name: string,
  type: string,
  data: number[],
}

async function dropEvent(event: DragEvent) {
  event.stopPropagation();
  event.preventDefault();
  showMask();
  const fileList = event.dataTransfer!.files;

  const filesData: FileData[] = [];

  // 遍历 FileList 并将每个文件转换为 ArrayBuffer
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const reader = new FileReader();
    await new Promise<void>((resolve) => {
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer);
        filesData.push({
          name: file.name,
          type: file.type,
          data: Array.from(uint8Array)
        });
        resolve();
      };
      reader.readAsArrayBuffer(file);
    });
  }
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'uploadLLMFiles',
      aircraftServer: localConfig.aircraftServer,
      files: filesData,
    });
    let summaryFromLLM = JSON.parse(JSON.parse(response));
    console.log('summaryFromLLM', summaryFromLLM)
    await llmChecker(summaryFromLLM);
  } catch (error) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['warning']('LLM验证未通过' + JSON.stringify(error, null, 2), {
      showClose: true,
      timeout: 4000
    });
  }
  hideMask();
}

async function llmChecker(summaryFromLLM: SummaryFromLLM) {
  const projectNo = getCurrentProjectNo()
  if (!projectNo) return []
  const attachmentInfo: AttachmentInfo = await getProjectAttachmentInfo(projectNo)
  let summaryInfo = attachmentInfo.summary;
  let result = window.checkSummaryFromLLM(summaryFromLLM, summaryInfo);
  if (!result.length) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['success']('LLM验证通过', { timeout: 500 })
    return
  }
  // @ts-expect-error: use Qmsg from assets
  Qmsg['warning']('LLM验证未通过' + JSON.stringify(result, null, 2), {
    showClose: true,
    timeout: 4000
  })
}

document.ondragover = preventDefault
document.ondragenter = preventDefault
document.ondragleave = preventDefault
document.ondrop = dropEvent