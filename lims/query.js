console.log("query patch running");

(async function () {
    await sleep(500);
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
        console.log(parseDate(lastInput));
        const startDate = checkDate(parseDate(lastInput));
        console.log(startDate);
        // 检验日期
        if (!startDate) continue;
        document.getElementsByClassName('textbox-value')[14].value = startDate[0];
        document.getElementsByClassName('textbox-value')[15].value = startDate[1];
    }
})();

function checkDate(dateText) {
    for (const text of dateText) {
        if (!text) return false;
        const [year, month, day] = text.split('-');
        if (year.length < 4 || Number(year) < 2020) {
            return false;
        }
        if (isNaN(Number(month)) || Number(month) < 1 || Number(month) > 12) {
            return false;
        }
        if (isNaN(Number(day)) || Number(day) < 1 || Number(day) > 31) {
            return false;
        }
    }

    return dateText;
}

function parseDate(dateText) {
    dateText = dateText.replace(/[^0-9]/g, '');
    if (dateText.length < 9) {
        return ["",""];
    }
    let year = dateText.slice(0, 4);
    let month = dateText.slice(4, 6);
    let day = dateText.slice(6, 8);
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