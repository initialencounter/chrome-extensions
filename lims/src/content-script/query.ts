;(async function () {
  await sleep(500)
  if (!localConfig.enableSetQueryProjectNo) {
    console.log('未启用设置查询项目编号，退出脚本')
    return
  }
  console.log('检验单查询脚本运行中...')
  chrome.runtime.onMessage.addListener(async function (message) {
    if (message !== 'lims_check_inspect') return
    console.log('Message received from background script:', message)
    await checkInspect()
  })
  document.addEventListener('click', handleQueryBtnClick)
  // 物品种类
  ;(
    document.getElementsByClassName('textbox-value')[1] as HTMLInputElement
  ).value = 'battery'
  // 项目编号
  const projectNo_hide = document.getElementsByClassName(
    'textbox-value'
  )[2] as HTMLInputElement
  let lastInput = projectNo_hide.value
  while (projectNo_hide) {
    if (lastInput === projectNo_hide.value) {
      await sleep(50)
      continue
    }
    projectNo_hide.value = projectNo_hide.value.replace(/[^0-9A-Z]/g, '')
    lastInput = projectNo_hide.value
    const startDate = checkDate(parseDate(lastInput))
    // 检验日期
    if (!startDate) continue
    ;(
      document.getElementsByClassName('textbox-value')[14] as HTMLInputElement
    ).value = startDate[0]
    ;(
      document.getElementsByClassName('textbox-value')[15] as HTMLInputElement
    ).value = startDate[1]
  }
})()

async function handleQueryBtnClick() {
  const projectNo = await getClipboardText()
  let systemId = ''
  if (projectNo.indexOf('SEKGZ') !== -1) {
    systemId = 'sek'
  }
  if (projectNo.indexOf('PEKGZ') !== -1) {
    systemId = 'pek'
  }
  ;(
    document.getElementsByClassName('textbox-value')[0] as HTMLInputElement
  ).value = systemId
  ;(
    document.getElementsByClassName('textbox-value')[2] as HTMLInputElement
  ).value = projectNo
  document.removeEventListener('click', handleQueryBtnClick)
}

async function checkInspect() {
  const date = new Date().toISOString().split('T')[0]
  const responseSek = await fetch(
    `https://${window.location.host}/rest/inspect/query?projectNo=SEKGZ&category=battery&startDate=${date}&endDate=${date}&page=1&rows=100`
  )
  if (!responseSek.ok) {
    return
  }
  const dataSek = await responseSek.json()
  const responsePek = await fetch(
    `https://${window.location.host}/rest/inspect/query?projectNo=PEKGZ&category=battery&startDate=${date}&endDate=${date}&page=1&rows=100`
  )
  if (!responsePek.ok) {
    return
  }
  const dataPek = await responsePek.json()
  const data = [...dataPek['rows'], ...dataSek['rows']]
  console.log(data)
}