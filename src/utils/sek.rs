use std::collections::HashMap;

use crate::models::{CheckResult, SekData};

use super::{
    parse_net_weight,
    regex::{match_battery_weight, match_capacity, match_number, match_voltage, match_watt_hour},
};

pub fn check_sek_bty_type(current_data: SekData) -> Vec<CheckResult> {
    let mut result = Vec::new();

    let mut check_map: HashMap<&str, [&str; 2]> = HashMap::new();
    check_map.insert("500", ["≤100Wh", ">100Wh"]);
    check_map.insert("501", ["≤20Wh", ">20Wh"]);
    check_map.insert("504", ["≤20Wh", ">20Wh"]);
    check_map.insert("502", [">2g", "≤2g"]);
    check_map.insert("503", [">1g", "≤1g"]);
    check_map.insert("505", [">1g", "≤1g"]);

    let bty_type = &current_data.bty_type;

    if !check_map.contains_key(bty_type.as_str()) {
        result.push(CheckResult {
            ok: false,
            result: "不适用的电池类型".to_string(),
        });
    }

    // 基本数据转换
    let item_cname = &current_data.item_c_name;
    let item_ename = &current_data.item_e_name;
    let bty_kind = &current_data.bty_kind;
    let bty_type = &current_data.bty_type;
    let bty_count = current_data.bty_count.parse::<f32>().unwrap_or(0.0);
    // 净重转换
    let _net_weight = parse_net_weight(&current_data.bty_net_weight);
    // 真实显示净重数字 单位：g
    let net_weight_display = match_number(&current_data.other_describe) * 1000.0;
    // 电池净重
    let battery_weight = match_battery_weight(&current_data.other_describe);
    let voltage = match_voltage(&current_data.item_c_name);
    let capacity = match_capacity(&current_data.item_c_name);
    let watt_hour = match_number(&current_data.inspection_item1_text1);
    let watt_hour_from_name = match_watt_hour(&current_data.item_c_name);

    // 电池类型验证
    if item_cname.contains("芯") && !["501", "503"].contains(&bty_type.as_str()) {
        result.push(CheckResult {
            ok: false,
            result: "电池类型应为电芯".to_string(),
        });
    }

    // 电压大于7V，可能为电池组
    if voltage > 7.0 && (bty_type == "503" || bty_type == "501") {
        result.push(CheckResult {
            ok: false,
            result: "电压大于7V，可能为电池组".to_string(),
        });
    }
    // 电压*容量 与 瓦时数 误差大于5%
    if voltage > 0.0 && capacity > 0.0 && watt_hour > 0.0 && watt_hour_from_name == watt_hour {
        let expected_watt_hour = voltage * capacity / 1000.0;
        let abs = (expected_watt_hour - watt_hour) / watt_hour;
        if abs > 0.05 {
            result.push(CheckResult {
                ok: false,
                result: "容量*电压 与 瓦时数 误差大于5%".to_string(),
            });
        }
    }
    // 基本验证
    if item_cname.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "中文品名为空".to_string(),
        });
    }

    if item_ename.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "英文品名为空".to_string(),
        });
    }

    // 形状和尺寸验证
    let bty_shape = &current_data.bty_shape;
    let bty_size = &current_data.bty_size;

    if String::from(bty_size).replace(" ", "").len() > 0 {
        if !bty_size.contains("m") && !bty_size.contains("M") {
            result.push(CheckResult {
                ok: false,
                result: "电池尺寸缺失单位".to_string(),
            });
        }
    }

    if bty_size.contains('Φ')
        || bty_size.contains('φ')
        || bty_size.contains('Ø')
        || bty_size.contains('ø')
    {
        let valid_shapes = [
            "8aad92b65aae82c3015ab094788a0026",
            "8aad92b65d7a7078015d7e1bb1a2245d",
            "521",
            "2c9180838b90642e018bf132f37f5a60",
        ];
        if !valid_shapes.contains(&bty_shape.as_str()) {
            result.push(CheckResult {
                ok: false,
                result: "电池形状或尺寸错误".to_string(),
            });
        }
    }

    // 电池净重验证
    if battery_weight > 0.0 && bty_count > 0.0 && net_weight_display > 0.0 {
        let expected_net_weight = battery_weight * bty_count;
        let abs = (expected_net_weight - net_weight_display) / net_weight_display;
        if abs > 0.05 && bty_count > 1.0 {
            result.push(CheckResult {
                ok: false,
                result: "电池净重误差大于5%".to_string(),
            });
        }
    }

    // 其他描述验证
    let other_describe = &current_data.other_describe;

    if other_describe.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "其他描述包装方式为空".to_string(),
        });
    }

    if other_describe.len() > 3 {
        result.push(CheckResult {
            ok: false,
            result: "其他描述包装方式不唯一".to_string(),
        });
    }

    // 电芯/电池描述验证
    let other_describe_c_addition = &current_data.other_describe_c_addition;
    if ["501", "503"].contains(&bty_type.as_str())
        && !other_describe_c_addition.contains("单块电芯")
        && !other_describe_c_addition.contains("总净重")
    {
        result.push(CheckResult {
            ok: false,
            result: "其他描述不为电芯".to_string(),
        });
    }

    if !["501", "503"].contains(&bty_type.as_str())
        && !other_describe_c_addition.contains("单块电池")
        && !other_describe_c_addition.contains("总净重")
    {
        result.push(CheckResult {
            ok: false,
            result: "其他描述不为电池".to_string(),
        });
    }

    // 包装描述验证
    if other_describe == "541"
        && !other_describe_c_addition.contains("包装")
        && !other_describe_c_addition.contains("总净重")
    {
        result.push(CheckResult {
            ok: false,
            result: "与设备包装在一起，其他描述错误".to_string(),
        });
    }

    if other_describe == "542"
        && !other_describe_c_addition.contains("设备内置")
        && !other_describe_c_addition.contains("总净重")
    {
        result.push(CheckResult {
            ok: false,
            result: "安装在设备上，其他描述错误".to_string(),
        });
    }

    // 其他验证
    if current_data.other_describe_checked != "1" {
        result.push(CheckResult {
            ok: false,
            result: "未勾选其他描述".to_string(),
        });
    }

    // 型号验证
    if bty_kind.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "电池型号为空".to_string(),
        });
    }

    if !item_cname.contains(bty_kind) {
        result.push(CheckResult {
            ok: false,
            result: "型号或中文品名错误，电池型号不在项目中文名称中".to_string(),
        });
    }

    if !item_ename.contains(bty_kind) {
        result.push(CheckResult {
            ok: false,
            result: "型号或英文品名错误，电池型号不在项目英文名称中".to_string(),
        });
    }

    // 检验结果验证
    if current_data.inspection_result2 != "0" {
        result.push(CheckResult {
            ok: false,
            result: "检验结果2错误，未勾选锂电池已通过 UN38.3 测试".to_string(),
        });
    }

    if current_data.inspection_result3 != "0" {
        result.push(CheckResult {
            ok: false,
            result: "检验结果3错误，未勾选电池按照规定的质量管理体系进行制造。".to_string(),
        });
    }

    if current_data.inspection_result4 != "0" {
        result.push(CheckResult {
            ok: false,
            result: "检验结果4错误，未勾选该锂电池不属于召回电池，不属于废弃和回收电池。"
                .to_string(),
        });
    }

    // 跌落试验验证
    if current_data.inspection_result5 != "0"
        && other_describe.contains("540")
        && current_data.conclusions == 0
    {
        result.push(CheckResult {
            ok: false,
            result: "单独运输非限制性，未通过1.2米跌落".to_string(),
        });
    }

    // 随附文件验证
    if current_data.inspection_result7 != "2" {
        result.push(CheckResult {
            ok: false,
            result: "随附文件错误，未勾选不适用".to_string(),
        });
    }

    // 鉴别项目验证
    if current_data.inspection_result8 != "2" || current_data.inspection_result9 != "2" {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目8，9 错误，未勾选不适用".to_string(),
        });
    }

    if !current_data.inspection_item8_cn.is_empty()
        || !current_data.inspection_item8_en.is_empty()
        || !current_data.inspection_item9_cn.is_empty()
        || !current_data.inspection_item9_en.is_empty()
    {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目8，9 不为空".to_string(),
        });
    }

    // 添加锂离子电池类型检查
    if ["500", "501", "504"].contains(&bty_type.as_str()) {
        result.extend(check_sek_ion_bty_type(&current_data, &check_map, bty_type));
    } else if ["502", "503", "505"].contains(&bty_type.as_str()) {
        result.extend(check_sek_metal_bty_type(
            &current_data,
            &check_map,
            bty_type,
        ));
    }

    result
}

fn check_sek_ion_bty_type(
    current_data: &SekData,
    check_map: &HashMap<&str, [&str; 2]>,
    bty_type: &str,
) -> Vec<CheckResult> {
    let mut result = Vec::new();

    // 鉴别项目1验证
    if current_data.inspection_item1 != "1111" {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目1错误，未勾选瓦时数".to_string(),
        });
    }

    if current_data.inspection_item1_text1.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目1错误，瓦时数为空".to_string(),
        });
    }

    if !current_data.inspection_item1_text2.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目1错误，锂含量不为空".to_string(),
        });
    }

    // 验证瓦时数
    let watt_hour_from_name = match_watt_hour(&current_data.item_c_name);
    let inspection_result1 = &current_data.inspection_result1;

    if !check_map.get(bty_type).map_or(false, |values| {
        values.contains(&inspection_result1.as_str())
    }) {
        result.push(CheckResult {
            ok: false,
            result: "检验结果1错误，瓦时数取值范围错误".to_string(),
        });
    }

    if watt_hour_from_name > 0.0 {
        if let Ok(inspection_watt) = current_data.inspection_item1_text1.parse::<f32>() {
            if (inspection_watt - watt_hour_from_name).abs() > f32::EPSILON {
                result.push(CheckResult {
                    ok: false,
                    result: "瓦时数与项目名称不匹配".to_string(),
                });
            }
        }
    }

    // 电芯和单芯电池瓦时数验证
    if ["501", "504"].contains(&bty_type) {
        if watt_hour_from_name > 20.0 {
            if inspection_result1 != ">20Wh" {
                result.push(CheckResult {
                    ok: false,
                    result: "瓦时数结果错误，应为>20Wh".to_string(),
                });
            }
        } else {
            if inspection_result1 != "≤20Wh" {
                result.push(CheckResult {
                    ok: false,
                    result: "瓦时数结果错误，应为≤20Wh".to_string(),
                });
            }
        }
    } else {
        if watt_hour_from_name > 100.0 {
            if inspection_result1 != ">100Wh" {
                result.push(CheckResult {
                    ok: false,
                    result: "瓦时数结果错误，应为>100Wh".to_string(),
                });
            }
        } else {
            if inspection_result1 != "≤100Wh" {
                result.push(CheckResult {
                    ok: false,
                    result: "瓦时数结果错误，应为≤100Wh".to_string(),
                });
            }
        }
    }

    // 随附文件验证
    if current_data.inspection_item7 != "1125" {
        result.push(CheckResult {
            ok: false,
            result: "随附文件错误，未勾选锂离子电池".to_string(),
        });
    }

    // 结论验证
    let other_describe = &current_data.other_describe;
    let bty_gross_weight = current_data.bty_gross_weight.parse::<f32>().unwrap_or(0.0);
    let conclusions = current_data.conclusions;

    if [">100Wh", ">20Wh"].contains(&inspection_result1.as_str()) {
        // 危险品验证
        if conclusions != 1 {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，瓦时数大于100Wh或者20Wh，应为危险物品".to_string(),
            });
        }

        // UN编号验证
        if other_describe == "540" && current_data.unno != "UN3480" {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，单独运输，UN编号应为UN3480".to_string(),
            });
        }

        if other_describe != "540" && current_data.unno != "UN3481" && current_data.unno != "UN3171"
        {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，UN编号应为UN3481".to_string(),
            });
        }

        if ["540", "541"].contains(&other_describe.as_str()) && current_data.comment != "1200" {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，危险品物品，单独运输或与设备包装在一起，应达到II级包装性能"
                    .to_string(),
            });
        }
    }

    if ["≤100Wh", "≤20Wh"].contains(&inspection_result1.as_str()) && current_data.unno != "UN3171"
    {
        // 非限制性验证
        if other_describe == "540" && bty_gross_weight > 30.0 {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，单独运输，毛重大于30kg，应为危险品".to_string(),
            });
        }

        if conclusions != 0 {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，瓦时数小于100Wh或者20Wh，应为非限制性".to_string(),
            });
        }
    }

    if current_data.market.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "技术备注为空".to_string(),
        });
    }

    result
}

fn check_sek_metal_bty_type(
    current_data: &SekData,
    check_map: &HashMap<&str, [&str; 2]>,
    bty_type: &str,
) -> Vec<CheckResult> {
    let mut result = Vec::new();

    // 鉴别项目1验证
    if current_data.inspection_item1 != "1112" {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目1错误，未勾选锂含量".to_string(),
        });
    }

    if current_data.inspection_item1_text2.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目1错误，锂含量为空".to_string(),
        });
    }

    if !current_data.inspection_item1_text1.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "鉴别项目1错误，瓦时数不为空".to_string(),
        });
    }

    // 验证锂含量
    let inspection_result1 = &current_data.inspection_result1;
    let li_content = current_data
        .inspection_item1_text2
        .parse::<f32>()
        .unwrap_or(0.0);

    if !check_map.get(bty_type).map_or(false, |values| {
        values.contains(&inspection_result1.as_str())
    }) {
        result.push(CheckResult {
            ok: false,
            result: "检验结果1错误，锂含量取值范围错误".to_string(),
        });
    }

    if li_content != 0.0 {
        if ["503", "505"].contains(&bty_type) {
            if li_content > 1.0 {
                if inspection_result1 != ">1g" {
                    result.push(CheckResult {
                        ok: false,
                        result: "锂含量取值范围错误，应>1g".to_string(),
                    });
                }
            } else {
                if inspection_result1 != "≤1g" {
                    result.push(CheckResult {
                        ok: false,
                        result: "锂含量取值范围错误，应≤1g".to_string(),
                    });
                }
            }
        } else {
            if li_content > 2.0 {
                if inspection_result1 != ">2g" {
                    result.push(CheckResult {
                        ok: false,
                        result: "锂含量取值范围错误，应>2g".to_string(),
                    });
                }
            } else {
                if inspection_result1 != "≤2g" {
                    result.push(CheckResult {
                        ok: false,
                        result: "锂含量取值范围错误，应≤2g".to_string(),
                    });
                }
            }
        }
    }

    // 随附文件验证
    if current_data.inspection_item7 != "1126" {
        result.push(CheckResult {
            ok: false,
            result: "随附文件错误，未勾选锂金属电池".to_string(),
        });
    }

    // 结论验证
    let other_describe = &current_data.other_describe;
    let bty_gross_weight = current_data.bty_gross_weight.parse::<f32>().unwrap_or(0.0);
    let conclusions = current_data.conclusions;

    if [">2g", ">1g"].contains(&inspection_result1.as_str()) {
        // 危险品验证
        if conclusions != 1 {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，锂含量大于1g或2g，应为危险物品".to_string(),
            });
        }

        // UN编号验证
        if other_describe == "540" && current_data.unno != "UN3090" {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，单独运输，UN编号应为UN3090".to_string(),
            });
        }

        if other_describe != "540" && current_data.unno != "UN3091" {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，UN编号应为UN3091".to_string(),
            });
        }

        if ["540", "541"].contains(&other_describe.as_str()) && current_data.comment != "1200" {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，危险品，单独运输或与设备包装在一起，应达到II级包装性能"
                    .to_string(),
            });
        }
    }

    if ["≤100Wh", "≤20Wh"].contains(&inspection_result1.as_str()) {
        // 非限制性验证
        if other_describe == "540" && bty_gross_weight > 30.0 {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，单独运输，毛重大于30kg，应为危险品".to_string(),
            });
        }

        if conclusions != 0 && current_data.unno != "UN3171" {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，锂含量小于1g或2g，应为非限制性".to_string(),
            });
        }
    }

    if current_data.market.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "技术备注为空".to_string(),
        });
    }

    result
}
