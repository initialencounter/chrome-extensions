console.log("import template running");

let systemId = window.location.pathname.startsWith('/pek') ? 'PEKGZ' : 'SEKGZ';
let date = new Date().toISOString().slice(0, 8).replace(/-/g, '');
console.log(systemId, date);


(async function () {
    await sleep(200);
    let qProjectNo = document.getElementById('qProjectNo')
    qProjectNo.value = systemId + date;
    qProjectNo.addEventListener('input', function () {
        // 项目编号
        let input = qProjectNo.value.replace(/[^0-9A-Z]/g, '');
        qProjectNo.value = input
        const startDate = checkDate(parseDate(input));
        // 检验日期
        if (!startDate) return;
        document.getElementsByClassName('textbox-value')[14].value = startDate[0];
        document.getElementsByClassName('textbox-value')[15].value = startDate[1];
    })
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