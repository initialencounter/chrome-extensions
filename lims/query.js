console.log("query patch running");

(async function () {
    await sleep(500);
    // 物品种类
    document.getElementsByClassName('textbox-value')[1].value = ""
    // 项目编号
    const projectNo_hide = document.getElementsByClassName('textbox-value')[2];
    let lastInput = projectNo_hide;
    while (projectNo_hide) {
        if (lastInput === projectNo_hide.value) {
            await sleep(50);
            continue
        }
        lastInput = projectNo_hide.value;
        const startDate = parseDate(lastInput);
        console.log(startDate,"startDate");
        // 检验日期
        if (!startDate) continue;
        document.getElementsByClassName('textbox-value')[14].value = startDate[0];
        document.getElementsByClassName('textbox-value')[15].value = startDate[1];
    }
})();

function parseDate(dateText) {
    if (dateText.length < 9) {
        return "";
    }
    let year = dateText.slice(5, 9);
    let month = dateText.slice(9, 11);
    let day = dateText.slice(11, 13);
    if (month.length < 2) {
        return [`${year}-01-01`, `${year}-12-31`];
    }
    if (day.length < 2) {
       return [`${year}-${month}-01`, `${year}-${month}-31`];
    }
    return [`${year}-${month}-${day}`, `${year}-${month}-${day}`];
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}