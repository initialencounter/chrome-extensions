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

function setProjectNoToClipText() {
    const projectNoSpan = document.getElementById('projectNo')
    const projectNo = projectNoSpan.innerText;
    navigator.clipboard.writeText(projectNo);
    Qmsg['success']('已复制项目编号');
}