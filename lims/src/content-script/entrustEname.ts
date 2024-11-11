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

let searchText = ''

async function getEntrustEName(entrustName: string): Promise<Customer[]> {
  try {
    const url = new URL(`https://${window.location.host}/rest/customer/customers`);
    url.searchParams.set('name', entrustName);
    url.searchParams.set('page', '1');
    url.searchParams.set('rows', '100');

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CustomerResponse = await response.json();
    return data.rows;
  } catch (error) {
    console.error('获取委托方英文名称失败:', error);
    return [];
  }
}

async function insertEntrustEname(customerList: Customer[]) {
  if (!customerList.length) return;

  const customerMap = new Map(
    customerList.map(customer => [customer.cname, customer.ename])
  );

  const getRowElement = (index: number, column: number): HTMLElement | null =>
    document.querySelector(`#datagrid-row-r1-2-${index} > td:nth-child(${column}) > div`);

  for (let i = 0; i < 10; i++) {
    const cnameElement = getRowElement(i, 1);
    const enameElement = getRowElement(i, 2);

    if (!cnameElement || !enameElement) continue;

    const matchingEname = customerMap.get(cnameElement.innerHTML);
    if (matchingEname !== undefined) {
      enameElement.innerHTML = matchingEname || '/';
    }
  }
}

function expandTable(width: number, height: number) {
  const selectors = {
    width: [
      "body > div:nth-child(10)",
      "body > div:nth-child(10) > div",
      "body > div:nth-child(10) > div > div",
      "body > div:nth-child(10) > div > div > div",
      "body > div:nth-child(10) > div > div > div > div.datagrid-view",
      "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2",
      "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body",
      "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body > table",
      "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body > table > tbody",
    ],
    height: {
      "body > div:nth-child(10) > div": 470,
      "body > div:nth-child(10) > div > div > div": 450,
      "body > div:nth-child(10) > div > div > div > div.datagrid-view": 420,
      "body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-body": 390
    }
  };

  // 设置高度
  Object.entries(selectors.height).forEach(([selector, height]) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      Object.assign(element.style, {
        height: `${height}px`,
        maxHeight: 'none'
      });
    }
  });

  // 设置宽度
  selectors.width.forEach(selector => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      Object.assign(element.style, {
        width: `${width}px`,
        maxWidth: 'none'
      });
    }
  });

  // 设置名称列宽度
  for (let i = 0; i < 10; i++) {
    const nameElement = document.querySelector(`#datagrid-row-r1-2-${i} > td:nth-child(2) > div`) as HTMLElement;
    if (nameElement) {
      nameElement.style.width = '400px'
    }
  }
}

function debounceInput(delay: number = 500) {
  const input = document.querySelector<HTMLInputElement>("#entrustEditForm > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(4) > span > input.textbox-text.validatebox-text");
  if (!input) {
    console.warn('未找到输入元素');
    return;
  }

  let timer: NodeJS.Timeout;

  const handleInput = async (value: string) => {
    try {
      expandTable(700, 400);
      searchText = value;
      const customers = await getEntrustEName(searchText);
      await insertEntrustEname(customers);
      expandTable(700, 400);
    } catch (error) {
      console.error('处理输入时发生错误:', error);
    }
  };

  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      handleInput((e.target as HTMLInputElement).value);
    }, delay);
  });
}

function setPage() {
  let nextPage = document.querySelector("body > div:nth-child(10) > div > div > div > div.datagrid-pager.pagination > table > tbody > tr > td:nth-child(10) > a") as HTMLAnchorElement
  if (nextPage) {
    nextPage.addEventListener('click', async () => {
      expandTable(700, 400);
      let name: Customer[] = await getEntrustEName(searchText)
      insertEntrustEname(name)
      expandTable(700, 400)
    })
  }
}

async function sleepEntrustEname(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function replaceTableHeaderName() {
  let header = document.querySelector("body > div:nth-child(10) > div > div > div > div.datagrid-view > div.datagrid-view2 > div.datagrid-header > div > table > tbody > tr > td:nth-child(2) > div > span:nth-child(1)")
  if (header) {
    header.innerHTML = '客户英文名称'
  }
}

// IIFE 优化
(async () => {
  chrome.storage.sync.get('enableReplaceEntrustEName', async (data) => {
    if (data.enableReplaceEntrustEName === false) return
    console.log("启用替换委托方英文名称")
    try {
      await sleepEntrustEname(500);
      replaceTableHeaderName();
      debounceInput();
      setPage();
    } catch (error) {
      console.error('初始化失败:', error);
    }
  })
})();