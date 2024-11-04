console.log('快捷键脚本运行中...')

let changed = false
let originalTitle: string

let ctrlPressCount = 0
let lastCtrlPressTime = 0
let cPressCount = 0
let lastCPressTime = 0

// auto open document
;(async function () {
  await sleep(500)
  // 将项目编号设置为标题
  if (localConfig.enableCopyProjectNo) {
    const projectNoElement = document.getElementById('projectNo')
    if (projectNoElement) {
      document.title = projectNoElement.innerHTML
      originalTitle = document.title
      // 复制报告编号
      if (projectNoElement.parentElement) {
        projectNoElement.parentElement.addEventListener(
          'click',
          setProjectNoToClipText
        )
      }
    }
  }

  const btySizeSek = document.getElementById(
    systemId === 'SEKGZ' ? 'btySize' : 'size'
  ) as HTMLInputElement
  if (btySizeSek) {
    btySizeSek.style.setProperty('width', '428px')
    btySizeSek.parentElement?.style.setProperty('width', '428px')
  }

  const otherDescribeCAddition = document.getElementById("otherDescribeCAddition") as HTMLInputElement
  if (otherDescribeCAddition && systemId === 'SEKGZ') {
    otherDescribeCAddition.style.setProperty('width', '758px')
    otherDescribeCAddition.parentElement?.style.setProperty('width', '750px')
  }

  // 缩小没用的输入框
  // const otherDescribeEAddition = document.getElementById("otherDescribeEAddition")
  // if (otherDescribeEAddition) {
  //   otherDescribeEAddition.style.setProperty('height', '30px')
  //   otherDescribeEAddition.parentElement?.style.setProperty('height', '30px')

  // }
  
  // 自定义图标
  if (localConfig.customIcon) {
    if (systemId === 'PEKGZ') {
      changeFavicon(
        'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiINCiAgICBzdHlsZT0id2lkdGg6IDFlbTtoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyINCiAgICB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcC1pZD0iMzY0NiI+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTUxMiA2MDguMzA3OTQzNkw4MDEuMDY1MjUyMTUgMzE5LjI0MjY5MTQ1czQ4LjE1Mzk3MTgtNDguMTUzOTcxOCAwLTk2LjMwNzk0MzYtOTYuMzA3OTQzNiAwLTk2LjMwNzk0MzYgMGwtMTY4LjY0NDk2NzMxIDE2OC42NDQ5NjczMUwxNzQuNzEwMDY1MzcgMzE5LjI0MjY5MTQ1bC00OC4xNTM5NzE3OSA0OC4xNTM5NzE4IDI4OS4wNjUyNTIxNCAxNDQuNTMyNjI2MDctMTM0LjkxNTk3Mzg1IDEzNC45MTU5NzM4NS0xMzAuMTA3NjQ3NzMtMTQuNDI0OTc4MzMtNDguMTUzOTcxOCA0OC4xNTM5NzE3OUwyNzEuMDg4NzE5NjUgNzUyLjkxMTI4MDM1bDcyLjI2NjMxMzA0IDE2OC41NzQyNTY2NCA0OC4xNTM5NzE4LTQ4LjE1Mzk3MTgtMTQuNDI0OTc4MzQtMTMwLjEwNzY0Nzc0TDUxMiA2MDguMzA3OTQzNnpNNzA0Ljc1NzMwODU1IDg0OS4yODk5MzQ2M0w2MzkuMzQ5OTMxMjkgNTIyLjUzNTg5MTA0bC0xMTMuNDkwNjM4MzggMTEzLjQ5MDYzODM4IDEzMC43NDQwNDM4NCAyNjEuNDE3Mzc3eiINCiAgICAgICAgcC1pZD0iMzY0NyIgZmlsbD0iIzUxYTAyMCI+PC9wYXRoPg0KPC9zdmc+'
      )
    } else {
      changeFavicon(
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJpY29uIiBzdHlsZT0id2lkdGg6IDFlbTtoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiBwLWlkPSIxMDAyIj48cGF0aCBkPSJNNTE1LjU4NCAxMDIuNGExMzcuMjE2IDEzNy4yMTYgMCAwIDEgMTM5LjY3NCAxMzUuMTY4IDEzNy40NzIgMTM3LjQ3MiAwIDAgMS00Mi4zOTQgMTAxLjgzNyAxNzguMDIyIDE3OC4wMjIgMCAwIDAtNTQuNDc3IDEyOC42NjV2MS40MzRoMTY5LjgzYzMuNzM4IDAgNi44MSAzLjA3MiA2LjgxIDYuODF2NjcuOTQyYzAgMy43MzgtMy4wNzIgNi44MS02LjgxIDYuODFINTU4LjI4NnYzMzguMjI3YzcyLjM5Ny03LjQ3NSAxMzkuNTItMzQuODE2IDE4OS44NS03Ni44YTEzLjY3IDEzLjY3IDAgMCAwLTIuNDU4LTIyLjYzbC02Ny40My0zNC42MTJhMy40MyAzLjQzIDAgMCAxIDAuNTExLTYuMjk3bDE4NS44NTYtNTkuODAyYTYuNjU2IDYuNjU2IDAgMCAxIDguNSA0LjI1bDU5LjgwMSAxODUuODU2YTMuMzggMy4zOCAwIDAgMS00Ljc2MSA0LjA5Nkw4NDguMjMgODQyLjI5YTEzLjQ2NiAxMy40NjYgMCAwIDAtMTYuMDc2IDIuNzE0Yy02Ni44NjggNzAuOTYzLTE2Ni40IDExNi43MzYtMjczLjc2NyAxMjUuOTUyYTU1NS45MzggNTU1LjkzOCAwIDAgMS0yNi4xNjMgMS41MzZoLTI3Ljk1NWE0NjAuMjg4IDQ2MC4yODggMCAwIDEtMTY2LjI5OC0zNS42ODcgMzk4LjI4NSAzOTguMjg1IDAgMCAxLTEzNC43MDctOTEuODAxIDEzLjQ2NiAxMy40NjYgMCAwIDAtMTYuMDc3LTIuNzE0bC03OS44NzIgNDEuMjE2YTMuMzggMy4zOCAwIDAgMS00Ljc2MS00LjA5Nmw1OS40OTQtMTg2LjAxYTYuOTEyIDYuOTEyIDAgMCAxIDguNjAyLTQuNDAzbDE4NS45MDcgNTkuMzkyYzIuODY3IDAuOTIyIDMuMjI1IDQuOTE2IDAuNTEyIDYuMjk4bC02Ny4zOCAzNC43MTRhMTMuNjcgMTMuNjcgMCAwIDAtMi40NTcgMjIuNjNjNTAuNDgzIDQxLjg4MiAxMTcuNjU4IDY5LjI3NCAxODkuNTQyIDc2LjkwMlY1NTEuMDY2SDMwNi44NDJhNi44MSA2LjgxIDAgMCAxLTYuODEtNi44MXYtNjcuOTQyYzAtMy43MzggMy4wNzItNi44MSA2LjgxLTYuODFoMTY5Ljk4NHYtMS40MzRjMC00OC44OTYtMjAuMzI3LTk1LjIzMi01NS4zNDgtMTI5LjQzM0ExMzcuNjc3IDEzNy42NzcgMCAwIDEgNTE1LjYzNSAxMDIuNHogbTIuMDQ4IDgxLjYxM2E1Ni4xMTUgNTYuMTE1IDAgMCAwIDAgMTEyLjEyOCA1Ni4xMTUgNTYuMTE1IDAgMCAwIDAtMTEyLjEyOHoiIHAtaWQ9IjEwMDMiIGZpbGw9IiMzZThlZDAiLz48L3N2Zz4='
      )
    }
  }

  // 复制项目名称
  if (localConfig.enableCopyProjectName) {
    const itemCNameElement = document.getElementById('itemCName')
    if (itemCNameElement && itemCNameElement.parentElement) {
      itemCNameElement.parentElement.addEventListener(
        'dblclick',
        copyProjectName
      )
    }
  }
  // 监听改动
  if (localConfig.enablePreventCloseBeforeSave) {
    watchInput()
    // 保存时重置改动状态
    watchSaveBtn()
    // 阻止关闭
    preventClose()
  }

  // 导入检验单
  if (localConfig.enableImportHotKey) {
    if (!window.location.href.includes('from=query')) {
      importTemplate()
    }
  }
  // 导入检验单时设置分类
  if (localConfig.enableSetImportClassification) {
    if (!window.location.href.includes('from=query')) {
      importClassification()
    }
  }

  // 监听 Ctrl 键的弹起事件
  document.addEventListener('keyup', function (event) {
    if (event.key === 'Control' && localConfig.enableCopyProjectNo) {
      // 双击 Ctrl 键的检测
      const currentTime = new Date().getTime()
      // 检查两次 Ctrl 按键的时间间隔
      if (currentTime - lastCtrlPressTime < 500) {
        // 500毫秒内双击认为是双击
        ctrlPressCount++
      } else {
        ctrlPressCount = 1 // 超过时间间隔，重置计数
      }
      lastCtrlPressTime = currentTime
      // 当双击 Ctrl 键时触发的事件
      if (ctrlPressCount === 2) {
        setProjectNoToClipText()
        // 触发一次双击事件后重置计数
        ctrlPressCount = 0
      }
    }
    if (event.key === 'c' && localConfig.enableCopyProjectName) {
      const currentTime = new Date().getTime()
      if (currentTime - lastCPressTime < 500) {
        cPressCount++
      } else {
        cPressCount = 1
      }
      lastCPressTime = currentTime
      if (cPressCount === 2 && event.ctrlKey) {
        copyProjectName()
        cPressCount = 0
      }
    }
  })
  if (localConfig.enableSaveHotKey) {
    // 监听 Ctrl + S 的按下事件
    document.addEventListener('keydown', function (event) {
      if (!event.ctrlKey) {
        return
      }
      // 检查是否按下了Ctrl+S
      if (event.key === 's') {
        event.preventDefault() // 阻止默认的保存行为
        myCustomSaveFunction()
      }
      if (event.key === 'd') {
        event.preventDefault() // 阻止默认的保存行为
        importDocument()
      }
    })
  }

  // const queryString = window.location.search
  // const urlParams = new URLSearchParams(queryString)
  // const pid = urlParams.get('projectId')
  // const host = window.location.host
  // const url = `https://${host}/document?pid=${pid}`
  // const link = document.createElement('a')
  // link.href = url

  // const event = new MouseEvent('click', {
  //     ctrlKey: true,
  //     bubbles: true,
  //     cancelable: true
  // })

  // // 将事件派发到 a 标签
  // link.dispatchEvent(event)
})()

function myCustomSaveFunction() {
  const button = document.getElementById('saveBtn0')
  // Fork From https://github.com/snwjas/Message.js
  if (button) {
    button.click()
    // @ts-expect-error: use Qmsg from assets
    Qmsg['success']('保存成功', { timeout: 500 })
  } else {
    console.log('Button not found')
    // @ts-expect-error: use Qmsg from assets
    Qmsg['error']('保存失败')
  }
}

function importDocument() {
  const button = document.getElementById('importBtn0')
  if (button) {
    button.click()
  } else {
    console.log('Button not found')
  }
}

function copyProjectName() {
  const projectNameSpan = document.getElementById(
    'itemCName'
  ) as HTMLInputElement
  const projectName = projectNameSpan.value
  console.log(projectName)
  navigator.clipboard.writeText(projectName)
  // @ts-expect-error: use Qmsg from assets
  Qmsg['success']('已复制项目名称', { timeout: 500 })
}

function watchInput() {
  const table = document.getElementById('batteryInspectForm')?.children[3]
  table?.addEventListener('change', function (event: Event) {
    const target = event.target as HTMLElement
    if (target) console.log('Changed tag name:', target.tagName)
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement
    ) {
      console.log('Changed value:', target.value)
      changed = true
      document.title = `* ${originalTitle}`
    }
  })
}

function watchSaveBtn() {
  const saveBtn = document.getElementById('saveBtn0')
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      changed = false
      document.title = originalTitle
    })
  }
}

function preventClose() {
  window.addEventListener('beforeunload', function (event) {
    if (!changed) {
      return
    }
    const message =
      '您确定要离开此页面吗？未保存的更改可能会丢失。（ctrl+s 即可保存）'
    event.preventDefault() // 一些浏览器可能需要这一行
    event.returnValue = message // 标准的浏览器要求设置这个属性
    return message // 对于一些旧版浏览器
  })
}

async function importTemplate() {
  console.log('导入模板脚本运行中...')
  await sleep(200)
  const qProjectNo = document.getElementById('qProjectNo') as HTMLInputElement
  const importBtn = document.getElementById('importBtn0')
  if (importBtn) {
    importBtn.addEventListener('click', handleImportBtnClick)
  }
  // qProjectNo.value = systemId
  qProjectNo.value = getMonthsAgoProjectNo()
  qProjectNo.addEventListener('input', function () {
    // 项目编号
    const input = qProjectNo.value.replace(/[^0-9A-Z]/g, '')
    qProjectNo.value = input
  })
}

async function handleImportBtnClick() {
  const importBtn = document.getElementById('importBtn0')
  const projectNo = await getClipboardText()
  if (!checkProjectNo(projectNo)) {
    if (importBtn) {
      importBtn.removeEventListener('click', handleImportBtnClick)
    }
    return
  }
  ;(document.getElementById('qProjectNo') as HTMLInputElement).value = projectNo
  ;(document.getElementById('qItemCName1') as HTMLInputElement).value = ''
  ;(document.getElementById('qUnNo') as HTMLInputElement).value = ''
  if (importBtn) {
    importBtn.removeEventListener('click', handleImportBtnClick)
  }
}

async function importClassification() {
  console.log('导入分类脚本运行中...')
  await sleep(200)
  const importBtn = document.getElementById('importBtn0')
  if (importBtn) {
    importBtn.addEventListener('click', classification)
  }
}

function classification() {
  const projectNameSpan = document.getElementById(
    'itemCName'
  ) as HTMLInputElement
  if (!projectNameSpan) {
    return
  }
  setQItemCName1Text(projectNameSpan.value)
  setUnNo(projectNameSpan.value)
  const importBtn = document.getElementById('importBtn0')
  if (importBtn) {
    importBtn.removeEventListener('click', classification)
  }
}
function setQItemCName1Text(projectName: string) {
  const searchInput = document.getElementById('qItemCName1') as HTMLInputElement
  if (!searchInput) {
    return
  }
  if (!projectName) {
    return
  }
  let text = ''
  if (projectName.includes('包装')) {
    text = '包装'
  }
  if (projectName.includes('内置')) {
    text = '内置'
  }
  if (projectName.includes('充电盒')) {
    text = '充电盒'
  }
  if (projectName.includes('充电仓')) {
    text = '充电仓'
  }
  searchInput.value = text
}

function setUnNo(projectName: string) {
  const UnNoInputItem = document.getElementById('qUnNo') as HTMLInputElement
  if (!UnNoInputItem) {
    return
  }
  if (!projectName) {
    return
  }
  if (projectName.includes('电子烟')) {
    return
  }
  if (projectName.includes('车')) {
    UnNoInputItem.value = '3171'
    return
  }
  const isDangerous = isDangerousGoods(projectName)
  if (!isDangerous) {
    return
  }
  let UnNo = ''
  const isLiIonBattery = isLiIon(projectName)
  console.log('isLiIonBattery:', isLiIonBattery)
  if (isLiIonBattery) {
    UnNo = '3481'
  }
  if (
    !projectName.includes('(') &&
    !projectName.includes('（') &&
    isLiIonBattery
  ) {
    UnNo = '3480'
  }
  UnNoInputItem.value = UnNo
}

function isDangerousGoods(projectName: string) {
  const matches = [...projectName.matchAll(/\s(\d+\.{0,1}\d+)[Ww]h/g)]
  const results = matches.map((match) => match[1]) // 只获取捕获组
  if (results.length) {
    const wattHour = Number(results[0])
    if (wattHour > 100) {
      return true
    }
    if (projectName.includes('芯') && wattHour > 20) {
      return true
    }
  }
  return false
}

function isLiIon(projectName: string) {
  const metalBattery = ['纽扣', '锂金属', 'CR2032', 'CR2025']
  if (metalBattery.some((item) => projectName.includes(item))) {
    return false
  }
  return true
}

function changeFavicon(iconURL: string) {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  link.href = iconURL
}
