console.log("导入模板脚本运行中...");

let systemId = window.location.pathname.startsWith('/pek') ? 'PEKGZ' : 'SEKGZ';
console.log(systemId);


(async function () {
    await sleep(200);
    let qProjectNo = document.getElementById('qProjectNo')
    document.getElementById('importBtn0').addEventListener('click', handleImportBtnClick);
    qProjectNo.value = getMonthsAgoProjectNo();
    qProjectNo.addEventListener('input', function () {
        // 项目编号
        let input = qProjectNo.value.replace(/[^0-9A-Z]/g, '');
        qProjectNo.value = input;
    })
})();


async function handleImportBtnClick() {
    let importBtn = document.getElementById('importBtn0');
    let projectNo = await getClipboardText();
    if (!checkProjectNo(projectNo)) {
        importBtn.removeEventListener('click', handleImportBtnClick);
        return;
    }
    document.getElementById('qProjectNo').value = projectNo;
    importBtn.removeEventListener('click', handleImportBtnClick);
}