console.log("customSaveFunction running");

// auto open document
(async function () {
    await sleep(200);
    // 复制报告编号
    let projectNoSpan = document.getElementById('projectNo').parentElement;
    projectNoSpan.addEventListener('click', function () {
        setProjectNoToClipText()
    });
    // // 搜索模式不打开资料
    // if (window.location.href.includes('from=query')) {
    //     return;
    // }
    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    // const pid = urlParams.get('projectId');
    // const host = window.location.host;
    // const url = `https://${host}/document?pid=${pid}`;
    // const link = document.createElement('a');
    // link.href = url;

    // const event = new MouseEvent('click', {
    //     ctrlKey: true,
    //     bubbles: true,
    //     cancelable: true
    // });

    // // 将事件派发到 a 标签
    // link.dispatchEvent(event);
})();

let ctrlPressCount = 0;
let lastCtrlPressTime = 0;

// 监听 Ctrl 键的弹起事件
document.addEventListener('keyup', function (event) {
    if (event.key !== 'Control') {
        return;
    }
    // 双击 Ctrl 键的检测
    const currentTime = new Date().getTime();
    // 检查两次 Ctrl 按键的时间间隔
    if (currentTime - lastCtrlPressTime < 500) { // 500毫秒内双击认为是双击
        ctrlPressCount++;
    } else {
        ctrlPressCount = 1; // 超过时间间隔，重置计数
    }
    lastCtrlPressTime = currentTime;
    // 当双击 Ctrl 键时触发的事件
    if (ctrlPressCount === 2) {
        setProjectNoToClipText();
        // 触发一次双击事件后重置计数
        ctrlPressCount = 0;
    }
});

// 监听 Ctrl + S 的按下事件
document.addEventListener('keydown', function (event) {
    if (!event.ctrlKey) {
        return;
    }
    // 检查是否按下了Ctrl+S
    if (event.key === 's') {
        event.preventDefault(); // 阻止默认的保存行为
        myCustomSaveFunction();
    }
    if (event.key === 'd') {
        event.preventDefault(); // 阻止默认的保存行为
        importDocument();
    }
});

function myCustomSaveFunction() {
    const button = document.getElementById('saveBtn0');
    // Fork From https://github.com/snwjas/Message.js
    if (button) {
        button.click();
        Qmsg['success']('保存成功');
    } else {
        console.log('Button not found');
        Qmsg['error']('保存失败');
    }
}

function importDocument() {
    const button = document.getElementById('importBtn0');
    if (button) {
        button.click();
    } else {
        console.log('Button not found');
    }
}
