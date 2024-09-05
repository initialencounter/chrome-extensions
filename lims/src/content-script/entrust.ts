chrome.storage.sync.get('assignUID', async function (data) {
  const uid = data.assignUID as string
  if (!(await checkAssignUID(uid))) return
  console.log('一键分配脚本运行中...')
  chrome.runtime.onMessage.addListener(async function (message) {
    if (message !== 'lims_onekey_assign') return
    await assignSelectId(uid)
  })
  // 监听 V 键的弹起事件
  let lastVPressTime = 0
  let vPressCount = 0
  document.addEventListener('keyup', async function (event) {
    if (event.key === 'v' && event.ctrlKey) {
      const currentTime = new Date().getTime()
      if (currentTime - lastVPressTime < 500) {
        vPressCount++
      } else {
        vPressCount = 1
      }
      lastVPressTime = currentTime
      if (vPressCount === 2 && event.ctrlKey) {
        await assignSelectId(uid)
        vPressCount = 0
      }
    }
  })
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

async function checkAssignUID(uid: string): Promise<boolean> {
  if (!uid) return false
  return true
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
}

async function entrustSleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ReceiveSubmit(
  ids: string[],
  task: 'receive' | 'submit'
): Promise<string[]> {
  if (!ids.length) return []
  await entrustSleep(100)
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
  await entrustSleep(100)
  const date = /* @__PURE__ */ new Date().toISOString().split('T')[0]
  const response = await fetch(
    `https://${window.location.host}/rest/flow/task/get/assignInspect?projectStartDate=${date}&projectEndDate=${date}&projectState=0&page=1&rows=10`,
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
    .filter(function (row) {
      for (let i = 0; i < ids.length; i++) {
        if (row['entrustId'] === ids[i]) return true
      }
    })
    .map((item) => item.id)
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
  if (result['result'] === 'success') console.log('assign task success')
  else console.error('assign task failed2')
}
