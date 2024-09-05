;(async () => {
  await sleep(500)
  if (!localConfig.enableSetEntrust) return
  console.log('委托单脚本运行中...')
  setMoonPay()
  setCategory()
  await sleep(300)
  setAmount('500.00')
})()

function setCategory() {
  const target = document.getElementById(
    '_easyui_combobox_i5_1'
  ) as HTMLDivElement
  if (target) {
    target.click()
  }
}

function setAmount(money: string) {
  const target = document.querySelectorAll(
    'input[type="hidden"][class="textbox-value"][value="480.00"][name="amount"]'
  )[0] as HTMLInputElement
  if (target) {
    target.value = money
  }
  const targetShow = document.querySelectorAll(
    'input[type="text"][class="textbox-text validatebox-text"][autocomplete="off"][style="margin-left: 0px; margin-right: 0px; padding-top: 3px; padding-bottom: 3px; width: 140.4px;"]'
  )[0] as HTMLInputElement
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
