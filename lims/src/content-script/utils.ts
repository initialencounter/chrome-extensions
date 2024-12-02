const systemId = window.location.pathname.startsWith('/pek') ? 'PEKGZ' : 'SEKGZ'
const category = new URLSearchParams(window.location.search).get('category')
const localConfig = {
  customIcon: false,
  enableSetEntrust: true,
  enableCopyProjectNo: true,
  enableCopyProjectName: true,
  enablePreventCloseBeforeSave: true,
  enableSaveHotKey: true,
  enableImportHotKey: true,
  enableSetImportProjectNo: true,
  autoProjectNoPreset: false,
  pekProjectNoPreset: 'PEKGZ2024',
  sekProjectNoPreset: 'SEKGZ2024',
  enableSetQueryProjectNo: false,
  enableSetImportClassification: true,
  verify: true,
  category: 1,
  moonPay: true,
  amount: '500.00',
  tagNextYear: true,
  verifyButtonOnMiddle: false,
}

const configKeys: Array<keyof typeof localConfig> = [
  'customIcon',
  'enableSetEntrust',
  'enableCopyProjectNo',
  'enableCopyProjectName',
  'enablePreventCloseBeforeSave',
  'enableSaveHotKey',
  'enableImportHotKey',
  'enableSetImportProjectNo',
  'autoProjectNoPreset',
  'pekProjectNoPreset',
  'sekProjectNoPreset',
  'enableSetQueryProjectNo',
  'enableSetImportClassification',
  'verify',
  'category',
  'moonPay',
  'amount',
  'tagNextYear',
  'verifyButtonOnMiddle',
]
chrome.storage.sync.get(configKeys, function (data) {
  for (const key of Object.keys(data) as Array<keyof typeof localConfig>) {
    console.log(key, data[key])
    // @ts-ignore
    localConfig[key] = data[key]
  }
})
if (!window) {
  checkDate([])
  parseDate('')
  sleep(0)
  setProjectNoToClipText()
  getClipboardText()
  checkProjectNo('')
  getMonthsAgoProjectNo()
  console.log(configKeys, localConfig, category)
}
function checkDate(dateText: string[]) {
  for (const text of dateText) {
    if (!text) return false
    const [year, month, day] = text.split('-')
    if (year.length < 4 || Number(year) < 2020) {
      return false
    }
    if (isNaN(Number(month)) || Number(month) < 1 || Number(month) > 12) {
      return false
    }
    if (isNaN(Number(day)) || Number(day) < 1 || Number(day) > 31) {
      return false
    }
  }

  return dateText
}

function parseDate(dateText: string) {
  dateText = dateText.replace(/[^0-9]/g, '')
  if (dateText.length < 9) {
    return ['', '']
  }
  const year = dateText.slice(0, 4)
  const month = dateText.slice(4, 6)
  const day = dateText.slice(6, 8)
  if (month.length < 2) {
    return [`${year}-01-01`, `${year}-12-31`]
  }
  if (day.length < 2) {
    return [`${year}-${month}-01`, `${year}-${month}-31`]
  }
  return [`${year}-${month}-${day}`, `${year}-${month}-${day}`]
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function setProjectNoToClipText() {
  const projectNoSpan = document.getElementById('projectNo')
  const projectNo = projectNoSpan?.innerText // Add null check here
  navigator.clipboard.writeText(projectNo ?? '')
  // @ts-expect-error: use Qmsg from assets
  Qmsg['success']('已复制项目编号', { timeout: 500 })
}

async function getClipboardText() {
  try {
    return await navigator.clipboard.readText()
  } catch {
    return ''
  }
}

function checkProjectNo(projectNo: string) {
  if (projectNo.indexOf(systemId) == -1) {
    return false
  }
  if (!parseDate(projectNo)[0]) {
    return false
  }
  return true
}

function getMonthsAgoProjectNo() {
  const currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() - 1)
  return systemId + currentDate.toISOString().slice(0, 7).replace('-', '')
}
