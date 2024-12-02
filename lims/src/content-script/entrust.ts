interface Task {
  assignee: string
  attchmentFiles: string[]
  backId: null
  category: string
  comment: null
  companyName: string
  completeTime: null
  completeUser: null
  createTime: number
  entrustId: string
  freezed: boolean
  id: string
  itemCName: string
  itemSendSample: number
  nextYear: boolean
  parallel: boolean
  projectDate: number
  projectId: string
  projectNo: string
  serviceType: number
  submitDate: string
  submitUser: string
  submitUserName: string
  systemId: string
  taskName: string
}

interface User {
  userId: string
  userName: string
}

interface EntrustList {
  rows: EntrustRow[];
  total: number;
}

interface EntrustRow {
  amount?: number;
  category?: null;
  checkLocation?: null;
  checkLocationName?: string;
  contractId?: null;
  createdBy?: null;
  createdDate?: string;
  destination?: null;
  displayStatus?: string;
  editStatus?: number;
  entrustNo?: string;
  freezed?: string;
  id?: string;
  images?: null;
  itemAttachFile?: null;
  itemBrand?: null;
  itemCName?: string;
  itemColor?: null;
  itemDanger?: boolean;
  itemDangerReason?: null;
  itemDesc?: null;
  itemEName?: null;
  itemFlashPoint?: null;
  itemMeltingPoint?: null;
  itemNameChanged?: boolean;
  itemOtherAttachFileDetail?: null;
  itemSampleHandle?: number;
  itemSampleHandleOther?: null;
  itemSendSample?: number;
  itemSmell?: null;
  itemSpec?: null;
  itemStatus?: null;
  manufacturersCName?: null;
  manufacturersEName?: null;
  market?: string;
  modifiedBy?: null;
  modifiedDate?: null;
  nextYear?: boolean;
  owner?: null;
  ownerName?: null;
  paymentCompany?: null;
  paymentCompanyContact?: null;
  paymentCompanyContactName?: null;
  paymentCompanyName?: null;
  payStatus?: number;
  payType?: number;
  pieces?: null;
  principal?: string;
  principalContact?: null;
  principalContactName?: null;
  principalEName?: null;
  principalExhort?: number;
  principalExhortDetail?: null;
  principalName?: string;
  projectId?: string;
  projectNo?: string;
  repeat?: string;
  reportCopy?: number;
  reportCreated?: boolean;
  reportLocation?: null;
  reportLocationName?: string;
  reportPrinted?: boolean;
  reportType?: number;
  reportWay?: number;
  sampleReceived?: boolean;
  serviceType?: number;
  submitDate?: null;
  systemId?: null;
  techRemark?: null;
  trustee?: null;
  trusteeName?: null;
  waybillNo?: null;
  webSignature?: boolean;
  webWt?: boolean;
}

let globalAssignUser = ''
let globalCheckAssignUser = true
chrome.storage.sync.get(['assignUser', 'nextYearColor', 'nextYearBgColor', 'onekeyAssign', 'checkAssignUser', 'showInspectFormLink'], async function (data) {
  const assignUser = data.assignUser as string
  globalAssignUser = assignUser
  globalCheckAssignUser = data.checkAssignUser === false ? false : true
  console.log('一键分配脚本运行中...', data)
  if (!(data.onekeyAssign === false)) await insertElement(assignUser)
  if (!(data.showInspectFormLink === false)) observeItemNumberList1()
  // 设置下一年报告颜色
  removeOrange(data.nextYearColor ?? '', data.nextYearBgColor ?? '#76EEC6')
})

function getIds(): string[] {
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]'
  ) as NodeListOf<HTMLInputElement>
  const filteredCheckboxes = Array.from(checkboxes).filter(function (checkbox) {
    return checkbox.checked
  })
  return filteredCheckboxes.map(function (checkbox) {
    return checkbox.value
  })
}

async function checkAssignUID(users: User[], uid: string) {
  if (!uid) return false
  if (!users.length) return false
  for (let i = 0; i < users.length; i++) {
    if (users[i].userId === uid) return true
  }
  return false
}

async function getUsers(): Promise<User[]> {
  const response = await fetch(
    `https://${window.location.host}/rest/flow/task/users/inspect`
  )
  if (!response.ok) return []
  const users: User[] = await response.json()
  return users
}

async function assignSelectId(uid: string) {
  if (uid === '2c91808478367c2801788230b248470e' && globalCheckAssignUser) {
    let res = confirm('确定主检员是正确的吗？')
    if (!res) return
  }
  const ids = getIds()
  if (!ids.length) return
  console.log('assignSelectId:', ids)
  const receiveIds = await ReceiveSubmit(ids, 'receive')
  if (!receiveIds.length) return
  console.log('receiveIds:', receiveIds)
  const submitIds = await ReceiveSubmit(receiveIds, 'submit')
  if (!submitIds.length) return
  console.log('submitIds:', submitIds)
  const taskIds = await getTaskIds(submitIds)
  if (!taskIds) return
  console.log('taskIds:', taskIds)
  await assignTask(taskIds, uid)
  const refreshButton = document.querySelector("body > div.panel.easyui-fluid > div.easyui-panel.panel-body.panel-noscroll > div > div > div.datagrid-pager.pagination > table > tbody > tr > td:nth-child(13) > a") as HTMLAnchorElement
  if (refreshButton) refreshButton.click()
}

async function entrustSleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ReceiveSubmit(
  ids: string[],
  task: 'receive' | 'submit'
): Promise<string[]> {
  if (!ids.length) return []
  await entrustSleep(50)
  const response = await fetch(
    `https://${window.location.host}/rest/sales/entrust/entrusts/${task}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 包含 cookies
      body: JSON.stringify(ids)
    }
  )
  if (!response.ok) {
    console.error('receive failed')
    return []
  }
  const data = await response.json()
  return data['result']
}

async function getTaskIds(ids: string[]): Promise<string[]> {
  if (!ids.length) return []
  await entrustSleep(50)
  const currentDate = new Date()
  const date = currentDate.toISOString().split('T')[0]
  currentDate.setMonth(currentDate.getMonth() - 1)
  const startDate = currentDate.toISOString().split('T')[0]
  const response = await fetch(
    `https://${window.location.host}/rest/flow/task/get/assignInspect?projectStartDate=${startDate}&projectEndDate=${date}&projectState=0&page=1&rows=10`,
    {
      method: 'GET',
      credentials: 'include' // 包含 cookies
    }
  )
  if (!response.ok) {
    console.error('get task ids failed')
    return []
  }
  const data = await response.json()
  const taskIds = data['rows']
    .filter(function (row: Task) {
      for (let i = 0; i < ids.length; i++) {
        if (row['entrustId'] === ids[i]) return true
      }
    })
    .map((item: Task) => item.id)
  return taskIds
}

async function assignTask(taskIds: string[], uid: string) {
  if (!taskIds.length) return
  if (!uid) return
  const body = {
    userId: uid,
    taskIds: taskIds
  }
  const response = await fetch(
    `https://${window.location.host}/rest/flow/task/do/assignInspect`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 包含 cookies
      body: JSON.stringify(body)
    }
  )
  if (!response.ok) {
    console.error('assign task failed1')
    return
  }
  const result = await response.json()
  if (result['result'] === 'success') {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['success']('分配成功')
  } else {
    console.error('assign task failed2')
    // @ts-expect-error: use Qmsg from assets
    Qmsg['error']('分配失败')
  }
}

async function insertElement(uid: string) {
  await entrustSleep(200)
  const targetParent = document.getElementById('toolbar')
  if (!targetParent) return
  const div = document.createElement('div')
  div.style.display = 'flex'
  div.style.gap = '4px'
  // button
  const assignButton = document.createElement('a')
  assignButton.href = 'javascript:void(0);'
  assignButton.className = 'easyui-linkbutton l-btn l-btn-small'
  assignButton.dataset.options = 'width:120'
  assignButton.style.width = '118.4px'
  assignButton.innerHTML = `
  <span class="l-btn-left" style="margin-top: 0px;">
    <span class="l-btn-text">一键分配给：</span>
  </span>
  `
  assignButton.onclick = lims_onekey_assign_click
  div.appendChild(assignButton)

  // select
  const select = document.createElement('select')
  select.id = 'lims_onekey_assign_user'
  select.style.width = '120px'
  select.style.height = '26px'
  select.style.border = '1px solid #bbb'
  select.style.background = 'linear-gradient(to bottom,#ffffff 0,#e6e6e6 100%)'
  select.className = 'easyui-linkbutton l-btn l-btn-small'
  select.setAttribute('textboxname', 'systemId')
  select.setAttribute('comboname', 'systemId')
  const users = await getUsers()
  users.forEach(function (user) {
    const option = document.createElement('option')
    option.value = user.userId
    option.innerText = user.userName
    select.appendChild(option)
  })
  if (await checkAssignUID(users, uid)) select.value = uid
  div.appendChild(select)

  targetParent.appendChild(div)
  console.log('一键分配按钮插入成功')
}

async function lims_onekey_assign_click() {
  const select = document.getElementById(
    'lims_onekey_assign_user'
  ) as HTMLSelectElement
  const selectUid = select.value
  if (!selectUid) return
  if (globalAssignUser !== selectUid) {
    chrome.storage.sync.set({ assignUser: selectUid })
    globalAssignUser = selectUid
  }
  await assignSelectId(selectUid)
}

async function sleepEntrust(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function removeOrange(nextYearColor: string, nextYearBgColor: string) {
  setInterval(() => {
    if (nextYearColor === undefined) nextYearColor = ''
    if (nextYearBgColor === undefined) nextYearBgColor = '#76EEC6'
    for (var i = 0; i < 10; i++) {
      const target = document.querySelector(`#datagrid-row-r1-1-${i}`) as HTMLElement
      if (target.style.color !== 'orange') continue
      target.style.color = nextYearColor
      target.style.backgroundColor = nextYearBgColor
      const target2 = document.querySelector(`#datagrid-row-r1-2-${i}`) as HTMLElement
      target2.style.color = nextYearColor
      target2.style.backgroundColor = nextYearBgColor
    }
  }, 100)
}

let globalItemNumberList1: string[] = []
let globalItemNumberList2: EntrustRow[] = []

async function insertInspectFormLink(length1: number) {
  let url = getInspectFormUpdateUrl()
  await updateGlobalItemNumberList2(url)
  if (!url) return
  let projectIdMap: Record<string, number> = {}
  for (let j = 0; j < globalItemNumberList2.length; j++) {
    // @ts-ignore
    projectIdMap[globalItemNumberList2[j]['projectNo']] = j
  }
  for (let i = 0; i < length1; i++) {
    let targetIndex: number | undefined = projectIdMap[globalItemNumberList1[i]]
    if (targetIndex === undefined) continue
    const params = new URLSearchParams({
      projectId: globalItemNumberList2[targetIndex]['projectId'] ?? '',
      entrustId: globalItemNumberList2[targetIndex]['id'] ?? '',
      category: 'battery',
      from: 'query'
    })
    let link = `/pek/inspect?${params.toString()}`
    const itemCNameElement = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(3) > div`) as HTMLDivElement
    if (!itemCNameElement) {
      continue
    }
    const operateElement = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(14) > div`) as HTMLAnchorElement
    if (operateElement) {
      const inspectElement = document.createElement('a')
      inspectElement.href = link
      inspectElement.target = '_blank'
      inspectElement.innerHTML = '检验单'
      operateElement.appendChild(document.createTextNode(' '))
      operateElement.appendChild(inspectElement)
    }
    let itemCName = itemCNameElement.innerHTML
    const innerHTML = `<a href="${link}" target="_blank" style="text-decoration: none; color: inherit;"
    onmouseover="this.style.textDecoration='underline'; this.style.color='blue';" 
    onmouseout="this.style.textDecoration='none'; this.style.color='inherit';">${itemCName}</a>`
    itemCNameElement.innerHTML = innerHTML
  }
}


function getInspectFormUpdateUrl(): string {
  const startDate = (document.querySelector("#toolbar > form > table > tbody > tr:nth-child(2) > td:nth-child(4) > span:nth-child(2) > input.textbox-text.validatebox-text") as HTMLInputElement)?.value
  const endDate = (document.querySelector("#toolbar > form > table > tbody > tr:nth-child(2) > td:nth-child(4) > span:nth-child(4) > input.textbox-text.validatebox-text") as HTMLInputElement)?.value
  if (!startDate || !endDate) return ''
  const systemId = (document.querySelector("#toolbar > form > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > input.textbox-value") as HTMLInputElement)?.value ?? ''
  const reportTypeString =  (document.querySelector("#toolbar > form > table > tbody > tr:nth-child(1) > td:nth-child(4) > span > input.textbox-text.validatebox-text") as HTMLInputElement).value ?? ''
  let reportType = ''
  if (reportTypeString === '全部') reportType = ''
  if (reportTypeString === '初验') reportType = '0'
  if (reportTypeString === '换证') reportType = '1'
  const principal = (document.querySelector("#principal") as HTMLInputElement)?.value ?? ''
  const itemCEName = (document.querySelector("#itemCEName") as HTMLInputElement)?.value ?? ''
  let pyType = (document.querySelector("#toolbar > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > span > input.textbox-text.validatebox-text") as HTMLInputElement)?.value ?? ''
  if (pyType === '全部') pyType = ''
  if (pyType === '现结') pyType = '0'
  if (pyType === '月结') pyType = '1'
  const rows = (document.querySelector("body > div.panel.easyui-fluid > div.easyui-panel.panel-body.panel-noscroll > div > div > div.datagrid-pager.pagination > table > tbody > tr > td:nth-child(1) > select") as HTMLInputElement)?.value ?? '10'
  let pages = (document.querySelector("body > div.panel.easyui-fluid > div.easyui-panel.panel-body.panel-noscroll > div > div > div.datagrid-pager.pagination > table > tbody > tr > td:nth-child(7) > input") as HTMLInputElement)?.value ?? '1'
  if (pages === '0') pages = '1'
  const url = `${window.location.origin}/rest/sales/entrust?systemId=${systemId}&reportType=${reportType
    }&principal=${principal}&itemCEName=${itemCEName}&payType=${pyType}&startDate=${startDate}&endDate=${endDate}&page=${pages}&rows=${rows}`
  return url
}

function updateGlobalItemNumberList1(): string[] {
  const dataGridRow1 =  document.querySelector("#datagrid-row-r1-1-0")
  if (!dataGridRow1) return []
  const gridElement = dataGridRow1.parentElement
  if (!gridElement) return []
  const dataGridRows = gridElement.childNodes.length
  const itemNumberList1: string[] = []
  for (let i = 0; i < dataGridRows; i++) {
    const itemNumberElement = document.querySelector(`#datagrid-row-r1-1-${i} > td:nth-child(3) > div > a`) as HTMLAnchorElement
    if (itemNumberElement) itemNumberList1.push(itemNumberElement.innerText)
  }
  globalItemNumberList1 = itemNumberList1
  return itemNumberList1
}

async function updateGlobalItemNumberList2(link: string) {
  const response = await fetch(link)
  if (!response.ok) return []
  const data: EntrustList = await response.json()
  const itemNumberList2: EntrustRow[] = data['rows']
  globalItemNumberList2 = itemNumberList2
}

function observeItemNumberList1() {
  setInterval(async () => {
    updateGlobalItemNumberList1()
    let length1 = globalItemNumberList1.length
    let length2 = globalItemNumberList2.length
    if (length1 !== length2) {
      insertInspectFormLink(length1)
    }else {
      for (let i = 0; i < (length1 > length2 ? length1 : length2); i++) {
        if (globalItemNumberList1[i] !== globalItemNumberList2[i]['projectNo']) {
          insertInspectFormLink(length1)
          break
        }
      }
    }
  }, 100)
}
