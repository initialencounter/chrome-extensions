interface Customer {
  createdBy: string
  createdDate: string
  modifiedBy: string
  modifiedDate: string
  id: string
  code: string
  cname: string
  ename: string
  type: number
  bankAccount: string | null
  status: number
  companyId: string
  owner: string
  certified: boolean
  companyName: string
  createdByName: string
  modifiedByName: string
  ownerName: string
}

interface CustomerResponse {
  total: number
  rows: Customer[]
}


let entrustList = ['', '', '', '', '', '', '', '', '', '', '', '', '']

function getTableData(i: number) {
  setInterval(() => {
    let tableRow = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(1) > div`)
    if (!tableRow) return
    const entrustName = tableRow.innerHTML
    if (entrustList[i] === entrustName) return
    entrustList[i] = entrustName
    getEntrustEName(entrustName).then((entrustEName) => {
      insertEntrustEname(i, entrustEName)
    })
    expandTableWidth(700, 470)
  }, 100)
}

async function getEntrustEName(entrustName: string) {
  const response = await fetch(
    `https://${window.location.host}/rest/customer/customers?name=${entrustName}&page=1&rows=10`,
    {
      method: 'GET',
      credentials: 'include' // 包含 cookies
    }
  )
  if (!response.ok) {
    console.error('get entrust ename failed')
    return '获取英文名失败'
  }
  const data: CustomerResponse = await response.json()
  for (let i = 0; i < data.rows.length; i++) {
    if (data.rows[i].cname === entrustName) {
      if (!data.rows[i].ename) {
        return '/'
      }
      return data.rows[i].ename
    }
  }
  return '获取英文名失败'
}

async function insertEntrustEname(i: number, entrustEName: string) {
  let name = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(2) > div`) as HTMLElement
  if (!name) return
  if (entrustEName === '获取英文名失败') {
    name.style.color = 'red'
  }
  name.innerHTML = entrustEName
}

function expandTableWidth(width: number, height: number) {
  const elements = [
    "body > div:nth-child(10)",
    "body > div:nth-child(10) > div",
    "body > div:nth-child(10) > div > div",
    "body > div:nth-child(10) > div > div > div",
    "body > div:nth-child(10) > div > div > div > div.datagrid-view",
    "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2",
    "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body",
    "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body > table",
    "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body > table > tbody",
  ];

  const heightElement = [
    "body > div:nth-child(10) > div", // 470
    "body > div:nth-child(10) > div > div > div",  // 450
    "body > div:nth-child(10) > div > div > div > div.datagrid-view", // 420
    "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body" // 390
  ]
  const heightList = [470, 450, 420, 390]
  heightElement.forEach((selector, index) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.style.height = `${heightList[index]}px`
      element.style.maxHeight = 'none'
    }
  })
  elements.forEach(selector => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.style.width = `${width}px`
      element.style.maxWidth = 'none'
    }
  })
  for (let i = 0; i < 10; i++) {
    const name = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(2) > div`) as HTMLElement
    if (name) {
      name.style.width = `${width * 0.6}px`
      name.style.maxWidth = 'none'
    }
  }
}

(async () => {
  await sleepEntrustEname(500)
  replaceTableHeaderName()
  for (let i = 0; i < 10; i++) {
    getTableData(i)
  }
})()

async function sleepEntrustEname(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function replaceTableHeaderName(){
  let header = document.querySelector("body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-header > div > table > tbody > tr > td:nth-child(2) > div > span:nth-child(1)")
  if (header) {
    header.innerHTML = '客户英文名称'
  }
}
