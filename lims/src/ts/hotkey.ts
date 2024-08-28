import { setProjectNoToClipText, sleep } from './utils'

console.log('快捷键脚本运行中...')

let changed = false
let originalTitle: string

  // auto open document
;(async function () {
  await sleep(200)
  // 将项目编号设置为标题
  document.title = document.getElementById('projectNo').innerHTML
  originalTitle = document.title
  // 复制报告编号
  document
    .getElementById('projectNo')
    .parentElement.addEventListener('click', setProjectNoToClipText)
  // 复制项目名称
  document
    .getElementById('itemCName')
    .parentElement.addEventListener('click', copyProjectName)
  // 监听改动
  watchInput()
  // 保存时重置改动状态
  watchSaveBtn()
  // 阻止关闭
  preventClose()
  // // 搜索模式不打开资料
  // if (window.location.href.includes('from=query')) {
  //     return
  // }
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

let ctrlPressCount = 0
let lastCtrlPressTime = 0

let cPressCount = 0
let lastCPressTime = 0

// 监听 Ctrl 键的弹起事件
document.addEventListener('keyup', function (event) {
  if (event.key === 'Control') {
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
  if (event.key === 'c') {
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

function myCustomSaveFunction() {
  const button = document.getElementById('saveBtn0')
  // Fork From https://github.com/snwjas/Message.js
  if (button) {
    button.click()
    // @ts-expect-error: use Qmsg from assets
    Qmsg['success']('保存成功')
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
  Qmsg['success']('已复制项目名称')
}

function watchInput() {
  const table = document.getElementById('batteryInspectForm').children[3]
  table.addEventListener('change', function (event: Event) {
    const target = event.target as HTMLElement
    if (target) console.log('Changed tag name:', target.tagName)
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    )
      console.log('Changed value:', target.value)
    changed = true
    document.title = `* ${originalTitle}`
  })
}

function watchSaveBtn() {
  document.getElementById('saveBtn0').addEventListener('click', function () {
    changed = false
    document.title = originalTitle
  })
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
