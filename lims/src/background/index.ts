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

const IFRAME_RECT_MAP: Record<number, DOMRect> = {}

// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick)

// A generic onclick callback function.
function genericOnClick(info: chrome.contextMenus.OnClickData) {
  switch (info.menuItemId) {
    case 'lims_onekey_assign':
      sendMessageToActiveTab('lims_onekey_assign')
      break
    default:
      console.log('Standard context menu item clicked.')
  }
}

chrome.runtime.onInstalled.addListener(async function () {
  let version = chrome.runtime.getManifest().version
  await backgroundSleep(500)
  const menus: ExtendedCreateProperties = {
    title: '当前插件版本：' + version,
    id: 'lims',
    child: [
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

async function getAttachmentInfo(aircraftServer: string, projectNo: string, label: string, is_965: boolean) {
  const response = await fetch(
    `${aircraftServer}/get-attachment-info/${projectNo}?label=${label}&is_965=${is_965 ? 1 : 0}`,
    {
      method: 'GET',
      mode: 'cors',
    }
  )
  if (!response.ok) {
    return null
  }
  return await response.json()
}

interface FileData {
  name: string,
  type: string,
  data: number[],
}

async function uploadLLMFiles(aircraftServer: string, files: FileData[]) {
  const formData = new FormData();
  for (let file of files) {
    let uint8Array = new Uint8Array(file.data)
    formData.append("file", new Blob([uint8Array], { type: file.type }), file.name);
  }
  const response = await fetch(`${aircraftServer}/upload-llm-files`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    console.error(`上传失败！${await response.text()}`);
    throw new Error(`上传失败！${await response.text()}`);
  }
  const result = await response.text();
  return result
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAttachmentInfo') {
    getAttachmentInfo(request.aircraftServer, request.projectNo, request.label, request.is_965)
      .then(result => sendResponse(result))
      .catch(error => sendResponse(null));
    return true; // 保持消息通道开放，等待异步响应
  }

  if (request.action === 'uploadLLMFiles') {
    uploadLLMFiles(request.aircraftServer, request.files)
      .then(result => sendResponse(result))
      .catch(error => sendResponse(error));
    return true; // 保持消息通道开放，等待异步响应
  }

  // 截图
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(
      { format: 'png', quality: 100 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error('chrome.runtime.lastError', chrome.runtime.lastError.message);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          console.log('dataUrl:', dataUrl);
          sendResponse(dataUrl);
        }
      }
    );
    return true; // 保持异步响应
  }

  // 同步 iframe 的 rect
  if (request.action === 'syncIframeRect') {
    IFRAME_RECT_MAP[sender.tab!.id!] = request.rect;
    sendResponse('ok');
    return true; // 保持消息通道开放，等待异步响应
  }

  if (request.action === 'getIframeRect') {
    sendResponse(IFRAME_RECT_MAP[sender.tab!.id!] || DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 }));
    return true; // 保持消息通道开放，等待异步响应
  }
});
