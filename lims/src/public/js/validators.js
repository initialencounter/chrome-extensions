"use strict";
(() => {
  // src/utils/index.ts
  function matchWattHour(projectName) {
    const matches = [...projectName.matchAll(/\s(\d+\.?\d+)[Kk]?[Ww][Hh]/g)];
    const results = matches.map((match) => match[1]);
    let wattHour = Number(results[0]);
    if (!results.length) return 0;
    if (isNaN(wattHour)) return 0;
    if (projectName.toLowerCase().includes("kwh")) wattHour *= 1e3;
    return wattHour;
  }
  function getBtyTypeCode(currentData) {
    const isIon = String(currentData["type1"]) === "1";
    const isCell = String(currentData["type2"]) === "1";
    const isSingleCell = currentData["otherDescribe"].includes("1790");
    if (isIon) {
      if (isCell) return "501";
      else return isSingleCell ? "504" : "500";
    } else {
      if (isCell) return "503";
      else return isSingleCell ? "505" : "502";
    }
  }
  function getIsSingleCell(btyType) {
    return !["500", "502"].includes(btyType);
  }
  function pekIsDangerous(wattHour, pkgInfo, liContent, netWeight, isSingleCell) {
    if (wattHour > 100) return true;
    if (wattHour > 20 && isSingleCell) return true;
    if (liContent > 2) return true;
    if (liContent > 1 && isSingleCell) return true;
    switch (pkgInfo) {
      case "965":
      case "968":
      case "952":
        return true;
      case "966":
      case "967":
      case "969":
      case "970":
        return netWeight > 5;
    }
    return false;
  }
  function getPkgInfo(unNo, isIon, otherDescribe) {
    switch (otherDescribe) {
      case "0":
        return isIon ? "965" : "968";
      case "1":
        return isIon ? "966" : "969";
      case "2":
        if (unNo === "UN3171" || unNo === "UN3556" || unNo === "UN3557") {
          return "952";
        }
        return isIon ? "967" : "970";
    }
  }
  function isBatteryLabel(pkgInfoSubType, shape) {
    switch (pkgInfoSubType) {
      case "952":
      case "965, IA":
      case "966, I":
      case "967, I":
      case "968, IA":
      case "969, I":
      case "970, I":
        return false;
      case "970, II":
        return shape !== "8aad92b65aae82c3015ab094788a0026";
      case "965, IB":
      case "966, II":
      case "967, II":
      case "968, IB":
      case "969, II":
        return true;
    }
    return false;
  }
  function getPkgInfoByPackCargo(inspectionItem5Text1, packCargo) {
    let pkgInfo = getPkgInfoSubType(inspectionItem5Text1, packCargo);
    return pkgInfo === "" ? "" : pkgInfo.slice(0, 3);
  }
  function getPkgInfoSubType(inspectionItem5Text1, packCargo) {
    if (inspectionItem5Text1 === "" && packCargo === "") return "";
    let clearPackCargo = packCargo.replace(/[^a-zA-Z0-9]/g, "");
    if (!clearPackCargo.length) return inspectionItem5Text1 + ", II";
    if (clearPackCargo.length < 3) return "";
    if (clearPackCargo === "952") return "952";
    let subType = clearPackCargo.replace(/[^A-Z]/g, "");
    return `${clearPackCargo.slice(0, 3)}, ${subType}`;
  }
  function getUNNO(pkgInfo, isIon) {
    switch (pkgInfo) {
      case "965":
        return "UN3480";
      case "966":
      case "967":
        return "UN3481";
      case "968":
        return "UN3090";
      case "969":
      case "970":
        return "UN3091";
      case "952":
        return isIon ? "UN3556" : "UN3557";
    }
    return "";
  }
  function getIsCargoOnly(pkgInfo, netWeight) {
    switch (pkgInfo) {
      case "965":
      case "968":
        return true;
      case "966":
      case "967":
      case "969":
      case "970":
        if (netWeight > 5) return true;
    }
  }
  function pkgInfoIsIA(wattHour, pkgInfo, liContent, netWeight, isSingleCell) {
    if (pkgInfo === "965") {
      if (wattHour > 100) {
        return true;
      }
      if (isSingleCell && wattHour > 20) {
        return true;
      }
      if (netWeight > 10) {
        return true;
      }
      return false;
    }
    if (pkgInfo === "968") {
      if (liContent > 2) {
        return true;
      }
      if (isSingleCell && liContent > 1) {
        return true;
      }
      return netWeight > 2.5;
    }
    return false;
  }
  function parseNetWeight(net_weight) {
    net_weight = net_weight.replace(/ /g, "");
    if (net_weight.length === 0) {
      return NaN;
    }
    switch (net_weight) {
      case "<5":
        return 4.9;
      case "＜5":
        return 4.9;
      case "<35":
        return 34.9;
      case "＜35":
        return 34.9;
      default:
        return Number(net_weight);
    }
  }
  function matchLiContentOrWattHour(num) {
    num = num.replace(/ /g, "");
    let matches = [...num.matchAll(/[0-9]+(\.\d*)?/g)];
    let results = matches.map((match) => match[0]);
    let result = Number(results[0]);
    if (isNaN(result)) return 0;
    return result;
  }

  // src/pek/index.ts
  function checkPekBtyType(currentData) {
    const result = [];
    const btyType = getBtyTypeCode(currentData);
    const itemCName = currentData["itemCName"];
    const itemEName = currentData["itemEName"];
    const btyKind = currentData["model"];
    const wattHour = matchLiContentOrWattHour(currentData["inspectionItem3Text1"]);
    const wattHourFromName = matchWattHour(currentData["itemCName"]);
    const liContent = matchLiContentOrWattHour(currentData["inspectionItem4Text1"]);
    const btyCount = Number(currentData["btyCount"]);
    const netWeight = parseNetWeight(currentData["netWeight"]);
    const isSingleCell = getIsSingleCell(btyType);
    const btyShape = currentData["shape"];
    const btySize = currentData["size"];
    const unno = currentData["unno"];
    const isCell = String(currentData["type2"]) === "1";
    const classOrDiv = currentData["classOrDiv"];
    const otherDescribe = currentData["otherDescribe"];
    const packPassengerCargo = currentData["packPassengerCargo"];
    const packCargo = currentData["packCargo"];
    const inspectionItem1 = String(currentData["inspectionItem1"]);
    const isIon = String(currentData["type1"]) === "1";
    const pkgInfo = getPkgInfo(unno, isIon, inspectionItem1);
    const inspectionItem5Text1 = currentData["inspectionItem5Text1"];
    const pkgInfoByPackCargo = getPkgInfoByPackCargo(inspectionItem5Text1, packCargo);
    const pkgInfoSubType = getPkgInfoSubType(inspectionItem5Text1, packCargo);
    const inspectionItem6 = currentData["inspectionItem6"];
    const inspectionItem2 = currentData["inspectionItem2"];
    const according = currentData["according"];
    const isChargeBoxOrRelated = currentData["otherDescribeCAddition"].includes("总净重");
    const isDangerous = pekIsDangerous(
      wattHour,
      pkgInfo,
      liContent,
      netWeight,
      isSingleCell
    );
    const isIA = pkgInfoIsIA(wattHour, pkgInfo, liContent, netWeight, isSingleCell);
    if (itemCName.includes("芯") && !["501", "503"].includes(btyType))
      result.push({ ok: false, result: "电池类型应为电芯" });
    if (!itemCName) result.push({ ok: false, result: "中文品名为空" });
    if (!itemEName) result.push({ ok: false, result: "英文品名为空" });
    if (btySize.includes("m") && btySize.includes("M"))
      result.push({ ok: false, result: "电池尺寸缺失单位" });
    if (btySize.includes("Φ") || btySize.includes("φ") || btySize.includes("Ø") || btySize.includes("ø")) {
      if (![
        "8aad92b65aae82c3015ab094788a0026",
        "8aad92b65d7a7078015d7e1bb1a2245d",
        "521",
        "2c9180838b90642e018bf132f37f5a60"
      ].includes(btyShape)) {
        result.push({ ok: false, result: "电池形状或尺寸错误，应为扣式 近圆柱体 圆柱体 球形" });
      }
    }
    if (!btyKind) result.push({ ok: false, result: "电池型号为空" });
    if (netWeight === 0) result.push({ ok: false, result: "电池净重为空" });
    if (pkgInfoSubType === "") {
      result.push({ ok: false, result: "包装说明为空" });
    }
    if (!isNaN(netWeight)) {
      if (netWeight > 2.5) {
        if (pkgInfoSubType === "968, IB") {
          result.push({ ok: false, result: "968，IB 电池净重超过2.5kg" });
        }
      } else if (netWeight > 5) {
        if (pkgInfoSubType === "966, II" || pkgInfoSubType === "967, II" || pkgInfoSubType === "969, II" || pkgInfoSubType === "970, II") {
          result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过5kg` });
        }
      } else if (netWeight > 10) {
        if (pkgInfoSubType === "965, IB") {
          result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过10kg` });
        }
      } else if (netWeight > 35) {
        if (pkgInfoSubType === "965, IA" || pkgInfoSubType === "966, I" || pkgInfoSubType === "967, I" || pkgInfoSubType === "968, IA" || pkgInfoSubType === "969, I" || pkgInfoSubType === "970, I") {
          result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过35kg` });
        }
      }
    }
    if (isCell) {
      if (otherDescribe.includes("1791") || otherDescribe.includes("1794")) {
        result.push({ ok: false, result: "物品为电芯，不应勾选: 该电池已经做好防短路...或该锂电池不属于召回电芯..." });
      }
    } else {
      if (otherDescribe.includes("1792") || otherDescribe.includes("1795")) {
        result.push({ ok: false, result: "物品为电池，不应勾选: 该电芯已经做好防短路...或该锂电芯不属于召回电芯..." });
      }
    }
    if (pkgInfo === "965" && !otherDescribe.includes("8aad92b65887a3a8015889d0cd7d0093")) {
      result.push({ ok: false, result: "965 应勾选: 荷电状态≤30%" });
    }
    if (pkgInfo !== "965" && otherDescribe.includes("8aad92b65887a3a8015889d0cd7d0093")) {
      result.push({ ok: false, result: "非 965 不应勾选: 荷电状态≤30%" });
    }
    if (isCell && !currentData["otherDescribeCAddition"].includes("单块电芯") && !currentData["otherDescribeCAddition"].includes("总净重"))
      result.push({ ok: false, result: "物品为电芯时，描述中不应该出现单块电池" });
    if (!isCell && !currentData["otherDescribeCAddition"].includes("单块电池") && !currentData["otherDescribeCAddition"].includes("总净重"))
      result.push({ ok: false, result: "物品为电池时，描述中不应该出现单块电芯" });
    if (pkgInfo !== pkgInfoByPackCargo) {
      console.log(pkgInfo, pkgInfoByPackCargo);
      result.push({ ok: false, result: `${pkgInfo}包装，但结论是${pkgInfoByPackCargo}` });
    }
    if ((pkgInfo === "966" || pkgInfo === "969") && !currentData["otherDescribeCAddition"].includes("包装在一起") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "与设备包装在一起，其他描述中没有包装在一起5个字" });
    if ((pkgInfo === "967" || pkgInfo === "970") && !currentData["otherDescribeCAddition"].includes("设备内置") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "安装在设备上，其他描述中没有设备内置4个字" });
    if (currentData["otherDescribeChecked"] !== "1")
      result.push({ ok: false, result: "应勾选附加操作信息" });
    if (!itemCName.includes(btyKind))
      result.push({
        ok: false,
        result: "型号或中文品名错误，电池型号不在项目中文名称中"
      });
    if (!itemEName.includes(btyKind))
      result.push({
        ok: false,
        result: "型号或英文品名错误，电池型号不在项目英文名称中"
      });
    if (String(inspectionItem6) === "0" && !otherDescribe.includes("2c9180849267773c0192dc73c77e5fb2")) {
      if (pkgInfoSubType === "967, I" || pkgInfoSubType === "970, I" || pkgInfoSubType === "967, II" || pkgInfoSubType === "970, II") {
        result.push({ ok: false, result: "967/970 未勾选堆码，或堆码评估，如果是24年报告请忽略" });
      }
      if (pkgInfoSubType === "966, II" || pkgInfoSubType === "969, II") {
        result.push({ ok: false, result: "966/969 第II部分未勾选堆码，或堆码评估，如果是24年报告请忽略" });
      }
    }
    if (pkgInfoSubType === "965, IB") {
      if (String(inspectionItem6) === "0") {
        result.push({ ok: false, result: "965，IB未勾选堆码" });
      }
      if (String(inspectionItem2) === "0") {
        result.push({ ok: false, result: "965，IB未勾选跌落" });
      }
    }
    if ((pkgInfoSubType === "966, II" || inspectionItem5Text1 === "966") && String(inspectionItem2) === "0") {
      result.push({ ok: false, result: "966，II未勾选跌落" });
    }
    if (Number(currentData["inspectionItem3"]) !== 1)
      result.push({
        ok: false,
        result: "检验项目4错误，未勾选锂电池已通过 UN38.3 测试"
      });
    if (isBatteryLabel(pkgInfoSubType, btyShape)) {
      if (Number(currentData["inspectionItem4"]) !== 1)
        if (pkgInfoSubType === "970, II")
          result.push({ ok: false, result: `检验项目5错误，970, II，非纽扣电池，应勾选加贴锂电池标记` });
        else
          result.push({ ok: false, result: `检验项目5错误，${pkgInfoSubType}应勾选加贴锂电池标记` });
    } else {
      if (Number(currentData["inspectionItem4"]) !== 0)
        if (pkgInfoSubType === "970, II" && btyShape === "8aad92b65aae82c3015ab094788a0026")
          result.push({ ok: false, result: `检验项目5错误，设备内置纽扣电池不应勾选加贴锂电池标记` });
        else
          result.push({ ok: false, result: `检验项目5错误，${pkgInfoSubType}不应勾选加贴锂电池标记` });
    }
    if (isDangerous) {
      if (inspectionItem5Text1 !== "") {
        result.push({ ok: false, result: "危险品，参见包装说明应为空" });
      }
    } else {
      if (isNaN(Number(inspectionItem5Text1))) {
        result.push({ ok: false, result: "非限制性，包装说明应为数字" });
      }
    }
    if (Number(currentData["inspectionItem5"]) !== 0)
      result.push({ ok: false, result: "检查项目6错误，附有随机文件应为：否" });
    if (isIon) {
      if (currentData["inspectionItem3Text1"] === "")
        result.push({ ok: false, result: "鉴别项目1错误，瓦时数为空" });
      if (currentData["inspectionItem4Text1"] !== "")
        result.push({ ok: false, result: "鉴别项目1错误，锂含量不为空" });
    } else {
      if (currentData["inspectionItem3Text1"] !== "")
        result.push({ ok: false, result: "鉴别项目1错误，瓦时数不为空" });
      if (currentData["inspectionItem4Text1"] === "")
        result.push({ ok: false, result: "鉴别项目1错误，锂含量为空" });
    }
    if (wattHourFromName > 0 && !isNaN(wattHour) && isIon) {
      if (wattHour !== wattHourFromName)
        result.push({ ok: false, result: "瓦时数与项目名称不匹配" });
    }
    const conclusions = Number(currentData["conclusions"]);
    const result1 = currentData["result1"];
    if (result1 !== "DGR规定,资料核实")
      result.push({ ok: false, result: "DGR规定，资料核实错误，未勾选错误" });
    if (conclusions === 1) {
      if (!isDangerous) {
        result.push({ ok: false, result: "结论错误，经包装、电池瓦时、锂含量、净重、电芯类型判断，物品为非限制性货物" });
      }
      const UNNO = getUNNO(pkgInfoByPackCargo, isIon);
      const isCargoOnly = getIsCargoOnly(pkgInfo, netWeight);
      if (isCargoOnly && packPassengerCargo !== "Forbidden") {
        result.push({ ok: false, result: "结论错误，客货机禁止运输" });
      }
      if (unno !== UNNO) {
        if (UNNO === "UN3556") {
          result.push({ ok: false, result: "结论错误，UN编号应为UN3556, 如果是25年报告请忽略" });
        } else {
          result.push({ ok: false, result: "结论错误，UN编号应为" + UNNO });
        }
      }
      if (String(classOrDiv) !== "9") {
        result.push({ ok: false, result: "结论错误，危险性类别应为9" });
      }
      if (inspectionItem5Text1 !== "") {
        result.push({ ok: false, result: "结论错误，危险品，参见包装说明应为空" });
      }
    } else if (conclusions === 0) {
      if (packCargo !== "") {
        result.push({ ok: false, result: "结论错误，仅限货机应为空" });
      }
      if (packPassengerCargo !== "") {
        result.push({ ok: false, result: "结论错误，客货机应为空" });
      }
      if (classOrDiv !== "") {
        result.push({ ok: false, result: "结论错误，危险性类别应为空" });
      }
      if (unno !== "") {
        result.push({ ok: false, result: "结论错误，非限制性，UN编号应为空" });
      }
    }
    if (isIon) {
      if (isNaN(wattHour) || isNaN(netWeight)) {
        result.push({ ok: false, result: "瓦时数，净重，二者中有非数字，表单验证可能不准确" });
      }
    } else {
      if (isNaN(liContent) || isNaN(netWeight)) {
        result.push({ ok: false, result: "锂含量，净重，二者中有非数字，表单验证可能不准确" });
      }
    }
    if (isIA) {
      if (pkgInfoSubType === "965, IB" || pkgInfoSubType === "968, IB") {
        result.push({ ok: false, result: "应为IA" });
      }
    } else {
      if (pkgInfoSubType === "965, IA" || pkgInfoSubType === "968, IA") {
        result.push({ ok: false, result: "应为IB" });
      }
    }
    if (currentData["market"] === "") {
      result.push({ ok: false, result: "技术备注为空" });
    }
    return result;
  }

  // src/sek/index.ts
  function checkSekBtyType(currentData) {
    const result = [];
    const checkMap = {
      "500": ["≤100Wh", ">100Wh"],
      "501": ["≤20Wh", ">20Wh"],
      "504": ["≤20Wh", ">20Wh"],
      "502": [">2g", "≤2g"],
      "503": [">1g", "≤1g"],
      "505": [">1g", "≤1g"]
    };
    const btyType = currentData["btyType"];
    if (!checkMap[btyType]) result.push({ ok: false, result: "不适用的电池类型" });
    const itemCName = currentData["itemCName"];
    const itemEName = currentData["itemEName"];
    const btyKind = currentData["btyKind"];
    if (itemCName.includes("芯") && !["501", "503"].includes(btyType))
      result.push({ ok: false, result: "电池类型应为电芯" });
    if (!itemCName) result.push({ ok: false, result: "中文品名为空" });
    if (!itemEName) result.push({ ok: false, result: "英文品名为空" });
    const btyShape = currentData["btyShape"];
    const btySize = currentData["btySize"];
    if (btySize.includes("m") && btySize.includes("M"))
      result.push({ ok: false, result: "电池尺寸缺失单位" });
    if (btySize.includes("Φ") || btySize.includes("φ") || btySize.includes("Ø") || btySize.includes("ø")) {
      if (![
        "8aad92b65aae82c3015ab094788a0026",
        "8aad92b65d7a7078015d7e1bb1a2245d",
        "521",
        "2c9180838b90642e018bf132f37f5a60"
      ].includes(btyShape)) {
        result.push({ ok: false, result: "电池形状或尺寸错误" });
      }
    }
    const otherDescribe = currentData["otherDescribe"];
    const btyGrossWeight = currentData["btyGrossWeight"];
    if (!otherDescribe) result.push({ ok: false, result: "其他描述包装方式为空" });
    if (otherDescribe.length > 3)
      result.push({ ok: false, result: "其他描述包装方式不唯一" });
    if (["501", "503"].includes(btyType) && !currentData["otherDescribeCAddition"].includes("单块电芯") && !currentData["otherDescribeCAddition"].includes("总净重"))
      result.push({ ok: false, result: "其他描述不为电芯" });
    if (!["501", "503"].includes(btyType) && !currentData["otherDescribeCAddition"].includes("单块电池") && !currentData["otherDescribeCAddition"].includes("总净重"))
      result.push({ ok: false, result: "其他描述不为电池" });
    if (otherDescribe === "541" && !currentData["otherDescribeCAddition"].includes("包装") && !currentData["otherDescribeCAddition"].includes("总净重"))
      result.push({ ok: false, result: "与设备包装在一起，其他描述错误" });
    if (otherDescribe === "542" && !currentData["otherDescribeCAddition"].includes("设备内置") && !currentData["otherDescribeCAddition"].includes("总净重"))
      result.push({ ok: false, result: "安装在设备上，其他描述错误" });
    if (currentData["otherDescribeChecked"] !== "1")
      result.push({ ok: false, result: "未勾选其他描述" });
    if (!btyKind) result.push({ ok: false, result: "电池型号为空" });
    if (!itemCName.includes(btyKind))
      result.push({
        ok: false,
        result: "型号或中文品名错误，电池型号不在项目中文名称中"
      });
    if (!itemEName.includes(btyKind))
      result.push({
        ok: false,
        result: "型号或英文品名错误，电池型号不在项目英文名称中"
      });
    const inspectionResult2 = currentData["inspectionResult2"];
    if (inspectionResult2 !== "0")
      result.push({
        ok: false,
        result: "检验结果2错误，未勾选锂电池已通过 UN38.3 测试"
      });
    const inspectionResult3 = currentData["inspectionResult3"];
    if (inspectionResult3 !== "0")
      result.push({
        ok: false,
        result: "检验结果3错误，未勾选电池按照规定的质量管理体系进行制造。"
      });
    const inspectionResult4 = currentData["inspectionResult4"];
    if (inspectionResult4 !== "0")
      result.push({
        ok: false,
        result: "检验结果4错误，未勾选该锂电池不属于召回电池，不属于废弃和回收电池。"
      });
    const inspectionResult5 = currentData["inspectionResult5"];
    const conclusions = currentData["conclusions"];
    if (String(inspectionResult5) !== "0") {
      if (otherDescribe.includes("540") && String(conclusions) === "0") {
        result.push({ ok: false, result: "单独运输非限制性，未通过1.2米跌落" });
      }
    }
    if (currentData["inspectionResult7"] !== "2")
      result.push({ ok: false, result: "随附文件错误，未勾选不适用" });
    if (currentData["inspectionResult8"] !== "2" || currentData["inspectionResult9"] !== "2")
      result.push({ ok: false, result: "鉴别项目8，9 错误，未勾选不适用" });
    if (currentData["inspectionItem8Cn"] !== "" || currentData["inspectionItem8En"] !== "" || currentData["inspectionItem9Cn"] !== "" || currentData["inspectionItem9En"] !== "")
      result.push({ ok: false, result: "鉴别项目8，9 不为空" });
    if (["500", "501", "504"].includes(btyType)) {
      result.push(...checkSekIonBtyType(currentData, checkMap, btyType));
    } else {
      result.push(...checkSekMetalBtyType(currentData, checkMap, btyType));
    }
    return result;
  }
  function checkSekIonBtyType(currentData, checkMap, btyType) {
    const result = [];
    if (currentData["inspectionItem1"] !== "1111")
      result.push({ ok: false, result: "鉴别项目1错误，未勾选瓦时数" });
    if (currentData["inspectionItem1Text1"] === "")
      result.push({ ok: false, result: "鉴别项目1错误，瓦时数为空" });
    if (currentData["inspectionItem1Text2"] !== "")
      result.push({ ok: false, result: "鉴别项目1错误，锂含量不为空" });
    const wattHourFromName = matchWattHour(currentData["itemCName"]);
    const inspectionResult1 = currentData["inspectionResult1"];
    if (!checkMap[btyType].includes(inspectionResult1))
      result.push({ ok: false, result: "检验结果1错误，瓦时数取值范围错误" });
    if (wattHourFromName > 0 && !isNaN(Number(currentData["inspectionItem1Text1"]))) {
      if (Number(currentData["inspectionItem1Text1"]) !== wattHourFromName)
        result.push({ ok: false, result: "瓦时数与项目名称不匹配" });
    }
    if (["501", "504"].includes(btyType)) {
      if (wattHourFromName > 20) {
        if (inspectionResult1 !== ">20Wh")
          result.push({ ok: false, result: "瓦时数结果错误，应为>20Wh" });
      } else {
        if (inspectionResult1 !== "≤20Wh")
          result.push({ ok: false, result: "瓦时数结果错误，应为≤20Wh" });
      }
    } else {
      if (wattHourFromName > 100) {
        if (inspectionResult1 !== ">100Wh")
          result.push({ ok: false, result: "瓦时数结果错误，应为>100Wh" });
      } else {
        if (inspectionResult1 !== "≤100Wh")
          result.push({ ok: false, result: "瓦时数结果错误，应为≤100Wh" });
      }
    }
    if (currentData["inspectionItem7"] !== "1125")
      result.push({ ok: false, result: "随附文件错误，未勾选锂离子电池" });
    const otherDescribe = currentData["otherDescribe"];
    const btyGrossWeight = Number(currentData["btyGrossWeight"]);
    const conclusions = Number(currentData["conclusions"]);
    if ([">100Wh", ">20Wh"].includes(inspectionResult1)) {
      if (conclusions !== 1)
        result.push({
          ok: false,
          result: "结论错误，瓦时数大于100Wh或者20Wh，应为危险物品"
        });
      if (otherDescribe === "540" && currentData["unno"] !== "UN3480")
        result.push({
          ok: false,
          result: "结论错误，单独运输，UN编号应为UN3480"
        });
      if (otherDescribe !== "540" && currentData["unno"] !== "UN3481" && currentData["unno"] !== "UN3171")
        result.push({ ok: false, result: "结论错误，UN编号应为UN3481" });
      if (["540", "541"].includes(otherDescribe) && currentData["comment"] !== "1200") {
        result.push({
          ok: false,
          result: "结论错误，危险品物品，单独运输或与设备包装在一起，应达到II级包装性能"
        });
      }
    }
    if (["≤100Wh", "≤20Wh"].includes(inspectionResult1) && currentData["unno"] !== "UN3171") {
      if (otherDescribe === "540" && btyGrossWeight > 30)
        result.push({
          ok: false,
          result: "结论错误，单独运输，毛重大于30kg，应为危险品"
        });
      if (conclusions !== 0) {
        result.push({
          ok: false,
          result: "结论错误，瓦时数小于100Wh或者20Wh，应为非限制性"
        });
      }
    }
    if (currentData["market"] === "") {
      result.push({ ok: false, result: "技术备注为空" });
    }
    return result;
  }
  function checkSekMetalBtyType(currentData, checkMap, btyType) {
    const result = [];
    if (currentData["inspectionItem1"] !== "1112")
      result.push({ ok: false, result: "鉴别项目1错误，未勾选锂含量" });
    if (currentData["inspectionItem1Text2"] === "")
      result.push({ ok: false, result: "鉴别项目1错误，锂含量为空" });
    if (currentData["inspectionItem1Text1"] !== "")
      result.push({ ok: false, result: "鉴别项目1错误，瓦时数不为空" });
    const inspectionResult1 = currentData["inspectionResult1"];
    const liContent = Number(currentData["inspectionItem1Text2"]);
    if (!checkMap[btyType].includes(inspectionResult1))
      result.push({ ok: false, result: "检验结果1错误，锂含量取值范围错误" });
    if (isNaN(liContent)) {
      if (["503", "505"].includes(btyType)) {
        if (liContent > 1) {
          if (inspectionResult1 !== ">1g")
            result.push({ ok: false, result: "锂含量取值范围错误，应>1g" });
        } else {
          if (inspectionResult1 !== "≤1g")
            result.push({ ok: false, result: "锂含量取值范围错误，应≤1g" });
        }
      } else {
        if (liContent > 2) {
          if (inspectionResult1 !== ">2g")
            result.push({ ok: false, result: "锂含量取值范围错误，应>2g" });
        } else {
          if (inspectionResult1 !== "≤2g")
            result.push({ ok: false, result: "锂含量取值范围错误，应≤2g" });
        }
      }
    }
    if (currentData["inspectionItem7"] !== "1126")
      result.push({ ok: false, result: "随附文件错误，未勾选锂金属电池" });
    const otherDescribe = currentData["otherDescribe"];
    const btyGrossWeight = Number(currentData["btyGrossWeight"]);
    const conclusions = Number(currentData["conclusions"]);
    if ([">2g", ">1g"].includes(inspectionResult1)) {
      if (conclusions !== 1)
        result.push({
          ok: false,
          result: "结论错误，锂含量大于1g或2g，应为危险物品"
        });
      if (otherDescribe === "540" && currentData["unno"] !== "UN3090")
        result.push({
          ok: false,
          result: "结论错误，单独运输，UN编号应为UN3090"
        });
      if (otherDescribe !== "540" && currentData["unno"] !== "UN3091")
        result.push({ ok: false, result: "结论错误，UN编号应为UN3091" });
      if (["540", "541"].includes(otherDescribe) && currentData["comment"] !== "1200") {
        result.push({
          ok: false,
          result: "结论错误，危险品，单独运输或与设备包装在一起，应达到II级包装性能"
        });
      }
    }
    if (["≤100Wh", "≤20Wh"].includes(inspectionResult1)) {
      if (otherDescribe === "540" && btyGrossWeight > 30)
        result.push({
          ok: false,
          result: "结论错误，单独运输，毛重大于30kg，应为危险品"
        });
      if (conclusions !== 0 && currentData["unno"] !== "UN3171") {
        result.push({
          ok: false,
          result: "结论错误，锂含量小于1g或2g，应为非限制性"
        });
      }
    }
    if (currentData["market"] === "")
      result.push({ ok: false, result: "技术备注为空" });
    return result;
  }

  // src/index.ts
  window.checkPekBtyType = checkPekBtyType;
  window.checkSekBtyType = checkSekBtyType;
})();
