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

let globalAssignUser = ''
chrome.storage.sync.get(['assignUser', 'nextYearColor', 'nextYearBgColor', 'onekeyAssign'], async function (data) {
  const assignUser = data.assignUser as string
  globalAssignUser = assignUser
  console.log('一键分配脚本运行中...', data)
  if (!(data.onekeyAssign === false)) await insertElement(assignUser)
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

async function checkAssignUID(uid: string) {
  if (!uid) return false
  const users = await getUsers()
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
  document.location.reload()
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
  if (await checkAssignUID(uid)) select.value = uid
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