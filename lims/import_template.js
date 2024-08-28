console.log("import template running");

let systemId = window.location.pathname.startsWith('/pek') ? 'PEKGZ' : 'SEKGZ';
let date = new Date().toISOString().slice(0, 8).replace(/-/g, '');
console.log(systemId, date);

// TODO
// 1. 当剪切板存在项目编号时，自动填充项目编号，不存在编号时，自动填充检验日期。

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
