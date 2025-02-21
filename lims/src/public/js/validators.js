"use strict";
(() => {
  // src/shared/utils/matchDevice.ts
  function matchDeviceName(projectName) {
    let matches = [...projectName.matchAll(/设备[:：](.*?)[。;；]/g)];
    let results = matches.map((match) => match[1]);
    let result = results[results.length - 1];
    if (!results.length) return "";
    return result;
  }
  function matchDeviceModel(projectName) {
    let matches = [...projectName.matchAll(/设备[:：].*?[;；]型号[:：](.*?)[。；;]/g)];
    let results = matches.map((match) => match[1]);
    let result = results[results.length - 1];
    if (!results.length) return "";
    return result;
  }
  function matchDeviceTrademark(projectName) {
    let matches = [...projectName.matchAll(/设备[:：].*?[;；]型号[:：].*?[；;]商标[:：](.*?)[。;；]/g)];
    let results = matches.map((match) => match[1]);
    let result = results[results.length - 1];
    if (!results.length) return "";
    return result;
  }

  // src/shared/utils/index.ts
  function matchWattHour(projectName) {
    const matches = [...projectName.matchAll(/\s(\d+\.?\d+)[Kk]?[Ww][Hh]/g)];
    const results = matches.map((match) => match[1]);
    const rowText = matches.map((match) => match[0])[results.length - 1];
    let wattHour = Number(results[results.length - 1]);
    if (!results.length) return 0;
    if (isNaN(wattHour)) return 0;
    if (rowText.toLowerCase().includes("kwh")) wattHour *= 1e3;
    return wattHour;
  }
  function matchVoltage(projectName) {
    const matches = [...projectName.matchAll(/(\d+\.?\d*)[Vv]/g)];
    const results = matches.map((match) => match[1]);
    let voltage = Number(results[results.length - 1]);
    if (!results.length) return 0;
    if (isNaN(voltage)) return 0;
    return voltage;
  }
  function matchCapacity(projectName) {
    let matches = [...projectName.matchAll(/(\d+\.?\d*)[Mm]?[Aa][Hh]/g)];
    let results = matches.map((match) => match[1]);
    const rowText = matches.map((match) => match[0])[results.length - 1];
    let result = Number(results[results.length - 1]);
    if (!results.length) return 0;
    if (isNaN(result)) return 0;
    if (!rowText.toLowerCase().includes("mah")) result *= 1e3;
    return result;
  }
  function matchBatteryWeight(describe) {
    const matches = [...describe.matchAll(/为(\d+\.?\d*)[Kk]?[g]?/g)];
    const results = matches.map((match) => match[1]);
    const rowText = matches.map((match) => match[0])[0];
    let weight = Number(results[0]);
    if (!results.length) return 0;
    if (isNaN(weight)) return 0;
    if (rowText.toLowerCase().includes("kg")) weight = weight * 1e3;
    return weight;
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
  function getIsIon(btyType) {
    return btyType === "500" || btyType === "501" || btyType === "504";
  }
  function getIsCell(btyType) {
    return btyType === "501" || btyType === "503";
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
  function matchNumber(num) {
    num = num.replace(/ /g, "");
    let matches = [...num.matchAll(/[0-9]+(\.\d*)?/g)];
    let results = matches.map((match) => match[0]);
    let result = Number(results[0]);
    if (isNaN(result)) return 0;
    return result;
  }

  // src/shared/checkDevice.ts
  function checkDevice(cName, otherDescribeCAddition) {
    let results = [];
    const name = matchDeviceName(otherDescribeCAddition).trim();
    const model = matchDeviceModel(otherDescribeCAddition).trim();
    const trademark = matchDeviceTrademark(otherDescribeCAddition).trim();
    if (name.length && !cName.includes(name)) {
      results.push({
        ok: false,
        result: `设备名称不匹配: ${cName} 和 ${name}`
      });
    }
    if (model.length && !cName.includes(model)) {
      results.push({
        ok: false,
        result: `设备型号不匹配: ${cName} 和 ${model}`
      });
    }
    return results;
  }

  // src/shared/btySizeBtyShape.ts
  function btySizeBtyShape(btySize, btyShape) {
    if (btySize.includes("Φ") || btySize.includes("φ") || btySize.includes("Ø") || btySize.includes("ø")) {
      if (![
        "8aad92b65aae82c3015ab094788a0026",
        "8aad92b65d7a7078015d7e1bb1a2245d",
        "521",
        "2c9180838b90642e018bf132f37f5a60"
      ].includes(btyShape)) {
        return [{ ok: false, result: "电池形状或尺寸错误，应为扣式 近圆柱体 圆柱体 球形" }];
      }
    }
    return [];
  }

  // src/shared/btySizeUnit.ts
  function btySizeUnit(btySize) {
    if (btySize.replace(/ /g, "").length > 0) {
      if (!btySize.includes("m") && !btySize.includes("M"))
        return [{ ok: false, result: "电池尺寸缺失单位" }];
    }
    return [];
  }

  // src/shared/btyWeightCalculate.ts
  function btyWeightCalculate(batteryWeight, btyCount, netWeightDisplay) {
    if (batteryWeight && btyCount && netWeightDisplay) {
      let expectedNetWeight = batteryWeight * btyCount;
      let abs = Math.abs((expectedNetWeight - netWeightDisplay) / netWeightDisplay);
      if (abs > 0.05 && btyCount > 1) {
        return [{ ok: false, result: "电池净重误差大于5%" }];
      }
    }
    return [];
  }

  // src/shared/cellOrBattery.ts
  function cellOrBattery(isCell, otherDescribeCAddition, isChargeBoxOrRelated) {
    let result = [];
    if (isCell && !otherDescribeCAddition.includes("单块电芯") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "物品为电芯时，描述中不应该出现单块电池" });
    if (!isCell && !otherDescribeCAddition.includes("单块电池") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "物品为电池时，描述中不应该出现单块电芯" });
    return result;
  }

  // src/shared/itemCNameBtyType.ts
  function itemCNameBtyType(itemCName, btyType) {
    if (itemCName.includes("芯") && !["501", "503"].includes(btyType))
      return [{ ok: false, result: "电池类型应为电芯" }];
    return [];
  }

  // src/shared/itemNameModel.ts
  function itemNameModel(itemCName, itemEName, btyKind) {
    let result = [];
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
    return result;
  }

  // src/shared/voltageBtyType.ts
  function voltageBtyType(voltage, btyType) {
    if (voltage > 7 && (btyType === "503" || btyType === "501")) {
      return [{ ok: false, result: "电压大于7V，可能为电池组" }];
    }
    return [];
  }

  // src/shared/wattHourCalculate.ts
  function wattHourCalculate(capacity, voltage, wattHour, wattHourFromName) {
    if (capacity && voltage && wattHour && wattHourFromName === wattHour) {
      let expectedWattHour = capacity * voltage / 1e3;
      let abs = Math.abs((expectedWattHour - wattHour) / wattHour);
      if (abs > 0.05) {
        return [{ ok: false, result: "容量*电压 与 瓦时数 误差大于5%" }];
      }
    }
    return [];
  }

  // src/shared/index.ts
  function baseCheck(btySize, btyShape, batteryWeight, btyCount, netWeightDisplay, btyType, otherDescribeCAddition, isChargeBoxOrRelated, isCell, itemCName, itemEName, btyKind, voltage, capacity, wattHour, wattHourFromName) {
    let result = [];
    result.push(...btySizeUnit(btySize));
    result.push(...btySizeBtyShape(btySize, btyShape));
    result.push(...btyWeightCalculate(batteryWeight, btyCount, netWeightDisplay));
    result.push(...cellOrBattery(isCell, otherDescribeCAddition, isChargeBoxOrRelated));
    result.push(...itemCNameBtyType(itemCName, btyType));
    result.push(...itemNameModel(itemCName, itemEName, btyKind));
    result.push(...voltageBtyType(voltage, btyType));
    result.push(...wattHourCalculate(capacity, voltage, wattHour, wattHourFromName));
    return result;
  }

  // src/shared/consts/properShippingNameMap.ts
  var properShippingNameMap = {
    "UN3480": "Lithium ion batteries",
    "UN3481-C": "Lithium ion batteries contained in equipment",
    "UN3481-P": "Lithium ion batteries packed with equipment",
    "UN3090": "Lithium metal batteries",
    "UN3091-C": "Lithium metal batteries contained in equipment",
    "UN3091-P": "Lithium metal batteries packed with equipment",
    "UN3171": "Battery-powered vehicle",
    "UN3556": "Vehicle,lithium ion battery powered",
    "UN3557": "Vehicle,lithium metal battery powered",
    "UN3558": "Vehicle,sodium ion battery powered"
  };

  // src/pek/conclusionsCheck.ts
  function conclusionsCheck(conclusions, isDangerous, pkgInfoByPackCargo, pkgInfo, unno, netWeight, packPassengerCargo, classOrDiv, pkgInfoReference, isIon, packCargo, inspectionItem1, properShippingName, packageGrade) {
    properShippingName = properShippingName.trim();
    packageGrade = packageGrade.trim();
    classOrDiv = classOrDiv.trim();
    let result = [];
    if (conclusions === 1) {
      let unKey = unno;
      if (unno === "UN3481" || unno === "UN3091") {
        if (inspectionItem1 === "2") {
          unKey = unno + "-C";
        } else if (inspectionItem1 === "1") {
          unKey = unno + "-P";
        }
      }
      if (properShippingNameMap[unKey] !== properShippingName) {
        result.push({ ok: false, result: `运输专有名称错误，应为${properShippingNameMap[unKey]}` });
      }
      if (!isDangerous) {
        result.push({ ok: false, result: "结论错误，经包装、电池瓦时、锂含量、净重、电芯类型判断，物品为非限制性货物" });
      }
      const UNNO = getUNNO(pkgInfoByPackCargo, isIon);
      const isCargoOnly = getIsCargoOnly(pkgInfo, netWeight);
      if (isCargoOnly && packPassengerCargo !== "Forbidden") {
        result.push({ ok: false, result: "结论错误，客货机禁止运输" });
      }
      if (unno !== UNNO) {
        result.push({ ok: false, result: "结论错误，UN编号应为" + UNNO });
      }
      if (String(classOrDiv) !== "9") {
        result.push({ ok: false, result: "结论错误，危险性类别应为9" });
      }
      if (pkgInfoReference !== "") {
        result.push({ ok: false, result: "结论错误，危险品，参见包装说明应为空" });
      }
      if (packageGrade !== "/") {
        result.push({ ok: false, result: "结论错误，危险品，包装等级应为斜杠" });
      }
    } else if (conclusions === 0) {
      if (isDangerous) {
        result.push({ ok: false, result: "结论错误，经包装、电池瓦时、锂含量、净重、电芯类型判断，物品为危险品" });
      }
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
      if (packageGrade !== "") {
        result.push({ ok: false, result: "结论错误，非限制性，包装等级应为空" });
      }
    }
    return result;
  }

  // src/pek/dropStackTest.ts
  function dropStackTest(pkgInfoSubType, stackTest, dropTest, stackTestEvaluation) {
    let result = [];
    if (stackTest && stackTestEvaluation) {
      result.push({ ok: false, result: "重复勾选堆码和堆码评估" });
    }
    if (["965, IA", "966, I", "968, IA", "969, I"].includes(pkgInfoSubType)) {
      if (stackTest || stackTestEvaluation) {
        result.push({ ok: false, result: `${pkgInfoSubType}不应勾选堆码` });
      }
    } else {
      if (["967, I", "970, I", "967, II", "970, II", "966, II", "969, II"].includes(pkgInfoSubType)) {
        if (!stackTest && !stackTestEvaluation) {
          result.push({ ok: false, result: `${pkgInfoSubType} 未勾选堆码或堆码评估，如果是24年报告请忽略` });
        }
      }
      if (pkgInfoSubType === "965, IB" || pkgInfoSubType === "968, IB") {
        if (!stackTest) {
          result.push({ ok: false, result: `${pkgInfoSubType}未勾选堆码` });
        }
        if (stackTestEvaluation) {
          result.push({ ok: false, result: `${pkgInfoSubType}不应勾选堆码评估` });
        }
      }
    }
    if (["965, IB", "968, IB", "966, II", "969, II"].includes(pkgInfoSubType)) {
      if (!dropTest) {
        result.push({ ok: false, result: `${pkgInfoSubType}未勾选跌落` });
      }
    } else {
      if (dropTest) {
        result.push({ ok: false, result: `${pkgInfoSubType}不应勾选跌落` });
      }
    }
    return result;
  }

  // src/pek/IAIBCheck.ts
  function IAIBCheck(isIA, pkgInfoSubType) {
    let result = [];
    if (isIA) {
      if (pkgInfoSubType === "965, IB" || pkgInfoSubType === "968, IB") {
        result.push({ ok: false, result: "应为IA" });
      }
    } else {
      if (pkgInfoSubType === "965, IA" || pkgInfoSubType === "968, IA") {
        result.push({ ok: false, result: "应为IB" });
      }
    }
    return result;
  }

  // src/pek/ionOrMetal.ts
  function ionOrMetal(isIon, inspectionItem3Text1, inspectionItem4Text1) {
    let result = [];
    if (isIon) {
      if (inspectionItem3Text1 === "")
        result.push({ ok: false, result: "鉴别项目1错误，瓦时数为空" });
      if (inspectionItem4Text1 !== "")
        result.push({ ok: false, result: "鉴别项目1错误，锂含量不为空" });
    } else {
      if (inspectionItem3Text1 !== "")
        result.push({ ok: false, result: "鉴别项目1错误，瓦时数不为空" });
      if (inspectionItem4Text1 === "")
        result.push({ ok: false, result: "鉴别项目1错误，锂含量为空" });
    }
    return result;
  }

  // src/pek/isNaNCheck.ts
  function isNaNCheck(isIon, wattHour, liContent, netWeight) {
    let result = [];
    if (isIon) {
      if (isNaN(wattHour) || isNaN(netWeight)) {
        result.push({ ok: false, result: "瓦时数，净重，二者中有非数字，表单验证可能不准确" });
      }
    } else {
      if (isNaN(liContent) || isNaN(netWeight)) {
        result.push({ ok: false, result: "锂含量，净重，二者中有非数字，表单验证可能不准确" });
      }
    }
    return result;
  }

  // src/pek/liBtyLabelCheck.ts
  function liBtyLabelCheck(pkgInfoSubType, btyShape, liBtyLabel) {
    let result = [];
    if (isBatteryLabel(pkgInfoSubType, btyShape)) {
      if (!liBtyLabel)
        if (pkgInfoSubType === "970, II")
          result.push({ ok: false, result: `检验项目5错误，970, II，非纽扣电池，应勾选加贴锂电池标记` });
        else
          result.push({ ok: false, result: `检验项目5错误，${pkgInfoSubType}应勾选加贴锂电池标记` });
    } else {
      if (liBtyLabel)
        if (pkgInfoSubType === "970, II" && btyShape === "8aad92b65aae82c3015ab094788a0026")
          result.push({ ok: false, result: `检验项目5错误，设备内置纽扣电池不应勾选加贴锂电池标记` });
        else
          result.push({ ok: false, result: `检验项目5错误，${pkgInfoSubType}不应勾选加贴锂电池标记` });
    }
    return result;
  }

  // src/pek/netWeighLimit.ts
  function netWeighLimit(netWeight, pkgInfoSubType) {
    let result = [];
    if (!isNaN(netWeight)) {
      if (netWeight > 35) {
        if (pkgInfoSubType === "965, IA" || pkgInfoSubType === "966, I" || pkgInfoSubType === "967, I" || pkgInfoSubType === "968, IA" || pkgInfoSubType === "969, I" || pkgInfoSubType === "970, I") {
          result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过35kg` });
        }
      } else if (netWeight > 10) {
        if (pkgInfoSubType === "965, IB") {
          result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过10kg` });
        }
      } else if (netWeight > 5) {
        if (pkgInfoSubType === "966, II" || pkgInfoSubType === "967, II" || pkgInfoSubType === "969, II" || pkgInfoSubType === "970, II") {
          result.push({ ok: false, result: `${pkgInfoSubType} 电池净重超过5kg` });
        }
      } else if (netWeight > 2.5) {
        if (pkgInfoSubType === "968, IB") {
          result.push({ ok: false, result: "968，IB 电池净重超过2.5kg" });
        }
      }
    }
    return result;
  }

  // src/pek/otherDescribeIsCell.ts
  function otherDescribeIsCell(isCell, otherDescribe) {
    let result = [];
    if (isCell) {
      if (otherDescribe.includes("1791") || otherDescribe.includes("1794")) {
        result.push({ ok: false, result: "物品为电芯，不应勾选: 该电池已经做好防短路...或该锂电池不属于召回电芯..." });
      }
    } else {
      if (otherDescribe.includes("1792") || otherDescribe.includes("1795")) {
        result.push({ ok: false, result: "物品为电池，不应勾选: 该电芯已经做好防短路...或该锂电芯不属于召回电芯..." });
      }
    }
    return result;
  }

  // src/pek/packetOrContain.ts
  function packetOrContain(pkgInfo, pkgInfoByPackCargo, otherDescribeCAddition, isChargeBoxOrRelated) {
    let result = [];
    if (pkgInfo !== pkgInfoByPackCargo) {
      result.push({ ok: false, result: `${pkgInfo}包装，但结论是${pkgInfoByPackCargo}` });
    }
    if ((pkgInfo === "966" || pkgInfo === "969") && !otherDescribeCAddition.includes("包装在一起") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "与设备包装在一起，其他描述中没有包装在一起5个字" });
    if ((pkgInfo === "967" || pkgInfo === "970") && !otherDescribeCAddition.includes("设备内置") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "安装在设备上，其他描述中没有设备内置4个字" });
    return result;
  }

  // src/pek/remarksCheck.ts
  function remarksCheck(remarks, pkgInfoSubType) {
    switch (pkgInfoSubType) {
      case "952":
      case "967, I":
      case "970, I":
      case "967, II":
      case "970, II":
        if (remarks !== "1435") {
          return [{ ok: false, result: "注意事项错误，应为：电池或电芯必须加以保护,防止短路.设备必须采取措施防止意外启动." }];
        }
        break;
      case "965, IB":
      case "968, IB":
        if (remarks !== "1518") {
          return [{ ok: false, result: "注意事项错误，应为：本物品仅限货机运输." }];
        }
        break;
      case "966, II":
      case "969, II":
        if (remarks !== "1402") {
          return [{ ok: false, result: "注意事项错误，应为：每一单电池必须做好防短路措施，并装入坚固外包装内。" }];
        }
        break;
      case "965, IA":
      case "968, IA":
      case "966, I":
      case "969, I":
        if (remarks !== "1401") {
          return [{ ok: false, result: "注意事项错误，应为：包装必须达到II级包装的性能标准" }];
        }
        break;
    }
    return [];
  }

  // src/pek/stateOfCharge.ts
  function stateOfCharge(pkgInfo, otherDescribe) {
    let result = [];
    if (pkgInfo === "965" && !otherDescribe.includes("8aad92b65887a3a8015889d0cd7d0093")) {
      result.push({ ok: false, result: "965 应勾选: 荷电状态≤30%" });
    }
    if (pkgInfo !== "965" && otherDescribe.includes("8aad92b65887a3a8015889d0cd7d0093")) {
      result.push({ ok: false, result: "非 965 不应勾选: 荷电状态≤30%" });
    }
    return result;
  }

  // src/pek/index.ts
  function checkPekBtyType(currentData) {
    const result = [];
    const btyType = getBtyTypeCode(currentData);
    const {
      // 品名
      itemCName,
      // 品名
      itemEName,
      // 操作信息
      otherDescribe,
      // 注意事项
      remarks,
      // 危险性类别
      classOrDiv,
      // 仅限货机
      packCargo,
      // 技术备注
      market
    } = currentData;
    const btyKind = currentData["model"];
    const voltage = matchNumber(currentData["inspectionItem2Text1"]);
    const capacity = matchNumber(currentData["inspectionItem2Text2"]);
    const wattHour = matchNumber(currentData["inspectionItem3Text1"]);
    const wattHourFromName = matchWattHour(currentData["itemCName"]);
    const liContent = matchNumber(currentData["inspectionItem4Text1"]);
    const btyCount = matchNumber(currentData["btyCount"]);
    const netWeight = parseNetWeight(currentData["netWeight"]);
    const netWeightDisplay = matchNumber(currentData["netWeight"]) * 1e3;
    const otherDescribeCAddition = currentData["otherDescribeCAddition"];
    const batteryWeight = matchBatteryWeight(otherDescribeCAddition);
    const isSingleCell = getIsSingleCell(btyType);
    const btyShape = currentData["shape"];
    const btySize = currentData["size"];
    const inspectionItem3Text1 = currentData["inspectionItem3Text1"];
    const inspectionItem4Text1 = currentData["inspectionItem4Text1"];
    const unno = currentData["unno"];
    const isCell = String(currentData["type2"]) === "1";
    const properShippingName = currentData["psn"];
    const packageGrade = currentData["pg"];
    const packPassengerCargo = currentData["packPassengerCargo"];
    const inspectionItem1 = String(currentData["inspectionItem1"]);
    const isIon = String(currentData["type1"]) === "1";
    const pkgInfo = getPkgInfo(unno, isIon, inspectionItem1);
    const pkgInfoReference = currentData["inspectionItem5Text1"];
    const pkgInfoByPackCargo = getPkgInfoByPackCargo(pkgInfoReference, packCargo);
    const pkgInfoSubType = getPkgInfoSubType(pkgInfoReference, packCargo);
    const stackTest = String(currentData["inspectionItem6"]) === "1";
    const stackTestEvaluation = otherDescribe.includes("2c9180849267773c0192dc73c77e5fb2");
    const dropTest = String(currentData["inspectionItem2"]) === "1";
    const liBtyLabel = String(currentData["inspectionItem4"]) === "1";
    const unTest = String(currentData["inspectionItem3"]) === "1";
    const randomFile = String(currentData["inspectionItem5"]) === "1";
    const isChargeBoxOrRelated = otherDescribeCAddition.includes("总净重");
    const isDangerous = pekIsDangerous(
      wattHour,
      pkgInfo,
      liContent,
      netWeight,
      isSingleCell
    );
    const isIA = pkgInfoIsIA(wattHour, pkgInfo, liContent, netWeight, isSingleCell);
    if (!itemCName) result.push({ ok: false, result: "中文品名为空" });
    if (!itemEName) result.push({ ok: false, result: "英文品名为空" });
    if (!btyKind) result.push({ ok: false, result: "电池型号为空" });
    if (netWeight === 0) result.push({ ok: false, result: "电池净重为空" });
    if (!unTest) result.push({ ok: false, result: "未勾选通过 UN38.3 测试" });
    if (pkgInfoSubType === "") result.push({ ok: false, result: "包装说明为空" });
    if (!market) result.push({ ok: false, result: "技术备注为空" });
    if (randomFile) result.push({ ok: false, result: "检查项目6错误，附有随机文件应为：否" });
    if (currentData["otherDescribeChecked"] !== "1")
      result.push({ ok: false, result: "应勾选附加操作信息" });
    result.push(...baseCheck(
      btySize,
      btyShape,
      batteryWeight,
      btyCount,
      netWeightDisplay,
      btyType,
      otherDescribeCAddition,
      isChargeBoxOrRelated,
      isCell,
      itemCName,
      itemEName,
      btyKind,
      voltage,
      capacity,
      wattHour,
      wattHourFromName
    ));
    result.push(...netWeighLimit(netWeight, pkgInfoSubType));
    result.push(...stateOfCharge(pkgInfo, otherDescribe));
    result.push(...otherDescribeIsCell(isCell, otherDescribe));
    result.push(...packetOrContain(pkgInfo, pkgInfoByPackCargo, otherDescribeCAddition, isChargeBoxOrRelated));
    result.push(...dropStackTest(pkgInfoSubType, stackTest, dropTest, stackTestEvaluation));
    result.push(...liBtyLabelCheck(pkgInfoSubType, btyShape, liBtyLabel));
    if (isDangerous) {
      if (pkgInfoReference !== "") {
        result.push({ ok: false, result: "危险品，参见包装说明应为空" });
      }
    } else {
      if (isNaN(Number(pkgInfoReference))) {
        result.push({ ok: false, result: "非限制性，包装说明应为数字" });
      }
    }
    result.push(...ionOrMetal(isIon, inspectionItem3Text1, inspectionItem4Text1));
    if (wattHourFromName > 0 && !isNaN(wattHour) && isIon) {
      if (wattHour !== wattHourFromName)
        result.push({ ok: false, result: `瓦时数与项目名称不匹配: ${wattHour} !== ${wattHourFromName}` });
    }
    result.push(...checkDevice(itemCName, otherDescribeCAddition));
    result.push(...remarksCheck(remarks, pkgInfoSubType));
    const conclusions = Number(currentData["conclusions"]);
    const result1 = currentData["result1"];
    if (result1 !== "DGR规定,资料核实")
      result.push({ ok: false, result: "【DGR规定，资料核实】栏错误，勾选错误" });
    result.push(...conclusionsCheck(
      conclusions,
      isDangerous,
      pkgInfoByPackCargo,
      pkgInfo,
      unno,
      netWeight,
      packPassengerCargo,
      classOrDiv,
      pkgInfoReference,
      isIon,
      packCargo,
      inspectionItem1,
      properShippingName,
      packageGrade
    ));
    result.push(...isNaNCheck(isIon, wattHour, liContent, netWeight));
    result.push(...IAIBCheck(isIA, pkgInfoSubType));
    return result;
  }

  // src/sek/conclusionsCheck.ts
  function conclusionsCheck2(conclusions, unno, otherDescribe, inspectionResult1, btyGrossWeight, packageGrade, classOrDiv, isIon, properShippingName) {
    let result = [];
    unno = unno.trim();
    properShippingName = properShippingName.trim();
    packageGrade = packageGrade.trim();
    classOrDiv = classOrDiv.trim();
    if (conclusions === 1) {
      if (unno === "UN3171" || unno === "UN3556" || unno === "UN3557" || unno === "UN3558" || unno === "UN3480" || unno === "UN3481" || unno === "UN3090" || unno === "UN3091") {
        let unKey = unno;
        if (unno === "UN3481" || unno === "UN3091") {
          if (otherDescribe === "542") {
            unKey = unno + "-C";
          } else {
            unKey = unno + "-P";
          }
        }
        if (properShippingNameMap[unKey] !== properShippingName) {
          result.push({ ok: false, result: `结论错误，运输专有名称错误，应为${properShippingNameMap[unKey]}` });
        }
      } else {
        if (["≤1g", "≤2g"].includes(inspectionResult1)) {
          result.push({
            ok: false,
            result: "结论错误，锂含量小于1g或2g，应为非限制性"
          });
        }
        if (["≤100Wh", "≤20Wh"].includes(inspectionResult1)) {
          result.push({
            ok: false,
            result: "结论错误，瓦时数小于100Wh或者20Wh，应为非限制性"
          });
        }
        if (otherDescribe === "540" && isIon && unno !== "UN3480") {
          result.push({
            ok: false,
            result: "结论错误，单独运输，UN编号应为UN3480"
          });
        }
        if (otherDescribe === "540" && !isIon && unno !== "UN3090") {
          result.push({
            ok: false,
            result: "结论错误，单独运输，UN编号应为UN3090"
          });
        }
        if (otherDescribe !== "540" && unno !== "UN3481" && isIon)
          result.push({ ok: false, result: "危险品，设备内置或与设备包装在一起的电池，UN编号应为UN3481" });
        if (otherDescribe !== "540" && unno !== "UN3091" && !isIon)
          result.push({ ok: false, result: "危险品，设备内置或与设备包装在一起的电池，UN编号应为UN3091" });
      }
      if (classOrDiv !== "9") {
        result.push({
          ok: false,
          result: "危险品物品，危险性应为9"
        });
      }
      if (packageGrade !== "/") {
        result.push({
          ok: false,
          result: "危险品物品，包装等级应为斜杠"
        });
      }
    } else {
      if ([">2g", ">1g"].includes(inspectionResult1)) {
        result.push({
          ok: false,
          result: "结论错误，锂含量大于1g或2g，应为危险物品"
        });
      }
      if ([">100Wh", ">20Wh"].includes(inspectionResult1)) {
        result.push({
          ok: false,
          result: "结论错误，瓦时数大于100Wh或者20Wh，应为危险物品"
        });
      }
      if (unno !== "") {
        result.push({
          ok: false,
          result: "非限制性物品，UN编号应为空"
        });
      }
      if (properShippingName !== "") {
        result.push({
          ok: false,
          result: "非限制性物品，运输专有名称应为空"
        });
      }
      if (classOrDiv !== "") {
        result.push({
          ok: false,
          result: "非限制性物品，危险性应为空"
        });
      }
      if (packageGrade !== "") {
        result.push({
          ok: false,
          result: "非限制性物品，包装等级应为空"
        });
      }
      if (otherDescribe === "540" && btyGrossWeight > 30)
        result.push({
          ok: false,
          result: "结论错误，单独运输，毛重大于30kg，应为危险品"
        });
    }
    return result;
  }

  // src/sek/liContentScope.ts
  function liContentScope(btyType, inspectionResult1, liContent) {
    let result = [];
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
    return result;
  }

  // src/sek/wattHourScope.ts
  function wattHourScope(btyType, inspectionResult1, wattHourFromName) {
    let result = [];
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
    return result;
  }

  // src/sek/packetOrContain.ts
  function packetOrContain2(otherDescribe, otherDescribeCAddition, isChargeBoxOrRelated) {
    let result = [];
    if (otherDescribe === "541" && !otherDescribeCAddition.includes("包装") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "与设备包装在一起，其他描述错误" });
    if (otherDescribe === "542" && !otherDescribeCAddition.includes("设备内置") && !isChargeBoxOrRelated)
      result.push({ ok: false, result: "安装在设备上，其他描述错误" });
    return result;
  }

  // src/sek/checkReMark.ts
  var remarkPreventingAccidentalActivationMap = {
    "AEK": "3c91808276a9d82d017833f4de822e9f",
    "REK": "4c91808276a9d82d017833f4de822e9f",
    "SEK": "2c91808276a9d82d017833f4de822e9f"
  };
  var remarkPreventingShortCircuitMap = {
    "AEK": "3aad92b659404f660159431a20630007",
    "REK": "4aad92b659404f660159431a20630007",
    "SEK": "8aad92b659404f660159431a20630007"
  };
  function checkReMark(remarks, projectNo, conclusions, otherDescribe) {
    let result = [];
    if (!projectNo) return result;
    let systemId = projectNo.slice(0, 3);
    if (otherDescribe === "542") {
      if (remarks !== remarkPreventingAccidentalActivationMap[systemId]) {
        result.push({
          ok: false,
          result: "注意事项错误，应为：必须防止设备意外启动。"
        });
      }
    } else if (otherDescribe === "540") {
      if (remarks !== remarkPreventingShortCircuitMap[systemId]) {
        result.push({
          ok: false,
          result: "注意事项错误，应为：每一单电池必须做好防短路措施，并装入坚固外包装内。"
        });
      }
    }
    return result;
  }

  // src/sek/checkComment.ts
  var comment188Map = {
    "AEK": "3aad92b6595aada201595aaf03370000",
    "REK": "4aad92b6595aada201595aaf03370000",
    "SEK": "8aad92b6595aada201595aaf03370000"
  };
  var commentUNMap = {
    "AEK": "3200",
    "REK": "4200",
    "SEK": "1200"
  };
  function checkComment(comment, projectNo, conclusions, otherDescribe) {
    let result = [];
    if (!projectNo) return result;
    let systemId = projectNo.slice(0, 3);
    if (conclusions === 1) {
      if (["540", "541"].includes(otherDescribe)) {
        if (comment !== commentUNMap[systemId]) {
          result.push({
            ok: false,
            result: "单独运输或外配危险品，备注应为：包装必须达到 II 级包装的性能标准。。"
          });
        }
      } else {
        if (comment !== "") {
          result.push({
            ok: false,
            result: "内置危险品，备注应为空"
          });
        }
      }
    } else {
      if (comment !== comment188Map[systemId]) {
        result.push({
          ok: false,
          result: "非限制性物品，备注应为：根据IMDG CODE特殊规定188不受限制。"
        });
      }
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
    const {
      // 项目编号
      projectNo,
      // 中文品名
      itemCName,
      // 英文品名
      itemEName,
      // 电池尺寸
      btySize,
      // 电池形状
      // 锂离子电池 锂离子电芯 锂金属电池 锂金属电芯 单芯锂离子电池 单芯锂金属电池
      // '500'    | '501'    | '504'  |  '502'   | '503'       | '505'
      btyShape,
      // 电池型号
      btyKind,
      // 其他描述
      otherDescribe,
      // 注意事项
      remarks,
      // 备注
      comment,
      // 技术备注
      market,
      // 危险性
      classOrDiv
    } = currentData;
    const btyCount = matchNumber(currentData["btyCount"]);
    const voltage = matchVoltage(itemCName);
    const capacity = matchCapacity(itemCName);
    const wattHour = matchNumber(currentData["inspectionItem1Text1"]);
    const wattHourFromName = matchWattHour(itemCName);
    const liContent = matchNumber(currentData["inspectionItem1Text2"]);
    const netWeight = matchNumber(currentData["btyNetWeight"]);
    const netWeightDisplay = matchNumber(currentData["btyNetWeight"]) * 1e3;
    const btyGrossWeight = Number(currentData["btyGrossWeight"]);
    const otherDescribeCAddition = currentData["otherDescribeCAddition"];
    const batteryWeight = matchBatteryWeight(currentData["otherDescribeCAddition"]);
    const inspectionResult1 = currentData["inspectionResult1"];
    const isSingleCell = getIsSingleCell(btyType);
    const unno = currentData["unno"];
    const isCell = getIsCell(btyType);
    const inspectionItem1 = String(currentData["inspectionItem1"]);
    const isIon = getIsIon(btyType);
    const pkgInfo = getPkgInfo(unno, isIon, inspectionItem1);
    const unTest = String(currentData["inspectionResult2"]) === "0";
    const dropTest = String(currentData["inspectionResult5"]) === "0";
    const packageGrade = currentData["pg"];
    const conclusions = Number(currentData["conclusions"]);
    const properShippingName = currentData["psn"];
    const according = currentData["according"];
    const otherDescribeChecked = currentData["otherDescribeChecked"] === "1";
    const isChargeBoxOrRelated = otherDescribeCAddition.includes("总净重");
    if (!itemCName) result.push({ ok: false, result: "中文品名为空" });
    if (!itemEName) result.push({ ok: false, result: "英文品名为空" });
    if (!btyKind) result.push({ ok: false, result: "电池型号为空" });
    if (!otherDescribe) result.push({ ok: false, result: "其他描述包装方式为空" });
    if (!otherDescribeChecked) result.push({ ok: false, result: "未勾选其他描述" });
    if (!unTest) result.push({ ok: false, result: "未勾选通过 UN38.3 测试" });
    if (!market) result.push({ ok: false, result: "技术备注为空" });
    if (otherDescribe.length > 3)
      result.push({ ok: false, result: "其他描述包装方式不唯一" });
    result.push(...baseCheck(
      btySize,
      btyShape,
      batteryWeight,
      btyCount,
      netWeightDisplay,
      btyType,
      otherDescribeCAddition,
      isChargeBoxOrRelated,
      isCell,
      itemCName,
      itemEName,
      btyKind,
      voltage,
      capacity,
      wattHour,
      wattHourFromName
    ));
    result.push(...packetOrContain2(otherDescribe, otherDescribeCAddition, isChargeBoxOrRelated));
    result.push(...checkDevice(itemCName, otherDescribeCAddition));
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
    if (!dropTest) {
      if (otherDescribe.includes("540") && String(conclusions) === "0") {
        result.push({ ok: false, result: "单独运输非限制性，未通过1.2米跌落" });
      }
      if (otherDescribe.includes("541") && String(conclusions) === "0") {
        result.push({ ok: false, result: "非限制性和设备包装在一起，未通过1.2米跌落" });
      }
    }
    if (currentData["inspectionResult7"] !== "2")
      result.push({ ok: false, result: "随附文件错误，未勾选不适用" });
    if (currentData["inspectionResult8"] !== "2" || currentData["inspectionResult9"] !== "2")
      result.push({ ok: false, result: "鉴别项目8，9 错误，未勾选不适用" });
    if (currentData["inspectionItem8Cn"] !== "" || currentData["inspectionItem8En"] !== "" || currentData["inspectionItem9Cn"] !== "" || currentData["inspectionItem9En"] !== "")
      result.push({ ok: false, result: "鉴别项目8，9 不为空" });
    result.push(...checkReMark(remarks, projectNo, conclusions, otherDescribe));
    result.push(...checkComment(comment, projectNo, conclusions, otherDescribe));
    result.push(...conclusionsCheck2(
      conclusions,
      unno,
      otherDescribe,
      inspectionResult1,
      btyGrossWeight,
      packageGrade,
      classOrDiv,
      isIon,
      properShippingName
    ));
    if (isIon) {
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
    const wattHour = matchNumber(currentData["inspectionItem1Text1"]);
    const inspectionResult1 = currentData["inspectionResult1"];
    if (!checkMap[btyType].includes(inspectionResult1))
      result.push({ ok: false, result: "检验结果1错误，瓦时数取值范围错误" });
    if (wattHourFromName > 0 && !isNaN(wattHour)) {
      if (wattHour !== wattHourFromName)
        result.push({ ok: false, result: `瓦时数与项目名称不匹配${wattHour} !== ${wattHourFromName}` });
    }
    result.push(...wattHourScope(btyType, inspectionResult1, wattHourFromName));
    if (currentData["inspectionItem7"] !== "1125")
      result.push({ ok: false, result: "随附文件错误，未勾选锂离子电池" });
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
    result.push(...liContentScope(btyType, inspectionResult1, liContent));
    if (currentData["inspectionItem7"] !== "1126")
      result.push({ ok: false, result: "随附文件错误，未勾选锂金属电池" });
    return result;
  }

  // src/summary/checkBatteryType.ts
  var batteryTypeMap = {
    "500": "锂离子电池",
    "501": "锂离子电芯",
    "502": "锂金属电池",
    "503": "锂金属电芯",
    "504": "单芯锂离子电池",
    "505": "单芯锂金属电池"
  };
  function matchBatteryType(summaryBatteryType) {
    if (summaryBatteryType.includes("单电芯锂离子电池")) return "504";
    if (summaryBatteryType.includes("单电芯锂金属电池")) return "505";
    if (summaryBatteryType.includes("锂离子电芯")) return "501";
    if (summaryBatteryType.includes("锂金属电池")) return "502";
    if (summaryBatteryType.includes("锂金属电芯")) return "503";
    if (summaryBatteryType.includes("锂离子电池")) return "500";
    return "";
  }
  function checkBatteryType(formBatteryType, summaryBatteryType) {
    let summaryBatteryTypeCode = matchBatteryType(summaryBatteryType.trim());
    if (summaryBatteryTypeCode === "") return [];
    if (formBatteryType !== summaryBatteryTypeCode) {
      return [{
        ok: false,
        result: `电池类型不一致, 系统上为${batteryTypeMap[formBatteryType]}, 概要上为${summaryBatteryType}`
      }];
    }
    return [];
  }

  // src/summary/checkCapacity.ts
  function checkCapacity(formCapacity, summaryCapacity) {
    let summaryCapacityNumber = matchCapacity(summaryCapacity.trim());
    if (summaryCapacityNumber !== formCapacity) {
      return [{
        ok: false,
        result: `容量不一致, 系统上为${formCapacity}, 概要上为${summaryCapacityNumber}`
      }];
    }
    return [];
  }

  // src/summary/checkIssueDate.ts
  function checkIssueDate(issue_date, projectNo) {
    const inputDate = new Date(issue_date);
    const today = /* @__PURE__ */ new Date();
    today.setHours(23, 59, 59, 999);
    const diffTime = inputDate.getTime() - today.getTime();
    const projectDate = parseProjectData(projectNo);
    const diffProjectTime = inputDate.getTime() - projectDate.getTime();
    let result = [];
    if (diffProjectTime < 0) {
      result.push({
        ok: false,
        result: "签发日期早于项目编号日期"
      });
    }
    if (diffTime > 0) {
      result.push({
        ok: false,
        result: "签发日期晚于今天"
      });
    }
    return result;
  }
  function parseProjectData(projectNo) {
    const year = projectNo.slice(5, 9);
    const month = projectNo.slice(9, 11);
    const day = projectNo.slice(11, 13);
    let date = `${year}-${month}-${day}`;
    return new Date(date);
  }

  // src/summary/checkLiContent.ts
  function checkLiContent(formLiContent, summaryLiContent) {
    let summaryLiContentNumber = matchBatteryWeight("为" + summaryLiContent.trim());
    if (isNaN(summaryLiContentNumber) || isNaN(formLiContent)) return [];
    if (summaryLiContentNumber !== formLiContent) {
      return [{
        ok: false,
        result: `锂含量不一致, 系统上为${formLiContent}g, 概要上为${summaryLiContentNumber}g`
      }];
    }
    return [];
  }

  // src/summary/checkMass.ts
  function checkMass(formMass, summaryMass) {
    let summaryMassNumber = matchBatteryWeight("为" + summaryMass.trim());
    if (summaryMassNumber !== formMass) {
      return [{
        ok: false,
        result: `净重不一致, 系统上为${formMass}g, 概要上为${summaryMassNumber}g`
      }];
    }
    return [];
  }

  // src/summary/checkModel.ts
  function checkModel(formModel, summaryModel) {
    if (formModel.trim() !== summaryModel.trim()) {
      return [{
        ok: false,
        result: `型号不一致, 系统上为${formModel}, 概要上为${summaryModel}`
      }];
    }
    return [];
  }

  // src/summary/checkName.ts
  function checkName(packageType, formEName, formCName, model, summaryCName) {
    formCName = formCName.trim();
    formEName = formEName.trim();
    summaryCName = summaryCName.trim();
    model = model.trim();
    let formCNameText = "";
    let formENameText = "";
    switch (packageType) {
      case "0":
      case "1":
        formCNameText = formCName.split(model)[0];
        formENameText = formEName.split(model)[0];
        break;
      case "2":
        let indexKeyWord = formCName.indexOf("内置");
        let indexKeyEWord = formEName.indexOf("Containing");
        let indexModel = formCName.indexOf(model);
        let indexEModel = formEName.indexOf(model);
        if (indexKeyWord < indexModel) {
          formCNameText = formCName.substring(indexKeyWord + 2, indexModel);
          formENameText = formEName.substring(indexKeyEWord + 10, indexEModel);
        } else {
          formCNameText = formCName.substring(0, indexModel);
          formENameText = formEName.substring(0, indexModel);
        }
        break;
    }
    formCNameText = formCNameText.trim();
    formENameText = formENameText.trim();
    let result = [];
    if (!summaryCName.includes(formCNameText)) {
      result.push({
        ok: false,
        result: `中文电池名称不一致, 系统上为${formCNameText}, 概要上为${summaryCName}`
      });
    }
    if (!summaryCName.includes(formENameText)) {
      result.push({
        ok: false,
        result: `英文电池名称不一致, 系统上为${formENameText}, 概要上为${summaryCName}`
      });
    }
    return result;
  }

  // src/shared/appearence/color.ts
  var colorMap = [
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "007ec31bd03b4b56aeeea767b693a493",
      "type": "physiochemical-color",
      "chineseName": "青色",
      "englishName": "cyan",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "00a6ff1a9f0144c3adf0221a1a58d056",
      "type": "physiochemical-color",
      "chineseName": "红色和绿色",
      "englishName": "red and green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "00f917881e0a4dd79540a26bb7bef206",
      "type": "physiochemical-color",
      "chineseName": "蓝色至橄榄绿色",
      "englishName": "blue to olive green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "00fd856ea75f4c159656823458658d10",
      "type": "physiochemical-color",
      "chineseName": "黄绿色至棕色",
      "englishName": "yellowish green to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "012c9e6d150146cda2c014c9b6bb131e",
      "type": "physiochemical-color",
      "chineseName": "黑黄色",
      "englishName": "black-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:08",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "013a280a502a40d3a10930ae38e0ef11",
      "type": "physiochemical-color",
      "chineseName": "茶色",
      "englishName": "brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "01cada83f9ff45069b566da47a89e9d1",
      "type": "physiochemical-color",
      "chineseName": "淡棕黄色",
      "englishName": "pale brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "01f2e4af0a044cd8828720b282f2af78",
      "type": "physiochemical-color",
      "chineseName": "绿色至深紫红色",
      "englishName": "green to deep purple-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0297592734f5434eaa9955b85383612b",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至红棕色",
      "englishName": "light yellow to red-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "051ffff9747c45ac9e7c9ccccbf5bb12",
      "type": "physiochemical-color",
      "chineseName": "黄色至黄绿色",
      "englishName": "yellow to chartreuse",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "05208a07d1e44d2c88d60313683571ac",
      "type": "physiochemical-color",
      "chineseName": "黄或黄褐色",
      "englishName": "yellow or yellowish-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "05bffddad3ca45859111d1efa2fcfe84",
      "type": "physiochemical-color",
      "chineseName": "黄色至黄褐色",
      "englishName": "yellow to khaki",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0705935d15ef41aa9a66e252cb76fdc6",
      "type": "physiochemical-color",
      "chineseName": "银红/银灰/银黑/黑",
      "englishName": "silver-red/silver-grey/silver-black/black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:11:12",
      "id": "078d86ec759c4cf39597417131f5df60",
      "type": "physiochemical-color",
      "chineseName": "各种颜色",
      "englishName": "multi-color",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "07fed728e15b4442bfc787b3267692ff",
      "type": "physiochemical-color",
      "chineseName": "白绿杂色",
      "englishName": "white/green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "08f8d82fd45e4d27847f4844b81065a7",
      "type": "physiochemical-color",
      "chineseName": "淡青色",
      "englishName": "light cyan",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "09cda4f254da4d3c997eb3cc38d84bfa",
      "type": "physiochemical-color",
      "chineseName": "白色和黄棕色",
      "englishName": "white and yellow-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0ab6fc22a048434399c48f04ed6ea5e0",
      "type": "physiochemical-color",
      "chineseName": "白色至灰黄色",
      "englishName": "white to gray-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0b2250c4ef6343cca3c8525264716a5c",
      "type": "physiochemical-color",
      "chineseName": "黄色和红色",
      "englishName": "yellow and red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0c999d9ce2b846ad83bb05fa161724b7",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至浅黄绿色",
      "englishName": "slight yellow to  pale yellow-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0d8ac7ed84dc4b689db123e50061ed93",
      "type": "physiochemical-color",
      "chineseName": "淡黄绿色",
      "englishName": "pale yellow-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0e26ec8bf6314a58a26c4a7230c4ed0d",
      "type": "physiochemical-color",
      "chineseName": "淡黄褐色至紫色",
      "englishName": "light yellow-brown to purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:31:57",
      "id": "0ee5688c11f54c54afe98bd3f9a81e27",
      "type": "physiochemical-color",
      "chineseName": "桔红色",
      "englishName": "orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0f9222c26a4a4be7b6cb66cd4a40860f",
      "type": "physiochemical-color",
      "chineseName": "银灰杂色",
      "englishName": "silver-gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0f95fae3283249089ee264c73a6a3e94",
      "type": "physiochemical-color",
      "chineseName": "珊瑚红",
      "englishName": "coral red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "0ffa59bd8dcf4e49a2b11750cc9042bd",
      "type": "physiochemical-color",
      "chineseName": "白色至浅棕黄色",
      "englishName": "white to light brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "100",
      "type": "physiochemical-color",
      "chineseName": "白色",
      "englishName": "white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "101",
      "type": "physiochemical-color",
      "chineseName": "类白色",
      "englishName": "off-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "102",
      "type": "physiochemical-color",
      "chineseName": "黄色",
      "englishName": "yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "103",
      "type": "physiochemical-color",
      "chineseName": "浅黄色",
      "englishName": "pale yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "104",
      "type": "physiochemical-color",
      "chineseName": "无色",
      "englishName": "colorless",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "105",
      "type": "physiochemical-color",
      "chineseName": "灰色",
      "englishName": "gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "106",
      "type": "physiochemical-color",
      "chineseName": "浅灰色",
      "englishName": "pale grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "107",
      "type": "physiochemical-color",
      "chineseName": "深灰色",
      "englishName": "dark grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "108",
      "type": "physiochemical-color",
      "chineseName": "黑色",
      "englishName": "black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "109",
      "type": "physiochemical-color",
      "chineseName": "红色",
      "englishName": "red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:36:07",
      "id": "10c0ccc5b7c0442f9ee4a0e868e7776e",
      "type": "physiochemical-color",
      "chineseName": "蓝色、黑色、银蓝杂色、银黑杂色或银红杂色",
      "englishName": "blue,black,silvery and blue,or silvery and black or silver and red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "110",
      "type": "physiochemical-color",
      "chineseName": "深红色",
      "englishName": "dark red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "110d827ba0f048f8a3a593be33a6bd0d",
      "type": "physiochemical-color",
      "chineseName": "无色至深紫色",
      "englishName": "colorless to dark purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "111",
      "type": "physiochemical-color",
      "chineseName": "绿色",
      "englishName": "green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "112",
      "type": "physiochemical-color",
      "chineseName": "深绿色",
      "englishName": "dark green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "113",
      "type": "physiochemical-color",
      "chineseName": "黄绿色",
      "englishName": "yellow-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "114",
      "type": "physiochemical-color",
      "chineseName": "棕色",
      "englishName": "brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "115",
      "type": "physiochemical-color",
      "chineseName": "褐色",
      "englishName": "brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:38",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "116",
      "type": "physiochemical-color",
      "chineseName": "紫色",
      "englishName": "purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1179e27163d24bf9b4db2da12b4f097b",
      "type": "physiochemical-color",
      "chineseName": "白色和褐色",
      "englishName": "white and tan",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "11e93f9dea184fdfa994252f0cf7ef4a",
      "type": "physiochemical-color",
      "chineseName": "蓝白杂色",
      "englishName": "blue-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1216e96c279846c0b8d5f7f69773a526",
      "type": "physiochemical-color",
      "chineseName": "无色或淡黄色",
      "englishName": "colorless or light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "13cc425a45ba4a22ab09319266431f6b",
      "type": "physiochemical-color",
      "chineseName": "棕绿色",
      "englishName": "brown-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "140fa6be6bb545c4af51a47ca0fde093",
      "type": "physiochemical-color",
      "chineseName": "白色或浅黄色",
      "englishName": "white or light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1455c289fe414f489799aaedd2669537",
      "type": "physiochemical-color",
      "chineseName": "淡绿色",
      "englishName": "light-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "14a32b83e7e14557b178b731bd1507d7",
      "type": "physiochemical-color",
      "chineseName": "淡黄棕色",
      "englishName": "light yellowish-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:08",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "152630dcf3a845a08edec1ebb0a10d64",
      "type": "physiochemical-color",
      "chineseName": "米色",
      "englishName": "beige",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "16b096768ff84fe7af2531561374e3ae",
      "type": "physiochemical-color",
      "chineseName": "浅棕绿色",
      "englishName": "light brown-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "16ed4c4795144d219b88f9e0211cbe84",
      "type": "physiochemical-color",
      "chineseName": "古铜色",
      "englishName": "bronze",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1856d2dd3623444c93101e39dc84ac59",
      "type": "physiochemical-color",
      "chineseName": "多种颜色",
      "englishName": "multi-colors",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "18c42a85f2cf40b98285f8d7661fd57b",
      "type": "physiochemical-color",
      "chineseName": "一面黑色一面灰色",
      "englishName": "black and grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1939bc7c91f84b59b20a6003097c7694",
      "type": "physiochemical-color",
      "chineseName": "淡蓝色",
      "englishName": "light blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:08",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "19c1c34eeba34faa94160cb54c27d288",
      "type": "physiochemical-color",
      "chineseName": "类白色至浅棕色",
      "englishName": "off-white to light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "19d5bc64a0ac4442b4c3332bba2f3fef",
      "type": "physiochemical-color",
      "chineseName": "无色至褐色",
      "englishName": "colorless to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1a1bcd15b4e24a25ad9090c80c1a5665",
      "type": "physiochemical-color",
      "chineseName": "浅橘色",
      "englishName": "pale orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1b5d6364e3f440ee9dec27b4a6fc7e5f",
      "type": "physiochemical-color",
      "chineseName": "绿白色",
      "englishName": "greenish white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1b72419e92f04611a337986a0aefc0ad",
      "type": "physiochemical-color",
      "chineseName": "类白色至灰绿色",
      "englishName": "off-white to greyish-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1bc17edcbba6414e94cecd09fc34caba",
      "type": "physiochemical-color",
      "chineseName": "褐色至暗红色",
      "englishName": "brown to dull red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1bf25f1b0696490f8129c0c7f058206c",
      "type": "physiochemical-color",
      "chineseName": "无色至乳白色",
      "englishName": "colorless to milky",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1c85c4fc1688419985ca91c342c68623",
      "type": "physiochemical-color",
      "chineseName": "暗红或橙黄色",
      "englishName": "dark red or orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1d130d05aa994267b1769d329a11d1ad",
      "type": "physiochemical-color",
      "chineseName": "灰色至黑色",
      "englishName": "grey to black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1d3f17b5aa9546cf931598a6ccb0b42b",
      "type": "physiochemical-color",
      "chineseName": "香槟色",
      "englishName": "champagne color",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1d6cd7c828d24bc288d0bc466227ff7b",
      "type": "physiochemical-color",
      "chineseName": "棕褐色至棕红色",
      "englishName": "brown to brown-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1e116414779647b4b82787b899e9c4c0",
      "type": "physiochemical-color",
      "chineseName": "蓝黑至黑色",
      "englishName": "bluish-black to black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:04",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1ef29ad7b0c3468bbb763c64abf2b849",
      "type": "physiochemical-color",
      "chineseName": "深褐色",
      "englishName": "dark brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1f1aa2275ed84234ace98a53b3b63f5a",
      "type": "physiochemical-color",
      "chineseName": "白色至粉色",
      "englishName": "white to pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1f23620529a24d4ebc945a5880e73023",
      "type": "physiochemical-color",
      "chineseName": "浅黄棕色",
      "englishName": "light yellowish-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "1fa223cb372243f5b353c602ed2ea8c1",
      "type": "physiochemical-color",
      "chineseName": "蓝紫色",
      "englishName": "bluish violet",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "20a134b2ef6c433689ea4dc6e30b079d",
      "type": "physiochemical-color",
      "chineseName": "青黑色",
      "englishName": "cyan-black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "20ecd06047d44825adc673d51d52a886",
      "type": "physiochemical-color",
      "chineseName": "深草绿色",
      "englishName": "deep grass-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "22228342927a46e498453119205aa4d6",
      "type": "physiochemical-color",
      "chineseName": "灰色至棕色",
      "englishName": "grey to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "24b7ee1c17524cf2863a70bc58e23877",
      "type": "physiochemical-color",
      "chineseName": "类白色固体",
      "englishName": "off-white solid",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:08",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "25bac5353277490da90e7deba960c5ea",
      "type": "physiochemical-color",
      "chineseName": "桔红",
      "englishName": "orange-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "26d82793d49f44beb2560a97458a06b0",
      "type": "physiochemical-color",
      "chineseName": "红灰杂色",
      "englishName": "red and grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "27e1156bc0fd411793123a5cd4a86791",
      "type": "physiochemical-color",
      "chineseName": "微绿色",
      "englishName": "light green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "28fcc855d7fc493abe88b657d0695167",
      "type": "physiochemical-color",
      "chineseName": "蓝色/紫色",
      "englishName": "blue/purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "29105fba0fe343aaaa903c4caad35280",
      "type": "physiochemical-color",
      "chineseName": "黄色到橙色",
      "englishName": "yellow to orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "294c80cfafa248d8bdf561ba3c672fdb",
      "type": "physiochemical-color",
      "chineseName": "橙黑杂色",
      "englishName": "orange and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "2a5c2eb6269547f9af3765e09ae0a25e",
      "type": "physiochemical-color",
      "chineseName": "淡橙白杂色",
      "englishName": "light orange-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:06",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:43:32",
      "id": "2c1df2d91ebb4a3586af0e2f2d5416fd",
      "type": "physiochemical-color",
      "chineseName": "黑银",
      "englishName": "black silver",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000f",
      "createdDate": "2018-03-09 16:11:27",
      "modifiedBy": "40287f81563efffb01563f0682e7000f",
      "modifiedDate": "2018-03-09 16:11:27",
      "id": "2c91808261fee087016209d091f27b66",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至棕绿色",
      "englishName": "light yellow to brown-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2019-02-14 09:52:09",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2019-02-14 09:52:09",
      "id": "2c91808267e0a9ed0168e9b43a6400de",
      "type": "physiochemical-color",
      "chineseName": "白色至淡绿色",
      "englishName": "white to light green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2019-02-15 10:05:58",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2019-02-15 10:07:06",
      "id": "2c91808267e0a9ed0168eee73a4d3469",
      "type": "physiochemical-color",
      "chineseName": "黄色至棕黄色",
      "englishName": "yellow to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2019-03-19 11:58:32",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2019-03-19 11:58:32",
      "id": "2c91808267e0a9ed01699419cb687765",
      "type": "physiochemical-color",
      "chineseName": "无色至浅棕色",
      "englishName": "colorless to light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2019-06-28 09:18:46",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2019-06-28 09:18:46",
      "id": "2c9180826b2289d8016b9ba9cfff0328",
      "type": "physiochemical-color",
      "chineseName": "黄绿色至棕黄色",
      "englishName": "yellow and green to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-03-10 12:00:38",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2024-10-11 15:59:05",
      "id": "2c9180827e13ece4017f71fc59b52b41",
      "type": "physiochemical-color",
      "chineseName": "银色和蓝色",
      "englishName": "silver and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-06-20 20:02:37",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-06-20 20:02:37",
      "id": "2c918082817cb459018180fe48be6a30",
      "type": "physiochemical-color",
      "chineseName": "绿色和黑色",
      "englishName": "green and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-06-23 12:10:35",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-06-23 12:10:35",
      "id": "2c918082817cb45901818ec133ba5e5c",
      "type": "physiochemical-color",
      "chineseName": "蓝色和红色",
      "englishName": "blue and red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-09-28 14:34:44",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-09-28 14:34:44",
      "id": "2c918082827e00cf018382ce06eb3dfe",
      "type": "physiochemical-color",
      "chineseName": "蓝色和灰色",
      "englishName": "blue and grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-12-03 10:44:53",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-12-03 10:44:53",
      "id": "2c91808284cdd1d10184d5df527677e6",
      "type": "physiochemical-color",
      "chineseName": "灰黑杂色",
      "englishName": "grey and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-12-09 14:29:03",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-12-09 14:29:03",
      "id": "2c91808284e2aeb70184f592b36b723d",
      "type": "physiochemical-color",
      "chineseName": "红色和银色",
      "englishName": "red and silver",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-02-20 15:30:43",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-02-20 15:30:43",
      "id": "2c918082862713e001866dbb65006fe9",
      "type": "physiochemical-color",
      "chineseName": "橙绿杂色",
      "englishName": "orange and green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-03-03 16:30:39",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-03-03 16:30:39",
      "id": "2c918082862713e00186a69838ca4c02",
      "type": "physiochemical-color",
      "chineseName": "白色和紫色",
      "englishName": "white and purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-03-03 16:31:19",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-03-03 16:31:19",
      "id": "2c918082862713e00186a698d4a14c34",
      "type": "physiochemical-color",
      "chineseName": "红蓝杂色",
      "englishName": "red and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-03-21 19:23:52",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-03-21 19:23:52",
      "id": "2c918082862713e0018703e946581b53",
      "type": "physiochemical-color",
      "chineseName": "黑色和黄色",
      "englishName": "black and yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2024-01-12 14:11:51",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2024-01-12 14:11:51",
      "id": "2c9180838ce3cf21018cfc4c57c27f6d",
      "type": "physiochemical-color",
      "chineseName": "绿色和粉色",
      "englishName": "green and pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2019-03-19 12:02:45",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2019-03-19 12:02:45",
      "id": "2c91808467e0a8cd0169941da5394926",
      "type": "physiochemical-color",
      "chineseName": "类白色至微黄色",
      "englishName": "off-white to pale yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2019-03-20 14:36:11",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2019-03-20 14:36:11",
      "id": "2c91808467e0a8cd016999d07b001dd0",
      "type": "physiochemical-color",
      "chineseName": "乳白色至淡黄色",
      "englishName": "milky to pale yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2021-01-12 15:14:38",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2021-01-12 15:14:38",
      "id": "2c91808476a9d70d0176f5724f370e89",
      "type": "physiochemical-color",
      "chineseName": "灰色或黑色",
      "englishName": "gray or black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2021-07-19 11:15:49",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2021-07-19 11:15:49",
      "id": "2c9180847a9b60f6017abcc338ed28c0",
      "type": "physiochemical-color",
      "chineseName": "银色/紫色",
      "englishName": "silver/purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-03-08 11:06:12",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-03-08 11:06:12",
      "id": "2c9180847e13ebc7017f677dcc2e4ade",
      "type": "physiochemical-color",
      "chineseName": "绿色和银色",
      "englishName": "green and grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-04-28 10:28:02",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-04-28 10:28:02",
      "id": "2c9180847fc1853201806dff2d7a51b7",
      "type": "physiochemical-color",
      "chineseName": "银色和金色",
      "englishName": "silver and golden",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-04-28 10:28:21",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-04-28 10:28:21",
      "id": "2c9180847fc1853201806dff791151cd",
      "type": "physiochemical-color",
      "chineseName": "银色和黄色",
      "englishName": "silver and yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-06-08 12:20:38",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-06-08 12:20:38",
      "id": "2c91808481412de90181418b00b711ac",
      "type": "physiochemical-color",
      "chineseName": "粉色和蓝色",
      "englishName": "pink and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-06-28 16:08:03",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-06-28 16:08:03",
      "id": "2c918084817cb3360181a95a673d56d4",
      "type": "physiochemical-color",
      "chineseName": "蓝色和橙色",
      "englishName": "blue and orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-08-19 10:33:15",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-08-19 10:34:34",
      "id": "2c918084827dffaf0182b3f2930e24b4",
      "type": "physiochemical-color",
      "chineseName": "粉色和紫色",
      "englishName": "pink and purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2022-09-28 14:34:24",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2022-09-28 14:34:24",
      "id": "2c918084827dffaf018382cdb7a14ff0",
      "type": "physiochemical-color",
      "chineseName": "红色和灰色",
      "englishName": "red and grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-01-01 09:43:38",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-01-01 09:43:38",
      "id": "2c91808484e2b72301856affa8d70e13",
      "type": "physiochemical-color",
      "chineseName": "灰白杂色",
      "englishName": "grey/white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-02-15 10:38:09",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-02-15 10:38:09",
      "id": "2c918084862712bf018652efbef27ff7",
      "type": "physiochemical-color",
      "chineseName": "蓝黑杂色",
      "englishName": "blue/black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-02-22 16:52:11",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-02-22 16:52:11",
      "id": "2c918084862712bf01867852b13e22f3",
      "type": "physiochemical-color",
      "chineseName": "黑色和银色",
      "englishName": "black and silver",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-11-21 15:02:16",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-11-21 15:02:16",
      "id": "2c9180848b90654b018bf0afcf4111e5",
      "type": "physiochemical-color",
      "chineseName": "杂色",
      "englishName": "multi-color",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-07-20 13:38:02",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-07-20 13:38:02",
      "id": "2c91808989553316018971ce23101136",
      "type": "physiochemical-color",
      "chineseName": "粉色和白色",
      "englishName": "pink and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "2ce34c48465e448e9bf1d3086a5feb73",
      "type": "physiochemical-color",
      "chineseName": "红黑杂色",
      "englishName": "red-black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "2e9cdc97dc584195bf3c92bd9adbc49d",
      "type": "physiochemical-color",
      "chineseName": "暗绿",
      "englishName": "dark green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "2f47bbb0f0e547489050414f0b12dc68",
      "type": "physiochemical-color",
      "chineseName": "类白色至浅棕黄色",
      "englishName": "off-white to light brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "2f4f503cfe024d4698514911c4fc6d8a",
      "type": "physiochemical-color",
      "chineseName": "无色至浅绿色",
      "englishName": "colorless to light green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "2f5ed373d69c4772ad2065e82276605c",
      "type": "physiochemical-color",
      "chineseName": "白色至微黄色",
      "englishName": "white to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "310e8c0df1584e58a7c0d82e22e9ff21",
      "type": "physiochemical-color",
      "chineseName": "白色和少量绿色",
      "englishName": "white and a little green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3210821dde844cdd90f77323d4c8087a",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至灰色",
      "englishName": "buff to gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "32526ffc26164a7b8bfb92f87837c0ad",
      "type": "physiochemical-color",
      "chineseName": "类白色至棕灰色",
      "englishName": "off-white to brownish grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "339f3bc7171c4bfc988df1a5ceddf6a7",
      "type": "physiochemical-color",
      "chineseName": "黑色-绿色",
      "englishName": "black-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "33c0d357fa2444ebbaafad607c23dff7",
      "type": "physiochemical-color",
      "chineseName": "蓝白红三色",
      "englishName": "bule/white/red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "34bdd3a03d734802a9ce322bbdc53d9b",
      "type": "physiochemical-color",
      "chineseName": "黄黑杂色",
      "englishName": "yellowish black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "352875f4d29d413eaaac0169987b7e11",
      "type": "physiochemical-color",
      "chineseName": "黑绿色",
      "englishName": "black-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "35b2b7c75e8244f79a173fc0c2288546",
      "type": "physiochemical-color",
      "chineseName": "白色至淡紫色",
      "englishName": "white to pale purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "35e6045cd6184065a438343002efbfff",
      "type": "physiochemical-color",
      "chineseName": "微红色",
      "englishName": "light red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "36c4e41b4cc24fcaa494a9603f84982e",
      "type": "physiochemical-color",
      "chineseName": "浅蓝色",
      "englishName": "light blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "37d11eea1c61497785a08ee555181d89",
      "type": "physiochemical-color",
      "chineseName": "灰黄杂色",
      "englishName": "grey and yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:45:05",
      "id": "3827d0b5c186416b86a81a172aef140a",
      "type": "physiochemical-color",
      "chineseName": "类白色至浅橙色",
      "englishName": "off-white to light orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "39adbaf32a9d4788a9a59e47daf38d48",
      "type": "physiochemical-color",
      "chineseName": "白色至橙色",
      "englishName": "white to orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "39ccf14baf7449ea9a8e0c51867c62db",
      "type": "physiochemical-color",
      "chineseName": "深棕红色",
      "englishName": "dark brown-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "39d3e93407d74d688e1b75fc8aa9c9fc",
      "type": "physiochemical-color",
      "chineseName": "金蓝杂色",
      "englishName": "golden-blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "39e3ad34daa54691b16ad08b716549b4",
      "type": "physiochemical-color",
      "chineseName": "黑金色",
      "englishName": "black and golden",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3a5a03b35c074f61a6d2996929d746f8",
      "type": "physiochemical-color",
      "chineseName": "白色和蓝色",
      "englishName": "white and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3af2f4cb51484841a0e0d17c18ab7418",
      "type": "physiochemical-color",
      "chineseName": "白色或黑色",
      "englishName": "white or black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3bb1fb8d593f45f7af98586043b47ac7",
      "type": "physiochemical-color",
      "chineseName": "无色至白色",
      "englishName": "colorless to white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3c4b3999bf5146a2978d644fc5b40868",
      "type": "physiochemical-color",
      "chineseName": "乳白色至微黄色",
      "englishName": "milky to pale-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3cc0057bd0cd4055b1a6828a38590a1b",
      "type": "physiochemical-color",
      "chineseName": "无色至浅蓝色",
      "englishName": "colorless to pale-blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3e30ea048d074a20bd74a857ad929f5c",
      "type": "physiochemical-color",
      "chineseName": "暗红色",
      "englishName": "dark red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3e60804993fb4970b421691819cd66c2",
      "type": "physiochemical-color",
      "chineseName": "浅粉色至浅棕色",
      "englishName": "light pink to light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3e72584bd1e347feb3d83d9c0a362f74",
      "type": "physiochemical-color",
      "chineseName": "紫褐色",
      "englishName": "purple brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "3fd6125cd6ea4ce9b71befe08f8d320f",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至琥珀色",
      "englishName": "light yellow to amber",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "409d12bdc62f4406a210af995da5d5c1",
      "type": "physiochemical-color",
      "chineseName": "红色和黑色",
      "englishName": "red and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "412df76332a1493ca26980362838a46c",
      "type": "physiochemical-color",
      "chineseName": "草绿色",
      "englishName": "grass-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:46:14",
      "id": "421237d8a0814a7aa6b8f795ff95159a",
      "type": "physiochemical-color",
      "chineseName": "灰白色至淡黄色",
      "englishName": "grey to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "42368218de2743b097379d3379cd27e9",
      "type": "physiochemical-color",
      "chineseName": "洋红色",
      "englishName": "magenta",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "44afb0dc5c6840c9901828027c3e50ec",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至棕灰色",
      "englishName": "light yellow to taupe",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "44fcaf18d4b64d4da7a898a7fd7c4862",
      "type": "physiochemical-color",
      "chineseName": "金蓝色",
      "englishName": "golden-blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "4567b2f0ee1442b0a449c91305382a11",
      "type": "physiochemical-color",
      "chineseName": "无色至淡棕色",
      "englishName": "colorless to light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:50:27",
      "id": "4736644fc5084275b4935d64d283bce2",
      "type": "physiochemical-color",
      "chineseName": "白色塑料袋",
      "englishName": "white plastic bag",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "476db478a8e9408bb2d6a296f676c4a5",
      "type": "physiochemical-color",
      "chineseName": "无色至橙红色",
      "englishName": "colorless to orange-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "4998322d333e4d6391d0116e8442e21f",
      "type": "physiochemical-color",
      "chineseName": "橙黄色至橙红色",
      "englishName": "orange-yellow to orange-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "49bfce58745443ad91a7bd4d4ac5e7b9",
      "type": "physiochemical-color",
      "chineseName": "银杂色",
      "englishName": "silver",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "49d09cf58f5440cfabad7ed0f14ad163",
      "type": "physiochemical-color",
      "chineseName": "无色至棕色",
      "englishName": "colorless to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "4a814d81b99942499483b9e9561c0a95",
      "type": "physiochemical-color",
      "chineseName": "无色至浅橙色",
      "englishName": "colorless to light orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:54:35",
      "id": "4aa998aecb724956aceadf67362086fb",
      "type": "physiochemical-color",
      "chineseName": "蓝绿色",
      "englishName": "bluish green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "4ac507e7293941a99350341bc2b2d47f",
      "type": "physiochemical-color",
      "chineseName": "白色到浅棕色",
      "englishName": "white to light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "4b568dc6231b407a88d08d3abccef119",
      "type": "physiochemical-color",
      "chineseName": "灰色和黑色",
      "englishName": "grey and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "4cc22bc11e9f464d86ae47dc39e9d570",
      "type": "physiochemical-color",
      "chineseName": "浅棕黄色",
      "englishName": "light brown yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "4e4a23c8499a494c85044e1fe9f7f73a",
      "type": "physiochemical-color",
      "chineseName": "灰绿色",
      "englishName": "celandine green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "519f2eba90514f75bafc2525b3782780",
      "type": "physiochemical-color",
      "chineseName": "黑杂色",
      "englishName": "black mottled",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "51dc97e9064d459f95894a018325c366",
      "type": "physiochemical-color",
      "chineseName": "银白色",
      "englishName": "silver-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "51ff865cfc404995afe8d17627154e40",
      "type": "physiochemical-color",
      "chineseName": "蓝、银、白三色",
      "englishName": "blue,silvery and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:57:22",
      "id": "521ac9478015462c9c0b9b9155568b03",
      "type": "physiochemical-color",
      "chineseName": "浅琥珀色",
      "englishName": "light amber",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "525084b293984391a19a31a0bf2fd9d0",
      "type": "physiochemical-color",
      "chineseName": "淡红色至浅褐色",
      "englishName": "light red to beige",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "53760ba0c2dd449facb9907ceb71d864",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至棕黄色",
      "englishName": "light yellow to brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "53a6fe86af2e463ca7973cc274156b1f",
      "type": "physiochemical-color",
      "chineseName": "浅褐色",
      "englishName": "light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "540431aec65c47b5be618b86fc2a50ea",
      "type": "physiochemical-color",
      "chineseName": "银黄杂色",
      "englishName": "silvery and yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "54afd379c5504d1c9a3531e0babfd6b4",
      "type": "physiochemical-color",
      "chineseName": "微红褐色",
      "englishName": "pale red-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "54e78175eba446c599c17f337af2c9f4",
      "type": "physiochemical-color",
      "chineseName": "黑白杂色",
      "englishName": "black and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "55a0a8d30bcb4ca792ca770d5ad2a7e4",
      "type": "physiochemical-color",
      "chineseName": "橙红色",
      "englishName": "orange-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "56ef99b157c34975a6db026e6cbffb95",
      "type": "physiochemical-color",
      "chineseName": "淡棕色",
      "englishName": "light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "584a29ec63d94c578b7296bdc040b2e4",
      "type": "physiochemical-color",
      "chineseName": "灰 黄 白",
      "englishName": "grey yellow and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5901dbda3299468c984a0b06eb3dd8b8",
      "type": "physiochemical-color",
      "chineseName": "类白色和淡黄色",
      "englishName": "off-white and light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "59927f7d57204d86b75db52c2184322d",
      "type": "physiochemical-color",
      "chineseName": "蓝灰色",
      "englishName": "blue-gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5a3f3c19c7d14c8eb45acf7e0d768920",
      "type": "physiochemical-color",
      "chineseName": "灰蓝色",
      "englishName": "grayish-blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5b1b5a40f0334537ab27928e7ae204b6",
      "type": "physiochemical-color",
      "chineseName": "类白色或浅粉色",
      "englishName": "off-white or light pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5b690cb9d9a94c4e8a87fae43f607861",
      "type": "physiochemical-color",
      "chineseName": "暗红色至紫色",
      "englishName": "dark red to purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5cc608da202a424dbb7a7111c4fd84ba",
      "type": "physiochemical-color",
      "chineseName": "银黑色",
      "englishName": "silver-black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:04",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5d20f37a3bda4dcd8a7c89e4116675d9",
      "type": "physiochemical-color",
      "chineseName": "无色至淡黄色",
      "englishName": "colorless to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5d434e74a10c4de99e2606ef1d7b57d8",
      "type": "physiochemical-color",
      "chineseName": "微黄色至棕黑色",
      "englishName": "light yellow to brown-black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5d8a1c65337a4cbc90ae38e64920f342",
      "type": "physiochemical-color",
      "chineseName": "无色至琥珀色",
      "englishName": "colorless to amber",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5e2872e6bc0940f99ec6ee0f1eb505ad",
      "type": "physiochemical-color",
      "chineseName": "一面黑色一面蓝色",
      "englishName": "black and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5e7af76831294ec0a4ea76598ebd7f68",
      "type": "physiochemical-color",
      "chineseName": "金色",
      "englishName": "gold",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "5fbfa9e07d114ee4a8df547c29b5266b",
      "type": "physiochemical-color",
      "chineseName": "烟灰色",
      "englishName": "smoky gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "606f7c19850c4dfc9e43bc38890592d0",
      "type": "physiochemical-color",
      "chineseName": "蓝色，黑色或银蓝杂色",
      "englishName": "blue,black or silvery and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6182b0ee0e0f403fbd9d14e521378ded",
      "type": "physiochemical-color",
      "chineseName": "黑色和白色",
      "englishName": "black and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "61ecd70c88fe44c7b054a2b01876403c",
      "type": "physiochemical-color",
      "chineseName": "浅棕色至蓝灰色",
      "englishName": "light brown to blue-gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:06",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "626b4e91bda34e7487c1a378e1388d4e",
      "type": "physiochemical-color",
      "chineseName": "琥珀色",
      "englishName": "amber",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "64e08ffcfe6e4c9d9e3431ea2ce231de",
      "type": "physiochemical-color",
      "chineseName": "乳黄色",
      "englishName": "milky-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6718c7a1ba3a4a91b9d84793103f33dd",
      "type": "physiochemical-color",
      "chineseName": "蓝黄杂色",
      "englishName": "blue-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "689f8b5695f8456f880bfb19af23fb88",
      "type": "physiochemical-color",
      "chineseName": "金变绿",
      "englishName": "gold/green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6b862901b8d34f248886593ea77bcd19",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至棕红色",
      "englishName": "light yellow to brown-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:04",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6b9b63a0cf894003a42ae36508f9f8e0",
      "type": "physiochemical-color",
      "chineseName": "淡紫色",
      "englishName": "pale purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6bffe127cfad4b07a287a895183d796f",
      "type": "physiochemical-color",
      "chineseName": "蓝红色",
      "englishName": "bluish-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6c34e486248f433e8451be015345dca4",
      "type": "physiochemical-color",
      "chineseName": "深蓝色",
      "englishName": "dark blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6c884d0acf794ccb8ce9eb6fd388fab0",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至棕色",
      "englishName": "light yellow to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:58:36",
      "id": "6dff253d7a1344379e7072020aed8fdd",
      "type": "physiochemical-color",
      "chineseName": "白色和橙色",
      "englishName": "white and orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6e9642718dd9482caf7ce0aa76ad7267",
      "type": "physiochemical-color",
      "chineseName": "类白色或灰色",
      "englishName": "off-white or grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6efde1485cfe4399b3c5cd918cd9c130",
      "type": "physiochemical-color",
      "chineseName": "桔黄",
      "englishName": "orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "6fbc56b4ee5643e781b2b06dc8dca2fd",
      "type": "physiochemical-color",
      "chineseName": "类白色至红色",
      "englishName": "off-white to red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "70de31f577aa4ce99c6d8c6911816afe",
      "type": "physiochemical-color",
      "chineseName": "白色或灰色",
      "englishName": "white or grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "7142d738aa884c7fae6fa828fed62fd6",
      "type": "physiochemical-color",
      "chineseName": "黑色或银蓝杂色",
      "englishName": "bule,black or silvery and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "71a393f839604cd383ad68e0cfbbf4fc",
      "type": "physiochemical-color",
      "chineseName": "黄色至橙色",
      "englishName": "yellow to orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "723008fe299647dd8a7077c46dc2ec96",
      "type": "physiochemical-color",
      "chineseName": "橙白杂色",
      "englishName": "orange and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "730546ee25e44f4b98d57b1a3c1f16cc",
      "type": "physiochemical-color",
      "chineseName": "绿色和白色",
      "englishName": "green and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "74229b84142b47bfbb928c5aa40b352e",
      "type": "physiochemical-color",
      "chineseName": "绿变蓝",
      "englishName": "green/blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "74abe7d3d15d401bb7080a799a1de474",
      "type": "physiochemical-color",
      "chineseName": "红、黄色",
      "englishName": "red and yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "752c3c6f69be4e9fbaa416fcf076b5a9",
      "type": "physiochemical-color",
      "chineseName": "橙色至粉红色",
      "englishName": "orange to pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "75cbd3ac233b4545b0a45ae2baa312f9",
      "type": "physiochemical-color",
      "chineseName": "棕蓝色",
      "englishName": "brown-blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "762872e0f9d946609fb2ec02c5239820",
      "type": "physiochemical-color",
      "chineseName": "红色和白色",
      "englishName": "red and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "76cfc2dd27b14c6eb00a977e942a6f95",
      "type": "physiochemical-color",
      "chineseName": "黑紫色",
      "englishName": "blackened purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "76fd17cebe6f472d85d123fb49b4d329",
      "type": "physiochemical-color",
      "chineseName": "深紫色",
      "englishName": "dark purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "77520e63749c4d4ebc52734f57799a76",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至黄色",
      "englishName": "light yellow to yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "777c6a5673384834984ae5e25e161ac3",
      "type": "physiochemical-color",
      "chineseName": "灰色或类白色",
      "englishName": "gray or off-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 09:59:57",
      "id": "77fd56fec6ac482eb631d1871a88e01b",
      "type": "physiochemical-color",
      "chineseName": "深桔黄色",
      "englishName": "deep orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "78854356b1384fc38f06ba471cded17e",
      "type": "physiochemical-color",
      "chineseName": "银白杂色",
      "englishName": "silver-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "78bdbfc2660840408dccd60da409a48c",
      "type": "physiochemical-color",
      "chineseName": "浅棕色至红褐色",
      "englishName": "light brown to red-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "78c6619fdfba45d2920e9f9081a5a9b9",
      "type": "physiochemical-color",
      "chineseName": "黄色至橙红色",
      "englishName": "yellow to orange-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "796a0496f72c4886b9e830c24b381e8c",
      "type": "physiochemical-color",
      "chineseName": "乳酪色",
      "englishName": "creamcolored",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "7ab0420926c145b396af391c98921bdd",
      "type": "physiochemical-color",
      "chineseName": "米色至淡黄色",
      "englishName": "beige to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "7ae51ee8d87641af91fcc07ccf1fa4e0",
      "type": "physiochemical-color",
      "chineseName": "银蓝杂色",
      "englishName": "silvery and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "7dc7537eb9b84f52a2270d41046b3a3b",
      "type": "physiochemical-color",
      "chineseName": "白色或淡绿色",
      "englishName": "white or light green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "7dfaa89f0f834b118d0c3d3a25fcd95b",
      "type": "physiochemical-color",
      "chineseName": "浅灰色至灰色",
      "englishName": "light grey to grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "7ee87457798d40c68e1aa4ac8bfc2d51",
      "type": "physiochemical-color",
      "chineseName": "灰色,黄色,红色",
      "englishName": "gray,yellow,red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "80099f4a25924711a821f029bf4a7eea",
      "type": "physiochemical-color",
      "chineseName": "粉红色至红色",
      "englishName": "pink to red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8040f61a062142fe8b8d97424b53cfe9",
      "type": "physiochemical-color",
      "chineseName": "褐绿色",
      "englishName": "brown-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8075d657c5ee4273993e9c9ba6326bd9",
      "type": "physiochemical-color",
      "chineseName": "黄白色",
      "englishName": "light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "80f227fee33f4e66918d890c7b496ccf",
      "type": "physiochemical-color",
      "chineseName": "灰黑色至棕色",
      "englishName": "dark-gray to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "821e1b29d7ac419aad49cd8f9a8a8e9e",
      "type": "physiochemical-color",
      "chineseName": "白色或黄色",
      "englishName": "white or yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "82f99a1e02dc45bba0851d6cea64a18d",
      "type": "physiochemical-color",
      "chineseName": "奶白色",
      "englishName": "milky white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8400a79c1df847bc806bca92279d619f",
      "type": "physiochemical-color",
      "chineseName": "橙、粉、蓝、绿色",
      "englishName": "orange,pink,blue and green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8562b29c727a4178b75269e8c15d44d1",
      "type": "physiochemical-color",
      "chineseName": "深橙色",
      "englishName": "deep orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:06",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "857b5953a5ea49e1999ea63b8e21344b",
      "type": "physiochemical-color",
      "chineseName": "浅绿色",
      "englishName": "light green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "86d98cd3b1db4cdcad46640349480e78",
      "type": "physiochemical-color",
      "chineseName": "红、黑、白",
      "englishName": "red\\black\\white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "86ed7ae4a8e84bc0b4806d64d93afc97",
      "type": "physiochemical-color",
      "chineseName": "深棕色至黑色",
      "englishName": "deep brown to black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "87c9ca317f8d452cbc57b2438fc80a57",
      "type": "physiochemical-color",
      "chineseName": "无色至淡黄棕色",
      "englishName": "colorless to light yellow-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "87e96a33a155485a81ed2c47c0d7179e",
      "type": "physiochemical-color",
      "chineseName": "灰黄色",
      "englishName": "grayish yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "88d69e5a4be843a4918f14fa87e9729b",
      "type": "physiochemical-color",
      "chineseName": "类白色至浅黄棕色",
      "englishName": "off-white to light yellow-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8953de47322b4f1fbd92f36fa496fa07",
      "type": "physiochemical-color",
      "chineseName": "无色或类白色",
      "englishName": "colorless or off-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "4028dd81563eef2201563efa8e6a0006",
      "createdDate": "2016-12-02 08:36:44",
      "modifiedBy": "4028dd81563eef2201563efa8e6a0006",
      "modifiedDate": "2016-12-02 08:36:44",
      "id": "8aad92b658b8f3d60158bcf63b9100de",
      "type": "physiochemical-color",
      "chineseName": "粉红色",
      "englishName": "pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-03-09 08:59:17",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-03-09 08:59:17",
      "id": "8aad92b65aae82c3015ab093be4f0025",
      "type": "physiochemical-color",
      "chineseName": "银色",
      "englishName": "silver",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-01 15:43:52",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-01 15:43:52",
      "id": "8aad92b65b1e44b7015b28786cb20485",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至棕色",
      "englishName": "light yellow to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-01 15:44:42",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-01 15:44:42",
      "id": "8aad92b65b1e44b7015b28792c3d048e",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至黄棕色",
      "englishName": "light yellow to yellowish-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-01 15:45:15",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-01 15:45:15",
      "id": "8aad92b65b1e44b7015b2879affd0496",
      "type": "physiochemical-color",
      "chineseName": "紫红色",
      "englishName": "purple-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-01 15:45:59",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-01 15:45:59",
      "id": "8aad92b65b1e44b7015b287a5adf049d",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至黄棕色",
      "englishName": "light yellow to yellowish-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-05 15:31:38",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-05 15:31:38",
      "id": "8aad92b65b28bc16015b3d06a8cb03f9",
      "type": "physiochemical-color",
      "chineseName": "浅粉色",
      "englishName": "light pink ",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:28:39",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:28:57",
      "id": "8aad92b65b5d4b52015b60a2926701b9",
      "type": "physiochemical-color",
      "chineseName": "白色或类白色",
      "englishName": "white or off white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:47:13",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:47:13",
      "id": "8aad92b65b5d4b52015b60b393df01d6",
      "type": "physiochemical-color",
      "chineseName": "白色至类白色",
      "englishName": "white to off white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:47:43",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:47:43",
      "id": "8aad92b65b5d4b52015b60b4094a01d7",
      "type": "physiochemical-color",
      "chineseName": "无色至黄色",
      "englishName": "colourless to yellow ",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:48:31",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:48:31",
      "id": "8aad92b65b5d4b52015b60b4c3ca01d8",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至淡棕色",
      "englishName": "light yellow to pale brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:48:58",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:48:58",
      "id": "8aad92b65b5d4b52015b60b52cd201d9",
      "type": "physiochemical-color",
      "chineseName": "淡粉色",
      "englishName": "light pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:49:10",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:49:10",
      "id": "8aad92b65b5d4b52015b60b55bf401da",
      "type": "physiochemical-color",
      "chineseName": "粉色",
      "englishName": "pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:50:02",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:50:02",
      "id": "8aad92b65b5d4b52015b60b626f001db",
      "type": "physiochemical-color",
      "chineseName": "浅黄绿色",
      "englishName": "pale yellow-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:50:34",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:50:34",
      "id": "8aad92b65b5d4b52015b60b6a4b401e1",
      "type": "physiochemical-color",
      "chineseName": "黄绿色",
      "englishName": "yellowish-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:50:57",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:50:57",
      "id": "8aad92b65b5d4b52015b60b6ffc501e2",
      "type": "physiochemical-color",
      "chineseName": "紫红色",
      "englishName": "purple red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:51:31",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:51:31",
      "id": "8aad92b65b5d4b52015b60b7844501e3",
      "type": "physiochemical-color",
      "chineseName": "灰黑色",
      "englishName": "black gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:51:51",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:51:51",
      "id": "8aad92b65b5d4b52015b60b7d2ac01e4",
      "type": "physiochemical-color",
      "chineseName": "棕红色",
      "englishName": "brown-red ",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:52:15",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:52:15",
      "id": "8aad92b65b5d4b52015b60b82e8b01e5",
      "type": "physiochemical-color",
      "chineseName": "橙黄色",
      "englishName": "orange yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:53:11",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:53:11",
      "id": "8aad92b65b5d4b52015b60b9097c01e7",
      "type": "physiochemical-color",
      "chineseName": "浅橘黄色",
      "englishName": "light orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:53:45",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:53:45",
      "id": "8aad92b65b5d4b52015b60b9900e01e8",
      "type": "physiochemical-color",
      "chineseName": "无色至浅黄色",
      "englishName": "colorless to pale yellow ",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:54:07",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:54:07",
      "id": "8aad92b65b5d4b52015b60b9e29e01e9",
      "type": "physiochemical-color",
      "chineseName": "金黄色",
      "englishName": "golden",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:54:32",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:54:32",
      "id": "8aad92b65b5d4b52015b60ba449401ec",
      "type": "physiochemical-color",
      "chineseName": "浅黄色或黄色",
      "englishName": "light yellow or yellow ",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:54:48",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:54:48",
      "id": "8aad92b65b5d4b52015b60ba82f001ed",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至橘色",
      "englishName": "light yellow or orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:55:05",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:55:05",
      "id": "8aad92b65b5d4b52015b60bac81701ee",
      "type": "physiochemical-color",
      "chineseName": "深黄色",
      "englishName": "deep yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:55:31",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:55:31",
      "id": "8aad92b65b5d4b52015b60bb2ba401f1",
      "type": "physiochemical-color",
      "chineseName": "米黄色",
      "englishName": "beige-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:55:53",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:55:53",
      "id": "8aad92b65b5d4b52015b60bb83d701f8",
      "type": "physiochemical-color",
      "chineseName": "微黄色",
      "englishName": "light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:56:10",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:56:10",
      "id": "8aad92b65b5d4b52015b60bbc4d601f9",
      "type": "physiochemical-color",
      "chineseName": "黄色至棕色",
      "englishName": "yellow to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:56:28",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:56:28",
      "id": "8aad92b65b5d4b52015b60bc0ba601fa",
      "type": "physiochemical-color",
      "chineseName": "黄色至棕红色",
      "englishName": "yellow to brown-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-12 13:57:05",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-12 13:57:05",
      "id": "8aad92b65b5d4b52015b60bc99b701fb",
      "type": "physiochemical-color",
      "chineseName": "银灰色",
      "englishName": "silver gray ",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-13 16:10:38",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-13 16:10:38",
      "id": "8aad92b65b5d4b52015b665d3b2905f2",
      "type": "physiochemical-color",
      "chineseName": "蓝色",
      "englishName": "blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-17 15:22:57",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-17 15:22:57",
      "id": "8aad92b65b799975015b7acb02ab0af6",
      "type": "physiochemical-color",
      "chineseName": "类白色至浅灰色",
      "englishName": "off-white to light grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-04-18 11:31:25",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-04-18 11:31:25",
      "id": "8aad92b65b7c7b3f015b7f1d67c6071c",
      "type": "physiochemical-color",
      "chineseName": "土黄色",
      "englishName": "earth yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-18 14:00:26",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-18 14:00:26",
      "id": "8aad92b65b7c7b3f015b7fa5d31a0a44",
      "type": "physiochemical-color",
      "chineseName": "白色至浅棕色",
      "englishName": "white to light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-18 16:01:43",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-18 16:01:43",
      "id": "8aad92b65b7c7b3f015b8014e01e106f",
      "type": "physiochemical-color",
      "chineseName": "浅棕色",
      "englishName": "light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-04-18 16:09:01",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-04-18 16:09:01",
      "id": "8aad92b65b7c7b3f015b801b8d2e1095",
      "type": "physiochemical-color",
      "chineseName": "无色至浅黄色",
      "englishName": "colorless to pale yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-04-19 10:23:31",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-04-19 10:23:31",
      "id": "8aad92b65b81c37f015b84059a0e03b9",
      "type": "physiochemical-color",
      "chineseName": "白色至淡黄色",
      "englishName": "white to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-04-19 10:25:33",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-04-19 10:25:33",
      "id": "8aad92b65b81c37f015b8407736503ca",
      "type": "physiochemical-color",
      "chineseName": "类白色至淡黄色",
      "englishName": "off-white to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-21 14:44:19",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-21 14:44:19",
      "id": "8aad92b65b8be58a015b8f4116460bb6",
      "type": "physiochemical-color",
      "chineseName": "棕黄色",
      "englishName": "brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-04-24 11:59:53",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-04-24 11:59:53",
      "id": "8aad92b65b9118b2015b9e1d9cf5093b",
      "type": "physiochemical-color",
      "chineseName": "棕灰色",
      "englishName": "brownish grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-24 14:28:31",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-24 14:28:31",
      "id": "8aad92b65b9118b2015b9ea5b24f0e36",
      "type": "physiochemical-color",
      "chineseName": "银黑杂色 ",
      "englishName": "silver and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-25 13:23:35",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-25 13:23:35",
      "id": "8aad92b65ba38978015ba3909c060033",
      "type": "physiochemical-color",
      "chineseName": "棕黑色",
      "englishName": "brownish black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-25 13:23:58",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-25 13:23:58",
      "id": "8aad92b65ba38978015ba390f47f0038",
      "type": "physiochemical-color",
      "chineseName": "棕褐色",
      "englishName": "brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-25 13:24:21",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-25 13:24:21",
      "id": "8aad92b65ba38978015ba3914e9f0039",
      "type": "physiochemical-color",
      "chineseName": "蓝黑色",
      "englishName": "black blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-25 13:24:43",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-25 13:24:43",
      "id": "8aad92b65ba38978015ba391a3cb003f",
      "type": "physiochemical-color",
      "chineseName": "红棕色",
      "englishName": "umber",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-25 13:24:54",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-25 13:24:54",
      "id": "8aad92b65ba38978015ba391cff70043",
      "type": "physiochemical-color",
      "chineseName": "乳白色",
      "englishName": "milky",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-04-25 13:25:17",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-04-25 13:25:17",
      "id": "8aad92b65ba38978015ba3922aff0046",
      "type": "physiochemical-color",
      "chineseName": "淡红色",
      "englishName": "reddish",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-04-28 12:21:04",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-04-28 12:23:03",
      "id": "8aad92b65bb09cfd015bb2ca75060942",
      "type": "physiochemical-color",
      "chineseName": "淡黄色或黄色",
      "englishName": "pale yellow or yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-05-05 15:00:32",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-05 15:00:32",
      "id": "8aad92b65bd436a5015bd768f7851078",
      "type": "physiochemical-color",
      "chineseName": "白色和黑色",
      "englishName": "white and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-05-05 16:15:39",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-05 16:15:39",
      "id": "8aad92b65bd436a5015bd7adbdbb161c",
      "type": "physiochemical-color",
      "chineseName": "蓝色和白色",
      "englishName": "blue and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-05-19 11:45:52",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-05-19 11:45:52",
      "id": "8aad92b65c0eda4b015c1ecfc71e5a53",
      "type": "physiochemical-color",
      "chineseName": "淡红色至橙色",
      "englishName": "light red to orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-06-14 09:22:43",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-06-14 09:22:43",
      "id": "8aad92b65c82f125015ca43210a24047",
      "type": "physiochemical-color",
      "chineseName": "棕色至棕黄色",
      "englishName": "brown to brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-09-15 09:14:40",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-09-15 09:14:40",
      "id": "8aad92b65e3dd8f0015e831a1ad37063",
      "type": "physiochemical-color",
      "chineseName": "白色至黄色",
      "englishName": "white to yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8ae9eb09d4d64d9f9d9a211297460db3",
      "type": "physiochemical-color",
      "chineseName": "粉红色及类白色",
      "englishName": "pink and off-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:04",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8b0bc2abddcb4ba2a1b2abfeb8a17689",
      "type": "physiochemical-color",
      "chineseName": "红褐色",
      "englishName": "red-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8d5e79a3d8564f39a0ca95089de49d73",
      "type": "physiochemical-color",
      "chineseName": "类白色或黄色",
      "englishName": "off-white or yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8dba227e420f409fa703f46e8d5ae620",
      "type": "physiochemical-color",
      "chineseName": "白色至棕灰色",
      "englishName": "white to taupe",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8e125688d6924ae8be73db50c2d55795",
      "type": "physiochemical-color",
      "chineseName": "紫黑色",
      "englishName": "purple-black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8e13c36073db4bb5a20a7b0eeb3f80e1",
      "type": "physiochemical-color",
      "chineseName": "白、黄、灰杂色",
      "englishName": "white,yellow and grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8e3f360b76054fe28dcba33e88ef5b35",
      "type": "physiochemical-color",
      "chineseName": "黄褐色",
      "englishName": "olive brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "8e9573b7429248e5b986a4650b300117",
      "type": "physiochemical-color",
      "chineseName": "冰袋",
      "englishName": "ice bag",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 10:03:14",
      "id": "8eb67366051f4387a9aa41666b4baca1",
      "type": "physiochemical-color",
      "chineseName": "咖喱色",
      "englishName": "curry",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9003db2a52964a26a6c27dc10a1b9d39",
      "type": "physiochemical-color",
      "chineseName": "浅橙色",
      "englishName": "light orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "90f4c6680d5a4a558c4544df513e0c5c",
      "type": "physiochemical-color",
      "chineseName": "橙色至棕色",
      "englishName": "orange to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "90f92789f2994f9da28b70e35969b45b",
      "type": "physiochemical-color",
      "chineseName": "深粉色",
      "englishName": "dark pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9216f2b4407247909df534de3962c4ea",
      "type": "physiochemical-color",
      "chineseName": "微红色至浅黄色液体",
      "englishName": "pale red or light yellow liquid",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "92e25035e9f84a768adb26d65ae9fc1d",
      "type": "physiochemical-color",
      "chineseName": "棕黄色至橙红色",
      "englishName": "brown-yellow to orange-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9375fb79f13c48a588dbe616b895c211",
      "type": "physiochemical-color",
      "chineseName": "银/黑/金",
      "englishName": "silver/black/golden",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "94dbc09e1bf44e23b935ee0a39a1c412",
      "type": "physiochemical-color",
      "chineseName": "桔红色至桔黄色",
      "englishName": "nacarat to saffron",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "94e59c4fa48240cdb2d3ff3c24eb8280",
      "type": "physiochemical-color",
      "chineseName": "类白色至黄绿色",
      "englishName": "off-white to yellowish-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "951003f86c4f4957a0cd2c294b11c391",
      "type": "physiochemical-color",
      "chineseName": "深红棕色",
      "englishName": "dark reddish-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "956ae569398144ec82dcfa055e1ad1e7",
      "type": "physiochemical-color",
      "chineseName": "墨盒,内含黄色、黑色、淡青色、淡品红色、品红色、青色",
      "englishName": "refill cartridge containing yellow、black、light cyan、light magenta、magenta、cyan",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "98510c82fa6a453fb18b6b4afb00e525",
      "type": "physiochemical-color",
      "chineseName": "灰白色至灰色",
      "englishName": "grayish-white to gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "98597d7698174f15af93863cd6b66ddc",
      "type": "physiochemical-color",
      "chineseName": "黑色 棕色 白色",
      "englishName": "black brown and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "98680bc5ca89407bb28d6beaa0b89b9e",
      "type": "physiochemical-color",
      "chineseName": "灰白色",
      "englishName": "grayish-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9a362fb7b9a34ae2b9da9d1dcdd8b0fb",
      "type": "physiochemical-color",
      "chineseName": "白色 棕色 灰色",
      "englishName": "white palm gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9adb3fd852ab463b9d2b5be7df0cb5b5",
      "type": "physiochemical-color",
      "chineseName": "浅灰黄色",
      "englishName": "pale grayish yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9b0d8757a2714f639c28b852289124e5",
      "type": "physiochemical-color",
      "chineseName": "无色至淡红色",
      "englishName": "colorless to light red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9b14775ed31441a399d36da65303712d",
      "type": "physiochemical-color",
      "chineseName": "橙褐色",
      "englishName": "orange brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9be10e4ed2af47d89b1d9e25f54c3160",
      "type": "physiochemical-color",
      "chineseName": "褐色至深棕色",
      "englishName": "brown to dark-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9c66e7e7cae84590b6d5ea9d4de4eb46",
      "type": "physiochemical-color",
      "chineseName": "褐色至深紫色",
      "englishName": "brown to deep purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9cca507fc00049459e7cb3cb875748e7",
      "type": "physiochemical-color",
      "chineseName": "灰色至灰绿色",
      "englishName": "grey to greyish-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "9d89a1dafd5f4dd88324ef24eab16c0c",
      "type": "physiochemical-color",
      "chineseName": "灰白色至灰黄色",
      "englishName": "grayish-white to grayish-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a0e6e4e5f6b24a0fa3d1e23c13ae0d29",
      "type": "physiochemical-color",
      "chineseName": "无色或黄绿色",
      "englishName": "colorless or yellow-green liquid",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a102cf7562aa4498853efbe835646dc7",
      "type": "physiochemical-color",
      "chineseName": "无色或微黄色",
      "englishName": "colorless or light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a13aab742606477dbf2a62e5f879ad82",
      "type": "physiochemical-color",
      "chineseName": "浅棕",
      "englishName": "light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a193bd48fb324830b9484f9dddc9b697",
      "type": "physiochemical-color",
      "chineseName": "一面黄色一面蓝色",
      "englishName": "yellow and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a3741578248f4268840803cc75b88066",
      "type": "physiochemical-color",
      "chineseName": "黄色和白色",
      "englishName": "yellow and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a39d9da1d6ae49aeb20fd0b1c3a704a7",
      "type": "physiochemical-color",
      "chineseName": "深灰绿色",
      "englishName": "dark greyish-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a4527260f4f646f2a4f74ca2f64a4a66",
      "type": "physiochemical-color",
      "chineseName": "浅棕色至棕色",
      "englishName": "light brown to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a5faefed155c46f9a5c75b95c186c5ec",
      "type": "physiochemical-color",
      "chineseName": "浅红色",
      "englishName": "light red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a6c1d441058a463fb3be7d0440e86270",
      "type": "physiochemical-color",
      "chineseName": "黑白橙",
      "englishName": "black and white and orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a7666af075694c5d870b30477ab2d424",
      "type": "physiochemical-color",
      "chineseName": "白色或类黄色",
      "englishName": "white or off-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "a8ea793b5021440cb7d4dddf1810357c",
      "type": "physiochemical-color",
      "chineseName": "墨绿色",
      "englishName": "dark green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ab11e07a49be4d1a85fab36a9c069648",
      "type": "physiochemical-color",
      "chineseName": "紫铜色",
      "englishName": "coppery",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ab3811079a284931a440b5eaf74fdcd1",
      "type": "physiochemical-color",
      "chineseName": "灰褐色",
      "englishName": "grayish brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "abce559c8edc421eb2e92b9e20189071",
      "type": "physiochemical-color",
      "chineseName": "灰色和棕色",
      "englishName": "gray and brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ac518bf58e174d5785ae92c69ab25999",
      "type": "physiochemical-color",
      "chineseName": "灰色至银灰色",
      "englishName": "grey to silver grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ac620b19098d42c98061bd4101c2dd3c",
      "type": "physiochemical-color",
      "chineseName": "灰白色至棕色",
      "englishName": "grayish-white to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ad0e277a132042d393ceace102c9b024",
      "type": "physiochemical-color",
      "chineseName": "铁红色",
      "englishName": "iron-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ad2dc8260f1e42aa8b0b98ecefed3dcd",
      "type": "physiochemical-color",
      "chineseName": "银绿杂色",
      "englishName": "silver and green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ae7c522918884604950d781396f45453",
      "type": "physiochemical-color",
      "chineseName": "无色至微黄色",
      "englishName": "colorless to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b09f70b2db2a49c0a6cd1b47793a8c9f",
      "type": "physiochemical-color",
      "chineseName": "深棕色",
      "englishName": "dark-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b2f816dd6b8d40c4a9fc7755404a218d",
      "type": "physiochemical-color",
      "chineseName": "银黄白杂色",
      "englishName": "silvery and yellow and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b3028f2ab4e0442498e22e296afd1946",
      "type": "physiochemical-color",
      "chineseName": "红棕色至紫色",
      "englishName": "red-brown to purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b35d0f97c0d045e0862a7fd940be0376",
      "type": "physiochemical-color",
      "chineseName": "青铜色",
      "englishName": "bronze",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:06",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b4e298b9f37044b69934de046098e8eb",
      "type": "physiochemical-color",
      "chineseName": "浅黄褐色",
      "englishName": "light tan",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b5b500e0e2d6413ba93b50f80ae5937b",
      "type": "physiochemical-color",
      "chineseName": "淡玫瑰红色",
      "englishName": "rose-pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b6029ab6829241cdb949db60bb8c27cb",
      "type": "physiochemical-color",
      "chineseName": "绿色或紫色",
      "englishName": "green or purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b6ab9d81ad0e492e9e98eb90081bbc68",
      "type": "physiochemical-color",
      "chineseName": "银/黑/蓝/红杂色",
      "englishName": "silver/black/blue/red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b754ef0f4fd24231b71072ff772af7ac",
      "type": "physiochemical-color",
      "chineseName": "枣红色",
      "englishName": "purplish red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b7c89e4cbf5c4c108b3c22d9e1323539",
      "type": "physiochemical-color",
      "chineseName": "黑绿杂色",
      "englishName": "black and green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 10:06:40",
      "id": "b80b19d2c2fe4625ab7038f18b1b3b6a",
      "type": "physiochemical-color",
      "chineseName": "黑色, 银黑杂色，银蓝杂色或银红杂色",
      "englishName": "black,silver-black,silver-blue,silver-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b83b5fce4dbc487ca2faa01c957b90d3",
      "type": "physiochemical-color",
      "chineseName": "棕色至黑色",
      "englishName": "brown to black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "b85743b309124d53bf04e8ceb86854bb",
      "type": "physiochemical-color",
      "chineseName": "暗黄色",
      "englishName": "dark yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ba05195fa209451c84cb2a4d2f011cab",
      "type": "physiochemical-color",
      "chineseName": "彩色",
      "englishName": "chromatic",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ba0a350703ec429a976fd9809ce05a05",
      "type": "physiochemical-color",
      "chineseName": "淡黄色或白色",
      "englishName": "pale yellow or white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ba70211a4d6d43ef8a994d013e5bc58a",
      "type": "physiochemical-color",
      "chineseName": "白色至黄褐色",
      "englishName": "white to yellow-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "bb52abf50665411bba24b79c75ae95e1",
      "type": "physiochemical-color",
      "chineseName": "橙色",
      "englishName": "orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "beba4522e7c7463c85cf5b865cf087b2",
      "type": "physiochemical-color",
      "chineseName": "深红褐色",
      "englishName": "deep red-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "bf3d8e4d9bbb4c70b9d27dc9dbc7e3fc",
      "type": "physiochemical-color",
      "chineseName": "桃红色",
      "englishName": "pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:05",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "bf8944aef1aa40d98a8817ceddbd8f28",
      "type": "physiochemical-color",
      "chineseName": "淡土黄色或黄色",
      "englishName": "wheat or yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c1a362e00efc4adf8286df285226683b",
      "type": "physiochemical-color",
      "chineseName": "棕红色至紫红色",
      "englishName": "brown-red to purple-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c2d337fdb5b942728723f83795176520",
      "type": "physiochemical-color",
      "chineseName": "深琥珀色",
      "englishName": "deep amber",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c463c4fe61a842c4918d519004e652b9",
      "type": "physiochemical-color",
      "chineseName": "深紫红色",
      "englishName": "dark purple red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c5819179fe32421a8eb2cc717641f407",
      "type": "physiochemical-color",
      "chineseName": "橄榄黄",
      "englishName": "olive yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c599a11064ff4a5585fe1224d6a21d2f",
      "type": "physiochemical-color",
      "chineseName": "黄色和紫色",
      "englishName": "yellow and purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c5dd13904abf40ce9552b583be363672",
      "type": "physiochemical-color",
      "chineseName": "棕褐色至深绿色",
      "englishName": "brown to deep green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c6c935f987894225bd617738ae56f486",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至乳白色",
      "englishName": "pale yellow or milk white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c893d194113540119815893a8a554f32",
      "type": "physiochemical-color",
      "chineseName": "砖红色",
      "englishName": "brick-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:15",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c8aac16bad6e4de89f3ee5f2d8d785a8",
      "type": "physiochemical-color",
      "chineseName": "亮绿色",
      "englishName": "bright green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "c9c8256a8650498199c6a082090deebd",
      "type": "physiochemical-color",
      "chineseName": "黑灰色",
      "englishName": "dark grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ca8e322102944c1e9c57c9f2214161d6",
      "type": "physiochemical-color",
      "chineseName": "无色至棕黄色",
      "englishName": "colorless to brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "cb1ee695b6b84895bb14ccfa46120c37",
      "type": "physiochemical-color",
      "chineseName": "橘红色",
      "englishName": "orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "cb8b4d50448b4fcb8767002500709eaa",
      "type": "physiochemical-color",
      "chineseName": "白色和少量蓝色",
      "englishName": "white and a little blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "cb97be1e6aae4fdb8d27a6ada53f3a23",
      "type": "physiochemical-color",
      "chineseName": "白色和灰色",
      "englishName": "white and gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "cd2d42b2c77f4f29a81c383917c6320f",
      "type": "physiochemical-color",
      "chineseName": "黄色至红色",
      "englishName": "yellow to red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "cda2b2fe713e4426899116a44a723f26",
      "type": "physiochemical-color",
      "chineseName": "一面蓝一面白",
      "englishName": "blue and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "cf480f160e2c4ded827c968dba3429af",
      "type": "physiochemical-color",
      "chineseName": "水白色至草黄色",
      "englishName": "water white to straw yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "cfbe9a24c6b84fccb09986eb34329a96",
      "type": "physiochemical-color",
      "chineseName": "类白至淡黄色",
      "englishName": "off-white to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d002909413734cf5ad7e3f79347032e9",
      "type": "physiochemical-color",
      "chineseName": "黄棕色",
      "englishName": "yellowish-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d172d1229ce24b5a973446bdcbe67ee2",
      "type": "physiochemical-color",
      "chineseName": "一面黄色一面灰色",
      "englishName": "yellow and grey",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d19579f7f5c741faa04ce2c29dbc0079",
      "type": "physiochemical-color",
      "chineseName": "黑蓝黄杂色",
      "englishName": "black blue yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d1c4afbb9f654dfe8781d39dbb56ca40",
      "type": "physiochemical-color",
      "chineseName": "黑色和紫色",
      "englishName": "black and purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d457ee2529af45888a1f5f7937437dba",
      "type": "physiochemical-color",
      "chineseName": "白色至浅红色",
      "englishName": "white to light red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d5e2da6e63d14db89d19191e793773c7",
      "type": "physiochemical-color",
      "chineseName": "咖啡色",
      "englishName": "coffee",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d6747e28c87d4e879e33c07fa870bc29",
      "type": "physiochemical-color",
      "chineseName": "白色至浅灰色",
      "englishName": "white to light gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d6c79bd648bb43c7aa9951883660f7b7",
      "type": "physiochemical-color",
      "chineseName": "墨绿色带荧光",
      "englishName": "dark green fluorescnet",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d82a70ec63c44e83870983cafd4a5a0f",
      "type": "physiochemical-color",
      "chineseName": "类白色或米色",
      "englishName": "off-white or beige",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d89b00675dd74449ad29a537e40ba74d",
      "type": "physiochemical-color",
      "chineseName": "深灰色至灰黑色",
      "englishName": "deep grey to grey-black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:08",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "d937c24caa024545b20682ff11208f56",
      "type": "physiochemical-color",
      "chineseName": "黑棕色",
      "englishName": "dark brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "dbb52379de68446ca7b9ca78f67fef99",
      "type": "physiochemical-color",
      "chineseName": "黄色至红棕色液体",
      "englishName": "yellow to red-brown liquid",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-05-08 10:09:28",
      "id": "dbcd5ee42b8149cda83b87ded30ab15e",
      "type": "physiochemical-color",
      "chineseName": "银红杂色",
      "englishName": "silver-red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "dcf549e675eb42aea938cb4d055edaa1",
      "type": "physiochemical-color",
      "chineseName": "一面黑色一面白色",
      "englishName": "black and white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:06",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "dde9172166df4054b7317eebfe3152df",
      "type": "physiochemical-color",
      "chineseName": "灰黄",
      "englishName": "grey yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "dea2ab9422ce41158ca6447b8806f130",
      "type": "physiochemical-color",
      "chineseName": "类白色至浅黄色",
      "englishName": "off-white to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "df146238b1084c96b2f0bbb6deb7a989",
      "type": "physiochemical-color",
      "chineseName": "灰色至紫色",
      "englishName": "grey to purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:09",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "df54d37531f24e52a32eef389e5080b4",
      "type": "physiochemical-color",
      "chineseName": "橘黄色",
      "englishName": "orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "dfadc6f86e2e496f996f4a9a66966a56",
      "type": "physiochemical-color",
      "chineseName": "白色或淡黄色",
      "englishName": "white or light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e076be62247747a59a550343c1da5f8a",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至黑色",
      "englishName": "light yellow to black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e0a1e9cc0ec44f3ea7b58278c6d9615a",
      "type": "physiochemical-color",
      "chineseName": "棕黄或浅棕色",
      "englishName": "brown yellow or light brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e0daf5be796048a9b190bef8276fce43",
      "type": "physiochemical-color",
      "chineseName": "黑色，银黑杂色，银红杂色或银蓝杂色",
      "englishName": "black, silver and black, silver and red or silver and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:04",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e0f1a4db7d7a413c80c1cb6ea0b5ff5e",
      "type": "physiochemical-color",
      "chineseName": "淡黄色",
      "englishName": "slight yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e14cbc571ba84df281cf30c451e4bc49",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至褐色",
      "englishName": "light yellow to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e271aed0f62f403c8a87c97b49d386bb",
      "type": "physiochemical-color",
      "chineseName": "类白色至浅褐色",
      "englishName": "off-white to light beige",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e27d0e52dd7b4c219d809239733b8752",
      "type": "physiochemical-color",
      "chineseName": "白色和黑色小颗粒",
      "englishName": "white ang black granule",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e41ecb1d16284dfc94225481b0dba4d1",
      "type": "physiochemical-color",
      "chineseName": "淡青色至浅黄绿色",
      "englishName": "light cyan to yellow-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:13",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e4fb937cffd447a5944960145cfbca7e",
      "type": "physiochemical-color",
      "chineseName": "浅黄绿色至灰白",
      "englishName": "pale yellow-green to gray-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e53fde46d80a42ed9b3b1491ccfa5975",
      "type": "physiochemical-color",
      "chineseName": "黑/白",
      "englishName": "black/white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e613a654fb60417898ce94df2b19a9b7",
      "type": "physiochemical-color",
      "chineseName": "类白至灰色",
      "englishName": "off-white to gray",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e72ec8f3215443c19f2c6cce9d5e183e",
      "type": "physiochemical-color",
      "chineseName": "类白色或浅黄色",
      "englishName": "off-white or light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e8fa096b11f74ea5a71b3b30a6d02376",
      "type": "physiochemical-color",
      "chineseName": "灰色至白色",
      "englishName": "grey to white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "e9c4e0ca535c4033915bbad36b87253e",
      "type": "physiochemical-color",
      "chineseName": "浅黄色至白色",
      "englishName": "light yellow to white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ea4f7d0c1f664181a5de1995a1290126",
      "type": "physiochemical-color",
      "chineseName": "无色至浅黄绿色",
      "englishName": "colorless to light yellow-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ea6d11324eee4413ba320f0e63434563",
      "type": "physiochemical-color",
      "chineseName": "浅黑色",
      "englishName": "light black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "eae14b6c920b400fb2bba71151e8aa0c",
      "type": "physiochemical-color",
      "chineseName": "白色至浅黄色",
      "englishName": "white to light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "eb51844b53c74d2fa35dea24065d9d9b",
      "type": "physiochemical-color",
      "chineseName": "暗棕色",
      "englishName": "dark brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ebc5c90e67304934b01ca0b0409aae2e",
      "type": "physiochemical-color",
      "chineseName": "类白色至黄色",
      "englishName": "off-white to yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ebe60ae341a64dd9a66cd62484fa28f3",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至黄褐色",
      "englishName": "light yellow to yellow-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:08",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ec7ed75955b048f69c188a6e01d51678",
      "type": "physiochemical-color",
      "chineseName": "暗紫色",
      "englishName": "dark purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "eda4b1749ff84d059a1d2a539a78eb46",
      "type": "physiochemical-color",
      "chineseName": "白色或微黄色",
      "englishName": "white or light yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ef5b1dbf386d4c9e83ac031bed514302",
      "type": "physiochemical-color",
      "chineseName": "蓝白色",
      "englishName": "blue-white",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:10",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ef9dede09e834faa8f501c06d7a26a52",
      "type": "physiochemical-color",
      "chineseName": "品红",
      "englishName": "magenta",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f2441e558b4c40498ceb198156133e06",
      "type": "physiochemical-color",
      "chineseName": "类白色至棕黄色",
      "englishName": "off-white to brown-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f256cf7bd2f24c3aa3ffd83c38382e8c",
      "type": "physiochemical-color",
      "chineseName": "浅黄色或咖啡色",
      "englishName": "buff or coffee",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f2c1bcd575834ad2bcccad7b3f3fea3f",
      "type": "physiochemical-color",
      "chineseName": "银棕杂色",
      "englishName": "silver-brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:14",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f3290d65dc0e4449b6c6fb3596a34fc1",
      "type": "physiochemical-color",
      "chineseName": "红黑色",
      "englishName": "red and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f46307d5eb214bcd89ae250eaa7b8e3e",
      "type": "physiochemical-color",
      "chineseName": "暗红色至紫黑色",
      "englishName": "dark red to purple-black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:18",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f54147029d2946b9992115e91a377d8e",
      "type": "physiochemical-color",
      "chineseName": "蓝色和黑色",
      "englishName": "blue and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f57d762f705845c7a4156bab4400eba2",
      "type": "physiochemical-color",
      "chineseName": "白色至深粉色",
      "englishName": "white to deep pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f61eaecdeeba4093862d7ede98686257",
      "type": "physiochemical-color",
      "chineseName": "橙色至粉色",
      "englishName": "orange to pink",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:19",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f62c5bb936884f93a4ec5fc94fe64ab8",
      "type": "physiochemical-color",
      "chineseName": "淡黄色至橙黄色",
      "englishName": "slight yellow to orange-yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:21",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f722770eae5045e2b44aaca2c8c1f1bb",
      "type": "physiochemical-color",
      "chineseName": "土黄色至棕绿色",
      "englishName": "earth-yellow to brown-green",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f75c7b63b07a4354b417323340864d62",
      "type": "physiochemical-color",
      "chineseName": "类白色或土黄色",
      "englishName": "off-white or earth yellow",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:07",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f7985a739aa349a99d78ddadb3a3d360",
      "type": "physiochemical-color",
      "chineseName": "黑褐色",
      "englishName": "dark brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:06",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "f93ca9a702bc4d38bb114d3b9dfae4b2",
      "type": "physiochemical-color",
      "chineseName": "黄蓝二色",
      "englishName": "yellow and blue",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "fa61b646afed4059a01e69b151a1523e",
      "type": "physiochemical-color",
      "chineseName": "淡红色至紫色",
      "englishName": "light red to purple",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:17",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "fab1707c286243239c02877488eb0818",
      "type": "physiochemical-color",
      "chineseName": "黑红色",
      "englishName": "dark red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:16",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "fbbedabd333c44a88070afc5f33d7e37",
      "type": "physiochemical-color",
      "chineseName": "葡萄酒红",
      "englishName": "wine red",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:12",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "fc85df54753944a1a14192ebb3ce23ec",
      "type": "physiochemical-color",
      "chineseName": "白色至棕色",
      "englishName": "white to brown",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:11",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "fc8ec3c9b6bf41a1b8e3cbf4b9d93e44",
      "type": "physiochemical-color",
      "chineseName": "蓝色、绿色、黄色、红色、棕色和桔色",
      "englishName": "blue,green,yellow,red,brown and orange",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2017-05-06 23:40:20",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "ff3a855a0d724a42b89a079d18a72750",
      "type": "physiochemical-color",
      "chineseName": "银黄黑杂色",
      "englishName": "silvery and yellow and black",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f0682e7000e",
      "createdDate": "2017-04-17 16:28:55",
      "modifiedBy": "40287f81563efffb01563f0682e7000e",
      "modifiedDate": "2017-04-17 16:28:55",
      "id": "8aad92b65b799975015b7b0767f40dbc",
      "type": "physiochemical-color",
      "chineseName": "白色至灰白色",
      "englishName": "white to grey-white",
      "sn": 50,
      "disable": false
    }
  ];

  // src/shared/appearence/shape.ts
  var shapeMap = [
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2023-11-21 17:25:30",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-11-21 17:25:30",
      "id": "2c9180838b90642e018bf132f37f5a60",
      "type": "libattery-shape",
      "chineseName": "球形",
      "englishName": "spherical",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2020-03-12 14:16:27",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2020-03-12 14:16:27",
      "id": "2c918084700d8fb20170cd63120008f7",
      "type": "libattery-shape",
      "chineseName": "棱柱形",
      "englishName": "prismatic",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:40",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "520",
      "type": "libattery-shape",
      "chineseName": "长方体",
      "englishName": "cuboid",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "1",
      "createdDate": "2016-09-11 21:52:40",
      "modifiedBy": null,
      "modifiedDate": null,
      "id": "521",
      "type": "libattery-shape",
      "chineseName": "圆柱体",
      "englishName": "cylinder",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-03-09 09:00:05",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-03-09 09:00:05",
      "id": "8aad92b65aae82c3015ab094788a0026",
      "type": "libattery-shape",
      "chineseName": "扣式",
      "englishName": "button",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-06-05 15:10:33",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-06-05 15:10:33",
      "id": "8aad92b65c76a14d015c771747250caa",
      "type": "libattery-shape",
      "chineseName": "近长方体",
      "englishName": "almost cuboid",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-07-26 16:51:10",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-07-26 16:51:10",
      "id": "8aad92b65d7a7078015d7e17b9fc23cd",
      "type": "libattery-shape",
      "chineseName": "正方体",
      "englishName": "cube",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-07-26 16:51:56",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2023-01-18 13:19:18",
      "id": "8aad92b65d7a7078015d7e186bf923d6",
      "type": "libattery-shape",
      "chineseName": "不规则形状",
      "englishName": "irregular",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-07-26 16:53:16",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-07-26 16:53:16",
      "id": "8aad92b65d7a7078015d7e19a3b12448",
      "type": "libattery-shape",
      "chineseName": "长方体带有导线",
      "englishName": "cuboid with wire",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-07-26 16:55:30",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-07-26 16:55:30",
      "id": "8aad92b65d7a7078015d7e1bb1a2245d",
      "type": "libattery-shape",
      "chineseName": "近圆柱体",
      "englishName": "approximate cylinder",
      "sn": 0,
      "disable": false
    },
    {
      "createdBy": "40287f81563efffb01563f05aaa2000a",
      "createdDate": "2017-08-21 10:01:42",
      "modifiedBy": "40287f81563efffb01563f05aaa2000a",
      "modifiedDate": "2017-08-21 10:01:42",
      "id": "8aad92b65de116af015e02862e0c25de",
      "type": "libattery-shape",
      "chineseName": "块状",
      "englishName": "bulk",
      "sn": 0,
      "disable": false
    }
  ];

  // src/summary/checkShape.ts
  function removeNonChineseCharacters(str) {
    return str.replace(/[^\u4e00-\u9fa5]/g, "");
  }
  function checkShape(formShape, summaryShape) {
    summaryShape = removeNonChineseCharacters(summaryShape.trim());
    const splitTexts = summaryShape.split("色");
    const shapeText = splitTexts[splitTexts.length - 1];
    let formShapeChineseName = "";
    let summaryShapeId = "";
    shapeMap.forEach((item) => {
      if (formShape === item.id) {
        formShapeChineseName = item.chineseName;
      }
      if (item.chineseName === shapeText) {
        summaryShapeId = item.id;
      }
    });
    if (formShape !== summaryShapeId && summaryShapeId) {
      return [{
        ok: false,
        result: `形状不一致, 系统上为${formShapeChineseName ?? "空"}, 概要上为${shapeText}`
      }];
    }
    return [];
  }

  // src/summary/checkT7.ts
  var batteryTypeMap2 = {
    "500": "锂离子电池",
    "501": "锂离子电芯",
    "502": "锂金属电池",
    "503": "锂金属电芯",
    "504": "单芯锂离子电池",
    "505": "单芯锂金属电池"
  };
  function checkT7(batteryType, summaryTest7, note) {
    switch (batteryType) {
      case "501":
      case "502":
      case "503":
        if (summaryTest7.includes("通过")) {
          return [{
            ok: false,
            result: `电池类型为${batteryTypeMap2[batteryType]}, 概要T7测试结果为${summaryTest7}`
          }];
        }
        break;
      case "500":
        if (summaryTest7.includes("不适用") && !note.includes("保护")) {
          return [{
            ok: false,
            result: `电池类型为${batteryTypeMap2[batteryType]}，不含保护电路，概要T7测试结果为${summaryTest7}`
          }];
        }
        break;
      case "504":
        if (summaryTest7.includes("不适用")) {
          return [{
            ok: false,
            result: `电池类型为${batteryTypeMap2[batteryType]}，概要T7测试结果为${summaryTest7}`
          }];
        }
        break;
    }
    return [];
  }

  // src/summary/checkTradeMark.ts
  function checkTradeMark(formTradeMark, summaryTradeMark) {
    let formTradeMarkText = formTradeMark.trim();
    let summaryTradeMarkText = summaryTradeMark.trim();
    if (!formTradeMarkText || summaryTradeMarkText === "/") return [];
    if (formTradeMarkText !== summaryTradeMarkText) {
      return [{
        ok: false,
        result: `商标不一致, 系统上为${formTradeMarkText}, 概要上为${summaryTradeMarkText}`
      }];
    }
    return [];
  }

  // src/summary/checkVoltage.ts
  function checkVoltage(formVoltage, summaryVoltage) {
    let summaryVoltageNumber = matchVoltage(summaryVoltage.trim());
    if (summaryVoltageNumber !== formVoltage) {
      return [{
        ok: false,
        result: `电压不一致, 系统上为${formVoltage}, 概要上为${summaryVoltageNumber}`
      }];
    }
    return [];
  }

  // src/summary/checkWattHour.ts
  function checkWattHour(formWattHour, summaryWattHour) {
    let summaryWattHourNumber = matchWattHour(" " + summaryWattHour.trim());
    if (summaryWattHourNumber !== formWattHour) {
      return [{
        ok: false,
        result: `瓦时不一致, 系统上为${formWattHour}, 概要上为${summaryWattHourNumber}`
      }];
    }
    return [];
  }

  // src/summary/checkProjectNo.ts
  function checkProjectNo(formProjectNo, summaryProjectNo) {
    if (formProjectNo !== summaryProjectNo.trim()) {
      return [{ ok: false, result: "项目编号不一致" }];
    }
    return [];
  }

  // src/summary/checkConsignor.ts
  function checkConsignor(systemIdConsignor, summaryConsignor) {
    if (!systemIdConsignor) {
      return [{ ok: false, result: "获取系统委托方失败" }];
    }
    if (!summaryConsignor.includes(systemIdConsignor.trim())) {
      return [{ ok: false, result: `委托方不一致, 系统上委托方为${systemIdConsignor.trim()}, 概要委托方为${summaryConsignor}` }];
    }
    return [];
  }

  // src/summary/checkManufacturer.ts
  function checkManufacturer(systemIdManufacturer, summaryManufacturer) {
    if (!systemIdManufacturer) {
      return [{ ok: false, result: "获取系统制造商失败" }];
    }
    if (!summaryManufacturer.includes(systemIdManufacturer.trim())) {
      return [{ ok: false, result: `制造商不一致, 系统上制造商为${systemIdManufacturer.trim()}, 概要制造商为${summaryManufacturer}` }];
    }
    return [];
  }

  // src/summary/checkMarket.ts
  function replaceSpace(str) {
    return str.replace(/\s+/g, "");
  }
  function checkMarket(market, summaryReportNo) {
    market = replaceSpace(market);
    summaryReportNo = replaceSpace(summaryReportNo);
    if (market !== summaryReportNo) {
      return [{
        ok: false,
        result: `技术备注: ${market} 与测试报告编号: ${summaryReportNo} 不一致`
      }];
    }
    return [];
  }

  // src/summary/checkUN38fg.ts
  function checkUN38fg(un38f, un38g) {
    const result = [];
    if (!un38f.includes("不适用")) {
      result.push({ ok: false, result: "un38f应为不适用" });
    }
    if (!un38g.includes("不适用")) {
      result.push({ ok: false, result: "un38g应为不适用" });
    }
    return result;
  }

  // src/summary/goods/checkItemCName.ts
  function replaceSpace2(str) {
    return str.replace(/\s+/g, "");
  }
  function checkItemCName(currentDataItemCName, goodsInfoItemCName) {
    currentDataItemCName = replaceSpace2(currentDataItemCName);
    goodsInfoItemCName = replaceSpace2(goodsInfoItemCName);
    if (goodsInfoItemCName === "未找到物品名称") {
      return [];
    }
    if (currentDataItemCName !== goodsInfoItemCName) {
      return [{
        ok: false,
        result: `图片品名不一致: ${currentDataItemCName} !== ${goodsInfoItemCName}`
      }];
    }
    return [];
  }

  // src/summary/goods/checkLabel.ts
  function getPekExpectedLabel(pkgInfoSubType, netWeight) {
    let label = [];
    switch (pkgInfoSubType) {
      case "952":
        label.push("9");
        break;
      case "965, IA":
      case "968, IA":
        label.push("9A", "CAO");
        break;
      case "965, IB":
      case "968, IB":
        label.push("9A", "CAO", "bty");
        break;
      case "966, I":
      case "969, I":
      case "967, I":
      case "970, I":
        label.push("9A");
        if (netWeight > 5) {
          label.push("CAO");
        }
        break;
      case "966, II":
      case "969, II":
      case "967, II":
      case "970, II":
        label.push("bty");
        break;
    }
    return label;
  }
  function getSekExpectedLabel(conclusions, UNNO) {
    if (["UN3556", "UN3557", "UN3558"].includes(UNNO)) {
      return ["9A"];
    }
    if (["UN3171"].includes(UNNO)) {
      return ["9"];
    }
    if (conclusions === 1) {
      return ["9A"];
    } else {
      return ["bty"];
    }
  }
  function sortLabel(arr) {
    return arr.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
  }
  function checkLabel(expectedLabel, goodsLabels) {
    if (goodsLabels[0] === "pass") {
      return [];
    }
    expectedLabel = sortLabel(expectedLabel);
    goodsLabels = sortLabel(goodsLabels);
    if (expectedLabel.length !== goodsLabels.length) {
      return [{ ok: false, result: `标签不一致，期望标签：${expectedLabel.join(",")}, 实际标签：${goodsLabels.join(",")}` }];
    }
    for (let i = 0; i < expectedLabel.length; i++) {
      if (expectedLabel[i] !== goodsLabels[i]) {
        return [{ ok: false, result: `标签不一致，期望标签：${expectedLabel.join(",")}, 实际标签：${goodsLabels.join(",")}` }];
      }
    }
    return [];
  }

  // src/summary/goods/checkProjectNo.ts
  function checkProjectNo2(currentDataProjectNo, goodsInfoProjectNo) {
    if (currentDataProjectNo !== goodsInfoProjectNo) {
      return [{
        ok: false,
        result: "图片项目号不一致"
      }];
    }
    return [];
  }

  // src/summary/goods/index.ts
  function checkSekGoods(conclusions, UNNO, itemCName, projectNo, goodsInfo) {
    let results = [];
    const expectedLabel = getSekExpectedLabel(conclusions, UNNO);
    results.push(...checkLabel(expectedLabel, goodsInfo.labels));
    results.push(...checkItemCName(itemCName, goodsInfo.name));
    results.push(...checkProjectNo2(projectNo, goodsInfo.projectNo));
    return results;
  }
  function checkPekGoods(pkgInfoSubType, netWeight, itemCName, projectNo, goodsInfo) {
    let results = [];
    const expectedLabel = getPekExpectedLabel(pkgInfoSubType, netWeight);
    results.push(...checkLabel(expectedLabel, goodsInfo.labels));
    results.push(...checkItemCName(itemCName, goodsInfo.name));
    results.push(...checkProjectNo2(projectNo, goodsInfo.projectNo));
    return results;
  }

  // src/summary/checkTitle.ts
  function checkTitle(summaryTitle) {
    if (summaryTitle.trim() !== "锂电池/钠离子电池UN38.3试验概要Test Summary") {
      return [{
        ok: false,
        result: `概要标题${summaryTitle}不正确`
      }];
    }
    return [];
  }

  // src/summary/checkColor.ts
  function removeNonChineseCharacters2(str) {
    return str.replace(/[^\u4e00-\u9fa5]/g, "");
  }
  function checkColor(formColorId, summaryShape) {
    summaryShape = removeNonChineseCharacters2(summaryShape.trim());
    const spiltTexts = summaryShape.split("色");
    const shapeText = spiltTexts[spiltTexts.length - 1];
    const colorText = summaryShape.replace(shapeText, "");
    let formColorChineseName = "";
    let summaryColorId = "";
    colorMap.forEach((item) => {
      if (item.chineseName === colorText) {
        summaryColorId = item.id;
      }
      if (formColorId === item.id) {
        formColorChineseName = item.chineseName;
      }
    });
    if (summaryColorId && summaryColorId !== formColorId) {
      return [{
        ok: false,
        result: `颜色不一致, 系统上为${formColorChineseName ?? "空"}, 概要上为${colorText}`
      }];
    }
    return [];
  }

  // src/summary/index.ts
  function checkSekAttachment(currentData, attachmentInfo, entrustData) {
    const summaryData = attachmentInfo.summary;
    const goodsInfo = attachmentInfo.goods;
    const checkMap = {
      "500": ["≤100Wh", ">100Wh"],
      "501": ["≤20Wh", ">20Wh"],
      "504": ["≤20Wh", ">20Wh"],
      "502": [">2g", "≤2g"],
      "503": [">1g", "≤1g"],
      "505": [">1g", "≤1g"]
    };
    const btyType = currentData["btyType"];
    const {
      // 中文品名
      itemCName,
      // 英文品名
      itemEName,
      // 电池尺寸
      btySize,
      btyColor,
      // 电池形状
      // 锂离子电池 锂离子电芯 锂金属电池 锂金属电芯 单芯锂离子电池 单芯锂金属电池
      // '500'    | '501'    | '504'  |  '502'   | '503'       | '505'
      btyShape,
      // 电池型号
      btyKind,
      // 其他描述
      otherDescribe,
      // 备注
      comment,
      // 技术备注
      market,
      // 危险性
      classOrDiv
    } = currentData;
    const btyCount = matchNumber(currentData["btyCount"]);
    const voltage = matchVoltage(itemCName);
    const capacity = matchCapacity(itemCName);
    const wattHour = matchNumber(currentData["inspectionItem1Text1"]);
    const wattHourFromName = matchWattHour(itemCName);
    const liContent = matchNumber(currentData["inspectionItem1Text2"]);
    const netWeight = matchNumber(currentData["btyNetWeight"]);
    const netWeightDisplay = matchNumber(currentData["btyNetWeight"]) * 1e3;
    const btyGrossWeight = Number(currentData["btyGrossWeight"]);
    const otherDescribeCAddition = currentData["otherDescribeCAddition"];
    const batteryWeight = matchBatteryWeight(currentData["otherDescribeCAddition"]);
    const inspectionResult1 = currentData["inspectionResult1"];
    const isSingleCell = getIsSingleCell(btyType);
    const unno = currentData["unno"];
    const isCell = getIsCell(btyType);
    const packageType = otherDescribe === "540" ? "0" : otherDescribe === "541" ? "1" : "2";
    const isIon = getIsIon(btyType);
    const pkgInfo = getPkgInfo(unno, isIon, packageType);
    const unTest = String(currentData["inspectionResult2"]) === "0";
    const dropTest = String(currentData["inspectionResult5"]) === "0";
    const packageGrade = currentData["pg"];
    const conclusions = Number(currentData["conclusions"]);
    const properShippingName = currentData["psn"];
    const according = currentData["according"];
    const otherDescribeChecked = currentData["otherDescribeChecked"] === "1";
    const btyBrand = currentData["btyBrand"];
    let results = [];
    results.push(...checkTitle(summaryData.title));
    results.push(...checkName(packageType, itemEName, itemCName, btyKind, summaryData.cnName));
    results.push(...checkBatteryType(btyType, summaryData.classification));
    results.push(...checkModel(btyKind, summaryData.type));
    results.push(...checkTradeMark(btyBrand, summaryData.trademark));
    if (voltage) {
      results.push(...checkVoltage(voltage, summaryData.voltage));
    }
    if (capacity) {
      results.push(...checkCapacity(capacity, summaryData.capacity));
    }
    results.push(...checkWattHour(wattHour, summaryData.watt));
    results.push(...checkShape(btyShape, summaryData.shape));
    results.push(...checkColor(btyColor, summaryData.shape));
    results.push(...checkMass(batteryWeight, summaryData.mass));
    results.push(...checkLiContent(liContent, summaryData.licontent));
    results.push(...checkT7(btyType, summaryData.test7, summaryData.note));
    results.push(...checkIssueDate(summaryData.issueDate, currentData.projectNo));
    results.push(...checkProjectNo(currentData.projectNo, summaryData.projectNo));
    results.push(...checkConsignor(entrustData.consignor, summaryData.consignor));
    results.push(...checkManufacturer(entrustData.manufacturer, summaryData.manufacturer));
    results.push(...checkMarket(market, summaryData.testReportNo));
    results.push(...checkUN38fg(summaryData.un38f, summaryData.un38g));
    results.push(...checkSekGoods(conclusions, unno, itemCName, currentData.projectNo, goodsInfo));
    return results;
  }
  function checkPekAttachment(currentData, attachmentInfo, entrustData) {
    const summaryData = attachmentInfo.summary;
    const goodsInfo = attachmentInfo.goods;
    const btyType = getBtyTypeCode(currentData);
    const {
      // 品名
      itemCName,
      // 品名
      itemEName,
      // 操作信息
      otherDescribe,
      // 注意事项
      remarks,
      // 危险性类别
      classOrDiv,
      // 仅限货机
      packCargo,
      // 技术备注
      market
    } = currentData;
    const btyKind = currentData["model"];
    const voltage = matchNumber(currentData["inspectionItem2Text1"]);
    const capacity = matchNumber(currentData["inspectionItem2Text2"]);
    const wattHour = matchNumber(currentData["inspectionItem3Text1"]);
    const wattHourFromName = matchWattHour(currentData["itemCName"]);
    const liContent = matchNumber(currentData["inspectionItem4Text1"]);
    const btyCount = matchNumber(currentData["btyCount"]);
    const netWeight = parseNetWeight(currentData["netWeight"]);
    const netWeightDisplay = matchNumber(currentData["netWeight"]) * 1e3;
    const otherDescribeCAddition = currentData["otherDescribeCAddition"];
    const batteryWeight = matchBatteryWeight(otherDescribeCAddition);
    const isSingleCell = getIsSingleCell(btyType);
    const btyColor = currentData["color"];
    const btyShape = currentData["shape"];
    const btySize = currentData["size"];
    const inspectionItem3Text1 = currentData["inspectionItem3Text1"];
    const inspectionItem4Text1 = currentData["inspectionItem4Text1"];
    const unno = currentData["unno"];
    const isCell = String(currentData["type2"]) === "1";
    const properShippingName = currentData["psn"];
    const packageGrade = currentData["pg"];
    const packPassengerCargo = currentData["packPassengerCargo"];
    const packageType = String(currentData["inspectionItem1"]);
    const isIon = String(currentData["type1"]) === "1";
    const pkgInfo = getPkgInfo(unno, isIon, packageType);
    const pkgInfoReference = currentData["inspectionItem5Text1"];
    const pkgInfoByPackCargo = getPkgInfoByPackCargo(pkgInfoReference, packCargo);
    const pkgInfoSubType = getPkgInfoSubType(pkgInfoReference, packCargo);
    const stackTest = String(currentData["inspectionItem6"]) === "1";
    const stackTestEvaluation = otherDescribe.includes("2c9180849267773c0192dc73c77e5fb2");
    const dropTest = String(currentData["inspectionItem2"]) === "1";
    const liBtyLabel = String(currentData["inspectionItem4"]) === "1";
    const unTest = String(currentData["inspectionItem3"]) === "1";
    const randomFile = String(currentData["inspectionItem5"]) === "1";
    const isChargeBoxOrRelated = otherDescribeCAddition.includes("总净重");
    const isDangerous = pekIsDangerous(
      wattHour,
      pkgInfo,
      liContent,
      netWeight,
      isSingleCell
    );
    const isIA = pkgInfoIsIA(wattHour, pkgInfo, liContent, netWeight, isSingleCell);
    const btyBrand = currentData["brands"];
    let results = [];
    results.push(...checkTitle(summaryData.title));
    results.push(...checkName(packageType, itemEName, itemCName, btyKind, summaryData.cnName));
    results.push(...checkBatteryType(btyType, summaryData.classification));
    results.push(...checkModel(btyKind, summaryData.type));
    results.push(...checkTradeMark(btyBrand, summaryData.trademark));
    results.push(...checkVoltage(voltage, summaryData.voltage));
    results.push(...checkCapacity(capacity, summaryData.capacity));
    results.push(...checkWattHour(wattHour, summaryData.watt));
    results.push(...checkShape(btyShape, summaryData.shape));
    results.push(...checkColor(btyColor, summaryData.shape));
    results.push(...checkMass(batteryWeight, summaryData.mass));
    results.push(...checkLiContent(liContent, summaryData.licontent));
    results.push(...checkT7(btyType, summaryData.test7, summaryData.note));
    results.push(...checkIssueDate(summaryData.issueDate, currentData.projectNo));
    results.push(...checkProjectNo(currentData.projectNo, summaryData.projectNo));
    results.push(...checkConsignor(entrustData.consignor, summaryData.consignor));
    results.push(...checkManufacturer(entrustData.manufacturer, summaryData.manufacturer));
    results.push(...checkMarket(market, summaryData.testReportNo));
    results.push(...checkUN38fg(summaryData.un38f, summaryData.un38g));
    results.push(...checkPekGoods(pkgInfoSubType, netWeight, itemCName, currentData.projectNo, goodsInfo));
    return results;
  }

  // src/index.ts
  window.checkPekBtyType = checkPekBtyType;
  window.checkSekBtyType = checkSekBtyType;
  window.checkPekAttachment = checkPekAttachment;
  window.checkSekAttachment = checkSekAttachment;
})();
