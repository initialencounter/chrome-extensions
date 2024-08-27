console.log("customSaveFunction running");

// auto open document
(async function () {
    // await sleep(1000);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const pid = urlParams.get('projectId');
    const host = window.location.host;
    const url = `https://${host}/document?pid=${pid}`;
    const link = document.createElement('a');
    link.href = url;

    const event = new MouseEvent('click', {
        ctrlKey: true,
        bubbles: true,
        cancelable: true
    });

    // 将事件派发到 a 标签
    link.dispatchEvent(event);
})();


document.addEventListener('keydown', function (event) {
    // 检查是否按下了Ctrl+S
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // 阻止默认的保存行为
        myCustomSaveFunction();
    }
    if (event.ctrlKey && event.key === 'd') {
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
    // Fork From https://github.com/snwjas/Message.js
    if (button) {
        button.click();
    } else {
        console.log('Button not found');
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}