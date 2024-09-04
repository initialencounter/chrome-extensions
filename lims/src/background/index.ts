// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

type CreateProperties = chrome.contextMenus.CreateProperties
type ExtendedCreateProperties = CreateProperties & {
  child?: ExtendedCreateProperties[]
}
// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick)

// A generic onclick callback function.
function genericOnClick(info: chrome.contextMenus.OnClickData) {
  switch (info.menuItemId) {
    case 'lims_check_inspect':
      sendMessageToActiveTab('lims_check_inspect')
      break
    default:
      console.log('Standard context menu item clicked.')
  }
}

chrome.runtime.onInstalled.addListener(async function () {
  await backgroundSleep(500)
  const menus: ExtendedCreateProperties = {
    title: 'LIMS',
    id: 'lims',
    child: [
      {
        title: '检验单校对',
        id: 'lims_check_inspect'
      },
      {
        title: '其他',
        id: 'other_menu',
        child: [
          { title: 'pek1', id: 'pek1' },
          { title: 'pek2', id: 'pek2' },
          {
            title: 'pek3',
            id: 'pek3',
            child: [
              { title: 'pek31', id: 'pek31' },
              { title: 'pek32', id: 'pek32' },
              { title: 'pek33', id: 'pek33' }
            ]
          }
        ]
      }
    ]
  }
  createContextMenu(menus)
})

function createContextMenu(
  createProperties: ExtendedCreateProperties,
  id?: number | string
) {
  createProperties['parentId'] = id
  const { child, ...properties } = createProperties
  const parentId = chrome.contextMenus.create(properties)
  if (!createProperties.child) {
    return
  }
  for (let i = 0; i < createProperties.child.length; i++) {
    createContextMenu(createProperties.child[i], parentId)
  }
}

async function sendMessageToActiveTab(message: string) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  if (!tab.id) return
  await chrome.tabs.sendMessage(tab.id, message)
}

async function backgroundSleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
