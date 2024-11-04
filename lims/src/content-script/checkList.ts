console.log("检查清单脚本注入成功！", systemId);
let isListening = false
  ; (async function () {
    await sleep(400)
    if (!document.getElementById('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')) return
    const targetChild = document.getElementById('openDocumentsBtn0')
    if (!targetChild) return
    const targetParent = targetChild.parentElement
    if (!targetParent) return
    const checkListButton = document.createElement('a')
    checkListButton.href = 'javascript:void(0);'
    checkListButton.className = 'easyui-linkbutton l-btn l-btn-small'
    checkListButton.style.background = '#ffffff'
    // hover
    checkListButton.onmouseover = function () {
      checkListButton.style.background = '#54a124'
    }
    checkListButton.onmouseout = function () {
      checkListButton.style.background = '#ffffff'
    }
    checkListButton.innerHTML = `
    <span class="l-btn-left" style="margin-top: 0px;">
        <span class="l-btn-text">检查</span>
    </span>
    `
    checkListButton.onclick = makeCheckList
    targetParent.appendChild(checkListButton)
    console.log('检查按钮插入成功')
  })()


function makeCheckList() {
  const batteryInspectForm = document.getElementById('batteryInspectForm')
  console.log('batteryInspectForm', batteryInspectForm)
  if (!batteryInspectForm) return
  const itemCName = document.querySelector("#batteryInspectForm > div > div:nth-child(4) > table > tbody > tr:nth-child(1)")
  const itemEName = document.querySelector("#batteryInspectForm > div > div:nth-child(4) > table > tbody > tr:nth-child(2)")
  const reMark = document.querySelector("#batteryInspectForm > div > div:nth-child(5) > div > div:nth-child(3)")
  const market = systemId === "PEKGZ" ? document.querySelector("#batteryInspectForm > div > div:nth-child(5) > div > div:nth-child(5) > table > tbody > tr")
    : document.querySelector("#batteryInspectForm > div > div:nth-child(5) > div > div:nth-child(7) > table > tbody > tr")
  const checkList0 = [itemCName, itemEName, reMark, market]
  for (let i = 0; i < checkList0.length; i++) {
    function handleClick() {
      changeBackgroundColor(item, item.style.backgroundColor === 'rgb(187, 187, 187)' ? '' : '#bbbbbb');
    }
    let item = checkList0[i] as HTMLDivElement
    changeBackgroundColor(item, '#bbbbbb')
    if (!isListening)
      item.addEventListener('click', handleClick)
  }
  let checkList = [
    document.querySelector("#batteryInspectForm > div > div:nth-child(5) > table > tbody > tr > td:nth-child(2)"),
    document.querySelector("#batteryInspectForm > div > div:nth-child(5) > div > div:nth-child(1) > table > tbody > tr > td:nth-child(2)"),
    systemId === "PEKGZ" ? document.querySelector("#batteryInspectForm > div > div:nth-child(5) > div > div:nth-child(2) > table > tbody")
      : document.querySelector("#batteryInspectForm > div > div:nth-child(5) > div > div:nth-child(3) > table > tbody"),
    document.querySelector("#batteryInspectForm > div > div:nth-child(5) > div > div:nth-child(4) > table > tbody"),
  ] as HTMLDivElement[]

  for (let i = 0; i < checkList.length; i++) {
    // if (systemId === "SEKGZ" && i === 2) continue
    for (let j = 0; j < checkList[i].children.length; j++) {
      function handleClick() {
        changeBackgroundColor(item, item.style.backgroundColor === 'rgb(187, 187, 187)' ? '' : '#bbbbbb');
      }
      let item = checkList[i].children[j] as HTMLDivElement
      changeBackgroundColor(item, '#bbbbbb')
      if (!isListening)
        item.addEventListener('click', handleClick)

    }
  }
  isListening = true
}

function changeBackgroundColor(element: HTMLElement, color: string) {
  element.style.backgroundColor = color;
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;
    changeBackgroundColor(child, color);
  }
}