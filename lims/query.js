console.log("检验单查询脚本运行中...");
// TODO
// 1. 自动更改systemId

(async function () {
    await sleep(500);
    document.addEventListener('click', handleQueryBtnClick);
    // 物品种类
    document.getElementsByClassName('textbox-value')[1].value = "battery";
    // 项目编号
    const projectNo_hide = document.getElementsByClassName('textbox-value')[2];
    let lastInput = projectNo_hide;
    while (projectNo_hide) {
        if (lastInput === projectNo_hide.value) {
            await sleep(50);
            continue
        }
        projectNo_hide.value = projectNo_hide.value.replace(/[^0-9A-Z]/g, '');
        lastInput = projectNo_hide.value;
        const startDate = checkDate(parseDate(lastInput));
        // 检验日期
        if (!startDate) continue;
        document.getElementsByClassName('textbox-value')[14].value = startDate[0];
        document.getElementsByClassName('textbox-value')[15].value = startDate[1];
    }
})();

async function handleQueryBtnClick() {
    let projectNo = await getClipboardText();
    document.getElementsByClassName('textbox-value')[2].value = projectNo;
    document.removeEventListener('click', handleQueryBtnClick);
}