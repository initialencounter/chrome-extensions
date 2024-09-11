;(async () => {
  await sleep(500)
  if (!localConfig.enableSetEntrust) return
  console.log('委托单脚本运行中...')
  setMoonPay()
  setCategory()
  setAmountListener()
})()

function setCategory() {
  const target = document.getElementById(
    '_easyui_combobox_i5_1'
  ) as HTMLDivElement
  if (target) {
    target.click()
  }
}

async function setAmount(money: string) {
  await sleep(500)
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
  const target = document.getElementById('monthPay') as HTMLInputElement
  if (target) {
    target.click()
  }
}

function setAmountListener() {
  setAmount('500.00')
  const paymentCompanyText = document.getElementById(
    'txt_paymentCompanyContact'
  )
  if (paymentCompanyText) {
    const config = { attributes: true, childList: true, subtree: true }
    const callback = function (
      mutationsList: MutationRecord[],
      observer: MutationObserver
    ) {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          console.log('A child node has been added or removed.')
          setAmount('500.00')
        }
      }
    }
    const observer = new MutationObserver(callback)
    observer.observe(paymentCompanyText, config)
  }
  document.getElementById('_easyui_combobox_i1_0').addEventListener('click', () => { setAmount('500.00') })
  document.getElementById('_easyui_combobox_i1_1').addEventListener('click', () => { setAmount('500.00') })
}
