;(async () => {
  chrome.storage.sync.get(['onekeyRollback'], async function (result) {
    if (result.onekeyRollback === false) {
      return
    }
    await sleepRollBack(500)
    getTbodyChild()
  })
})()
async function rollback(taskId: string): Promise<boolean> {
  const body = {
    taskId: taskId,
    reason: ''
  }
  const response = await fetch(
    `https://${window.location.host}/rest/flow/task/rollback`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 包含 cookies
      body: JSON.stringify(body)
    }
  )
  if (!response.ok) return false
  const data = await response.json()
  if (data.result === 'success') {
    return true
  } else {
    return false
  }
}

async function rollbackOneKey(taskId: string) {
  if (!taskId) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['error']('退回失败1', { timeout: 500 })
    return
  }
  // inspect
  const projectId = await getProjectIdByTaskId(taskId)
  if (!(await rollback(taskId))) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['error']('退回失败1', { timeout: 500 })
    return
  }
  // assign
  const taskId2 = await getTaskIdByProjectId(projectId)
  if (taskId2 && !(await rollback(taskId2))) {
    // @ts-expect-error: use Qmsg from assets
    Qmsg['error']('退回失败2', { timeout: 500 })
    return
  }
  // @ts-expect-error: use Qmsg from assets
  Qmsg['success']('退回成功', { timeout: 1000 })
  document.location.reload()
}

// 检验页面
async function getProjectIdByTaskId(taskId: string) {
  if (!taskId) return ''
  const currentDate = new Date()
  const date = currentDate.toISOString().split('T')[0]
  currentDate.setMonth(currentDate.getMonth() - 1)
  const startDate = currentDate.toISOString().split('T')[0]
  const response = await fetch(
    `https://${window.location.host}/rest/flow/task/get/inspect?projectStartDate=${startDate}&projectEndDate=${date}&projectState=0&page=1&rows=10`,
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
  const projectIds = data['rows']
    .filter(function (row: Task) {
      if (row['id'] === taskId) return true
    })
    .map((item: Task) => item.projectId)
  return projectIds[0]
}
// 分配页面
async function getTaskIdByProjectId(projectId: string) {
  if (!projectId) return ''
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
      if (row['projectId'] === projectId) return true
    })
    .map((item: Task) => item.id)
  return taskIds[0]
}

function getTbodyChild() {
  console.log('一键退回脚本运行中...')
  // 删除无用表头
  // document.querySelectorAll('tr[class="datagrid-header-row"]')[1].children[1].remove()
  const targets = document.getElementById('datagrid-row-r1-2-0')?.parentElement
    ?.children
  if (!targets) return false
  for (let i = 0; i < targets.length; i++) {
    const len = targets[i].children.length
    const target = targets[i].children[len - 1]
    // 删除无用的列
    // targets[i].children[1].remove()
    const tmpInnerHTML = target.innerHTML
    const matches = tmpInnerHTML.match(/\('([a-z0-9]+)'\)/)
    if (!matches) continue
    if (matches.length < 2) continue
    const taskId = matches[1]
    target.innerHTML = tmpInnerHTML
      .replace('rollback', 'void')
      .replace('>回退', '>退退退')
    target.children[0].children[0].addEventListener('click', function () {
      rollbackOneKey(taskId)
    })
  }
}

async function sleepRollBack(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
