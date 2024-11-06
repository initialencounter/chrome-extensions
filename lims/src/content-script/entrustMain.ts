; (async () => {
  await sleep(500)
  if (localConfig.enableSetEntrust === false) {
    console.log('未启用设置委托单，退出脚本')
    return
  }
  console.log('委托单脚本运行中...')
  setMoonPay()
  setCategory()
  setAmountListener()
})()

function setAmountListener() {
  setAmount()
  const paymentCompanyText = document.getElementById(
    'txt_paymentCompanyContact'
  )
  if (paymentCompanyText) {
    const config = { attributes: true, childList: true, subtree: true }
    const callback = function (mutationsList: MutationRecord[]) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          console.log('A child node has been added or removed.')
          setAmount()
          setTagNextYear()
          setMoonPay()
        }
      }
    }
    const observer = new MutationObserver(callback)
    observer.observe(paymentCompanyText, config)
  }
  const pekSystemButton = document.getElementById('_easyui_combobox_i1_0')
  if (pekSystemButton)
    pekSystemButton.addEventListener('click', () => {
      setAmount()
    })
  const sekSystemButton = document.getElementById('_easyui_combobox_i1_1')
  if (sekSystemButton)
    sekSystemButton.addEventListener('click', () => {
      setAmount()
    })
}

function setCategory() {
  const target = document.getElementById(
    `_easyui_combobox_i5_${localConfig.category}`
  ) as HTMLDivElement
  if (target) {
    target.click()
  }
}

async function setAmount() {
  let money = localConfig.amount
  await sleep(200)
  const target = document.querySelectorAll(
    'input[type="hidden"][class="textbox-value"][value="480.00"][name="amount"]'
  )[0] as HTMLInputElement
  if (target) {
    target.value = money
  }
  const targetShows = document.querySelectorAll(
    'input[type="text"][class="textbox-text validatebox-text"][autocomplete="off"]'
  )
  const targetShow = targetShows[targetShows.length - 1] as HTMLInputElement
  if (targetShow) {
    targetShow.value = '￥' + money
  }
}

function setMoonPay() {
  if (localConfig.moonPay === false) return
  const target = document.getElementById('monthPay') as HTMLInputElement
  if (target) {
    target.click()
  }
}

function setTagNextYear() {
  if (localConfig.tagNextYear === false) return
  const nextYear = document.getElementById("nextYear") as HTMLInputElement
  if (nextYear) nextYear.click()
}