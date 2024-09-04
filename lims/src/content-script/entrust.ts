chrome.storage.sync.get('assignUID', async function (data) {
  const uid = data.assignUID
  if (!(await checkAssignUID(uid))) return
  console.log('一键分配脚本运行中...')
  chrome.runtime.onMessage.addListener(async function (message) {
    if (message !== 'lims_onekey_assign') return
    await assignSelectId()
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
        await assignSelectId()
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

async function assignSelectId() {
  const ids = getIds()
  if (!ids.length) return
  console.log('assignSelectId:', ids)
  for (let i = 0; i < ids.length; i++) {
    await assignById(ids[i])
  }
}

async function entrustSleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// TODO: 一键分配
async function assignById(id: string) {
  await entrustSleep(100)
  console.log('assigning...', id)
}