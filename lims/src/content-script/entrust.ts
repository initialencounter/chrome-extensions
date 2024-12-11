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
let hiddenTimeEntrustList: number | null = null;

chrome.storage.sync.get(['assignUser', 'nextYearColor', 'nextYearBgColor', 'onekeyAssign', 'checkAssignUser', 'showInspectFormLink', 'freshHotkey', 'autoRefreshDuration'], async function (data) {
  if (!(data.freshHotkey === false)) {
    listenFreshHotkeyEntrustList()
    listenVisibilityChangeEntrustList(data?.autoRefreshDuration ?? 10000)
  }
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
  doFreshEntrustList()
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

async function insertInspectFormLink(length1: number) {
  for (let i = 0; i < length1; i++) {
    const projectNo = globalItemNumberList1[i]
    const itemCNameElement = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(3) > div`) as HTMLDivElement
    if (!itemCNameElement) {
      continue
    }
    if (itemCNameElement.innerHTML === '') {
      continue
    }
    const operateElement = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(14) > div`) as HTMLAnchorElement
    if (operateElement) {
      if (operateElement.innerHTML.includes('检验单')) {
        continue
      }
      const inspectElement = document.createElement('a')
      inspectElement.role = 'button'
      inspectElement.innerHTML = '检验单'
      inspectElement.onclick = () => openWindow(projectNo)
      inspectElement.style.cursor = 'pointer'
      operateElement.appendChild(document.createTextNode(' '))
      operateElement.appendChild(inspectElement)
    }
    let itemCName = itemCNameElement.innerHTML
    itemCNameElement.innerHTML = ''
    const inspectElement0 = document.createElement('a')
    inspectElement0.role = 'button'
    inspectElement0.innerHTML = itemCName
    inspectElement0.style.textDecoration = 'none'
    inspectElement0.style.color = 'inherit'
    itemCNameElement.onmouseover = () => {
      inspectElement0.style.textDecoration = 'underline'
      inspectElement0.style.color = 'blue'
    }
    itemCNameElement.onmouseout = () => {
      inspectElement0.style.textDecoration = 'none'
      inspectElement0.style.color = 'inherit'
    }
    itemCNameElement.onclick = () => openWindow(globalItemNumberList1[i])
    itemCNameElement.style.cursor = 'pointer'
    itemCNameElement.appendChild(inspectElement0)
  }
}

function updateGlobalItemNumberList1(): string[] {
  const dataGridRow1 = document.querySelector("#datagrid-row-r1-1-0")
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

function observeItemNumberList1() {
  setInterval(async () => {
    updateGlobalItemNumberList1()
    insertInspectFormLink(globalItemNumberList1.length)
  }, 100)
}

async function listenFreshHotkeyEntrustList() {
  console.log('监听刷新快捷键')
  // 监听 Ctrl+D 键的弹起事件
  document.addEventListener('keydown', async function (event) {
    if (!event.ctrlKey) {
      return
    }
    if (event.key === 'd') {
      event.preventDefault() // 阻止默认的保存行为
      doFreshEntrustList()
    }
  })
}

function doFreshEntrustList() {
  const refreshButton = document.querySelector("body > div.panel.easyui-fluid > div.easyui-panel.panel-body.panel-noscroll > div > div > div.datagrid-pager.pagination > table > tbody > tr > td:nth-child(13) > a") as HTMLAnchorElement
  if (refreshButton) refreshButton.click()
}

function listenVisibilityChangeEntrustList(autoRefreshDuration: number) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时记录时间
      hiddenTimeEntrustList = Date.now();
    } else if (hiddenTimeEntrustList) {
      // 页面显示时，检查是否超过10秒
      const hiddenDuration = Date.now() - hiddenTimeEntrustList;
      if (hiddenDuration >= autoRefreshDuration) { // 10秒 = 10000毫秒
        doFreshEntrustList();
        console.log('离开页面10秒，刷新列表')
      }
      hiddenTimeEntrustList = null;
    }
  });
}
interface LinkParams {
  systemId: string
  projectId: string
  entrustId: string
  category: string
  from: 'query'
}
async function getCategory(projectNo: string): Promise<LinkParams | undefined> {
  if (!projectNo) return undefined
  try {
    const [startDate, endDate] = parseDateEntrust(projectNo)
    const response = await fetch(
      `https://${window.location.host}/rest/inspect/query?projectNo=${projectNo}&startDate=${startDate}&endDate=${endDate}&page=1&rows=10`,
      {
        method: 'GET',
        credentials: 'include' // 包含 cookies
      }
    )
    if (!response.ok) {
      console.log('请求失败1')
      return undefined
    }
    const { rows }: QueryResultData =
      await response.json()
    if (rows.length < 1) return undefined
    return {
      systemId: rows[0]['systemId'],
      projectId: rows[0]['projectId'],
      entrustId: rows[0]['entrustId'],
      category: rows[0]['category'],
      from: 'query'
    } as LinkParams
  } catch (error) {
    console.log('请求失败2')
    return undefined
  }
}


interface QueryResultData {
  rows: QueryResultDataRow[];
  total: number;
}

export interface QueryResultDataRow {
  according?: string;
  appraiseDate?: string;
  appraiser?: string;
  appraiserName?: string;
  attchmentFiles?: string[];
  category?: string;
  checkDate?: string;
  checked?: boolean;
  checker?: string;
  checkerName?: string;
  checkLocation?: string;
  checkLocationName?: string;
  classOrDiv?: string;
  component?: null;
  conclusions?: number;
  createdBy?: string;
  createdByName?: string;
  createdDate?: string;
  editStatus?: number;
  entrustId?: string;
  id?: string;
  itemCName?: string;
  itemEName?: string;
  market?: string;
  modifiedBy?: string;
  modifiedByName?: string;
  modifiedDate?: string;
  pg?: string;
  principalName?: string;
  projectId?: string;
  projectNo?: string;
  psn?: string;
  repeat?: boolean;
  systemId?: string;
  unno?: string;
}

async function openWindow(projectNo: string) {
  const linkParams = await getCategory(projectNo)
  if (!linkParams) return
  const params = new URLSearchParams({
    projectId: linkParams.projectId,
    entrustId: linkParams.entrustId,
    category: linkParams.category,
    from: linkParams.from
  })
  let link = `/${linkParams.systemId}/inspect?${params.toString()}`
  console.log(link)
  window.open(link, '_blank')
}

function parseDateEntrust(dateText: string) {
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