import {
  checkProjectNo,
  getClipboardText,
  getMonthsAgoProjectNo,
  sleep
} from './utils'

console.log('导入模板脚本运行中...')
;(async function () {
  await sleep(200)
  const qProjectNo = document.getElementById('qProjectNo') as HTMLInputElement
  document
    .getElementById('importBtn0')
    .addEventListener('click', handleImportBtnClick)
  qProjectNo.value = getMonthsAgoProjectNo()
  qProjectNo.addEventListener('input', function () {
    // 项目编号
    const input = qProjectNo.value.replace(/[^0-9A-Z]/g, '')
    qProjectNo.value = input
  })
})()

async function handleImportBtnClick() {
  const importBtn = document.getElementById('importBtn0')
  const projectNo = await getClipboardText()
  if (!checkProjectNo(projectNo)) {
    importBtn.removeEventListener('click', handleImportBtnClick)
    return
  }
  ;(document.getElementById('qProjectNo') as HTMLInputElement).value = projectNo
  importBtn.removeEventListener('click', handleImportBtnClick)
}
