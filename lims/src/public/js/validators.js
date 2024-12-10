"use strict";
(() => {
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

  // src/shared/utils/index.ts
  function matchWattHour(projectName) {
    const matches = [...projectName.matchAll(/\s(\d+\.?\d+)[Kk]?[Ww][Hh]/g)];
    const results = matches.map((match) => match[1]);
    let wattHour = Number(results[results.length - 1]);
    if (!results.length) return 0;
    if (isNaN(wattHour)) return 0;
    if (projectName.toLowerCase().includes("kwh")) wattHour *= 1e3;
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
    let result = Number(results[results.length - 1]);
    if (!results.length) return 0;
    if (isNaN(result)) return 0;
    if (!projectName.toLowerCase().includes("mah")) result *= 1e3;
    return result;
  }
  function matchBatteryWeight(describe) {
    const matches = [...describe.matchAll(/(\d+\.?\d*)[Kk]?[g]/g)];
    const results = matches.map((match) => match[1]);
    let weight = Number(results[0]);
    if (!results.length) return 0;
    if (isNaN(weight)) return 0;
    if (describe.toLowerCase().includes("kg")) weight = weight * 1e3;
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
        result.push({ ok: false, result: `结论错误，运输专有名称错误，应为${properShippingNameMap[unKey]}` });
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
        if (UNNO === "UN3556") {
          result.push({ ok: false, result: "结论错误，UN编号应为UN3556, 如果是25年报告请忽略" });
        } else {
          result.push({ ok: false, result: "结论错误，UN编号应为" + UNNO });
        }
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
    if (!stackTest && !stackTestEvaluation) {
      if (pkgInfoSubType === "967, I" || pkgInfoSubType === "970, I" || pkgInfoSubType === "967, II" || pkgInfoSubType === "970, II") {
        result.push({ ok: false, result: "967/970 未勾选堆码，或堆码评估，如果是24年报告请忽略" });
      }
      if (pkgInfoSubType === "966, II" || pkgInfoSubType === "969, II") {
        result.push({ ok: false, result: "966/969 第II部分未勾选堆码，或堆码评估，如果是24年报告请忽略" });
      }
    }
    if (stackTest && stackTestEvaluation) {
      result.push({ ok: false, result: "重复勾选堆码和堆码评估" });
    }
    if (pkgInfoSubType === "965, IB") {
      if (!stackTest) {
        result.push({ ok: false, result: "965，IB未勾选堆码" });
      }
      if (!dropTest) {
        result.push({ ok: false, result: "965，IB未勾选跌落" });
      }
    }
    if (pkgInfoSubType === "965, IA" || pkgInfoSubType === "966, I" || pkgInfoSubType === "969, I") {
      if (dropTest) {
        result.push({ ok: false, result: "965，IA不应勾选跌落" });
      }
      if (stackTest) {
        result.push({ ok: false, result: "965，IA不应勾选堆码" });
      }
    }
    if (pkgInfoSubType === "967, II" || pkgInfoSubType === "969, II") {
      if (dropTest) {
        result.push({ ok: false, result: "967，II不应勾选跌落" });
      }
    }
    if (pkgInfoSubType === "966, II" && !dropTest) {
      result.push({ ok: false, result: "966，II未勾选跌落" });
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
      console.log(pkgInfo, pkgInfoByPackCargo);
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
        result.push({ ok: false, result: "瓦时数与项目名称不匹配" });
    }
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
  function conclusionsCheck2(conclusions, unno, otherDescribe, inspectionResult1, btyGrossWeight, comment, packageGrade, classOrDiv, isIon, properShippingName) {
    let result = [];
    unno = unno.trim();
    properShippingName = properShippingName.trim();
    packageGrade = packageGrade.trim();
    classOrDiv = classOrDiv.trim();
    comment = comment.trim();
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
        if (["540", "541"].includes(otherDescribe) && comment !== "1200") {
          result.push({
            ok: false,
            result: "结论错误，危险品物品，单独运输或与设备包装在一起，应达到II级包装性能"
          });
        }
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
      if (comment !== "8aad92b6595aada201595aaf03370000") {
        result.push({
          ok: false,
          result: "非限制性物品，备注应为：根据IMDG CODE特殊规定188不受限制。"
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
    }
    if (currentData["inspectionResult7"] !== "2")
      result.push({ ok: false, result: "随附文件错误，未勾选不适用" });
    if (currentData["inspectionResult8"] !== "2" || currentData["inspectionResult9"] !== "2")
      result.push({ ok: false, result: "鉴别项目8，9 错误，未勾选不适用" });
    if (currentData["inspectionItem8Cn"] !== "" || currentData["inspectionItem8En"] !== "" || currentData["inspectionItem9Cn"] !== "" || currentData["inspectionItem9En"] !== "")
      result.push({ ok: false, result: "鉴别项目8，9 不为空" });
    result.push(...conclusionsCheck2(
      conclusions,
      unno,
      otherDescribe,
      inspectionResult1,
      btyGrossWeight,
      comment,
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
    const inspectionResult1 = currentData["inspectionResult1"];
    if (!checkMap[btyType].includes(inspectionResult1))
      result.push({ ok: false, result: "检验结果1错误，瓦时数取值范围错误" });
    if (wattHourFromName > 0 && !isNaN(Number(currentData["inspectionItem1Text1"]))) {
      if (Number(currentData["inspectionItem1Text1"]) !== wattHourFromName)
        result.push({ ok: false, result: "瓦时数与项目名称不匹配" });
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

  // src/index.ts
  window.checkPekBtyType = checkPekBtyType;
  window.checkSekBtyType = checkSekBtyType;
})();
