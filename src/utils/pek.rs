use serde::{Deserialize, Serialize};

use crate::models::{
    transfer_i64_to_other_describe, transfer_str_to_bty_type, transfer_str_to_pek_pkg_info,
    transfer_str_to_pek_unno, OtherDescribe, PekData, PekPkgInfo, PekUNNO, PkgInfoSubType,
};

use super::{
    get_bty_type_code, get_is_cargo_only, get_is_single_cell, get_pkg_info,
    get_pkg_info_by_pack_cargo, get_pkg_info_subtype, get_un_no, is_battery_label,
    pek_is_dangerous, pkg_info_is_ia, regex::match_watt_hour,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct CheckResult {
    pub(crate) ok: bool,
    pub(crate) result: String,
}

pub fn check_pek_bty_type(current_data: PekData) -> Vec<CheckResult> {
    let mut result = Vec::new();
    let bty_type_string = get_bty_type_code(current_data.clone()).to_string();

    // 基本数据转换
    let item_cname = &current_data.item_c_name;
    let item_ename = &current_data.item_e_name;
    let bty_kind = current_data.model.as_str();

    // 瓦时数转换
    let watt_hour: f32 = current_data
        .inspection_item3_text1
        .parse::<f32>()
        .unwrap_or(0.0);

    let watt_hour_from_name = match_watt_hour(&current_data.item_c_name);

    // 锂含量转换
    let li_content = current_data
        .inspection_item4_text1
        .parse::<f32>()
        .unwrap_or(0.0);

    // 电池数量转换
    let _bty_count = current_data.bty_count.parse::<f32>().unwrap_or(0.0);

    // 净重转换
    let net_weight = current_data.net_weight.parse::<f32>().unwrap_or(0.0);
    // 单芯电池或电芯
    let is_single_cell = get_is_single_cell(transfer_str_to_bty_type(&bty_type_string));
    // 电池形状
    let bty_shape = current_data.shape.as_str();
    // 电池尺寸
    let bty_size = current_data.size.as_str();
    // UN编号
    let unno: PekUNNO = transfer_str_to_pek_unno(&current_data.unno.clone());
    // 电芯
    let is_cell = current_data.type2.to_string() == "1";
    // 危险性类别
    let class_or_division: String = current_data.class_or_div;
    // 操作信息
    let other_describe: String = current_data.other_describe;
    // 客货机
    let pack_passenger_cargo: String = current_data.pack_passenger_cargo;
    // 仅限货机
    let pack_cargo: String = current_data.pack_cargo;
    // 包装类型 0 965 1 966 2 967
    let inspection_item1: OtherDescribe =
        transfer_i64_to_other_describe(current_data.inspection_item1);
    // 是否锂离子电池
    let is_ion: bool = current_data.type1 == 1;
    // 包装类型, 通过UN编号、电池类型、包装类型获取，录入错误的信息可能会导致判断错误
    let pkg_info: PekPkgInfo = get_pkg_info(&unno, is_ion, &inspection_item1);
    // 参见包装说明，可能为空，通常来自于模板
    let inspection_item5_text1: PekPkgInfo =
        transfer_str_to_pek_pkg_info(&current_data.inspection_item5_text1);
    // 结论的包装类型，通常来自于模板
    let pkg_info_by_pack_cargo: PekPkgInfo =
        get_pkg_info_by_pack_cargo(&inspection_item5_text1, &pack_cargo);
    // 第二个包装说明，可能为空, 可以区分I II IA IB，通常来自于模板
    let pkg_info_subtype: PkgInfoSubType =
        get_pkg_info_subtype(&inspection_item5_text1, &pack_cargo);
    // 堆码
    let inspection_item6: i64 = current_data.inspection_item6;
    // 跌落
    let inspection_item2: i64 = current_data.inspection_item2;
    // 是否为充电盒或关联报告
    let is_charge_box_or_related: bool = current_data.other_describe_c_addition.contains("总净重");
    // 是否为危险品，通过包装、电池瓦时、锂含量、净重、电芯类型判断
    let is_dangerous: bool = pek_is_dangerous(
        watt_hour,
        pkg_info.clone(),
        li_content,
        net_weight,
        is_single_cell,
    );
    //随机文件
    let inspection_item5 = current_data.inspection_item5;
    // IA IB
    let is_ia = pkg_info_is_ia(watt_hour, &pkg_info, li_content, net_weight, is_single_cell);
    // 基本验证
    if item_cname.contains("芯") && !["501", "503"].contains(&bty_type_string.as_str()) {
        result.push(CheckResult {
            ok: false,
            result: "电池类型应为电芯".to_string(),
        });
    }

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

    if bty_size.contains("m") && bty_size.contains("M") {
        result.push(CheckResult {
            ok: false,
            result: "电池尺寸缺失单位".to_string(),
        });
    }

    // 形状验证
    if bty_size.contains("Φ")
        || bty_size.contains("φ")
        || bty_size.contains("Ø")
        || bty_size.contains("ø")
    {
        let valid_shapes = [
            "8aad92b65aae82c3015ab094788a0026",
            "8aad92b65d7a7078015d7e1bb1a2245d",
            "521",
            "2c9180838b90642e018bf132f37f5fb2",
        ];
        if !valid_shapes.contains(&bty_shape) {
            result.push(CheckResult {
                ok: false,
                result: "电池形状或尺寸错误，应为扣式 近圆柱体 圆柱体 球形".to_string(),
            });
        }
    }

    // 电池型号验证
    if bty_kind.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "电池型号为空".to_string(),
        });
    }

    // 电池净重验证
    if net_weight == 0.0 && !is_charge_box_or_related {
        result.push(CheckResult {
            ok: false,
            result: "电池净重为空".to_string(),
        });
    }
    // 包装说明验证
    if pkg_info_subtype == PkgInfoSubType::None {
        result.push(CheckResult {
            ok: false,
            result: "包装说明为空".to_string(),
        });
    }

    // 净重限制验证
    if net_weight > 2.5 && pkg_info_subtype == PkgInfoSubType::Pkg968IB {
        result.push(CheckResult {
            ok: false,
            result: "968，IB 电池净重超过2.5kg".to_string(),
        });
    } else if net_weight > 5.0 {
        let weight_limit_types = ["966, II", "967, II", "969, II", "970, II"];
        if weight_limit_types.contains(&pkg_info_subtype.to_string().as_str()) {
            result.push(CheckResult {
                ok: false,
                result: format!("{} 电池净重超过5kg", pkg_info_subtype),
            });
        }
    } else if net_weight > 10.0 && pkg_info_subtype == PkgInfoSubType::Pkg965IB {
        result.push(CheckResult {
            ok: false,
            result: format!("{} 电池净重超过10kg", pkg_info_subtype),
        });
    } else if net_weight > 35.0 {
        let weight_limit_types = ["965, IA", "966, I", "967, I", "968, IA", "969, I", "970, I"];
        if weight_limit_types.contains(&pkg_info_subtype.to_string().as_str()) {
            result.push(CheckResult {
                ok: false,
                result: format!("{} 电池净重超过35kg", pkg_info_subtype),
            });
        }
    }
    if is_cell {
        if other_describe.contains("1791") || other_describe.contains("1794") {
            result.push(CheckResult {
                ok: false,
                result: "物品为电芯，不应勾选: 该电池已经做好防短路...或该锂电池不属于召回电芯..."
                    .to_string(),
            });
        }
    } else {
        if other_describe.contains("1792") || other_describe.contains("1795") {
            result.push(CheckResult {
                ok: false,
                result: "物品为电池，不应勾选: 该电芯已经做好防短路...或该锂电芯不属于召回电芯..."
                    .to_string(),
            });
        }
    }

    // 荷电状态验证
    if matches!(pkg_info, PekPkgInfo::Pkg965)
        && !other_describe.contains("8aad92b65887a3a8015889d0cd7d0093")
    {
        result.push(CheckResult {
            ok: false,
            result: "965 应勾选: 荷电状态≤30%".to_string(),
        });
    }
    if !matches!(pkg_info, PekPkgInfo::Pkg965)
        && other_describe.contains("8aad92b65887a3a8015889d0cd7d0093")
    {
        result.push(CheckResult {
            ok: false,
            result: "非 965 不应勾选: 荷电状态≤30%".to_string(),
        });
    }

    // 描述操作信息
    let other_describe_c_addition = current_data.other_describe_c_addition;
    // 电芯or电池
    if is_cell
        && !other_describe_c_addition.contains("单块电芯")
        && !other_describe_c_addition.contains("总净重")
    {
        result.push(CheckResult {
            ok: false,
            result: "物品为电芯时，描述中不应该出现单块电池".to_string(),
        });
    }
    if !is_cell
        && !other_describe_c_addition.contains("单块电池")
        && !other_describe_c_addition.contains("总净重")
    {
        result.push(CheckResult {
            ok: false,
            result: "物品为电池时，描述中不应该出现单块电芯".to_string(),
        });
    }

    // 包装说明验证
    if pkg_info != pkg_info_by_pack_cargo {
        result.push(CheckResult {
            ok: false,
            result: format!(
                "{}包装，但结论是{}",
                pkg_info.to_string(),
                pkg_info_by_pack_cargo.to_string()
            ),
        });
    }
    if (matches!(pkg_info, PekPkgInfo::Pkg966) || matches!(pkg_info, PekPkgInfo::Pkg969))
        && !other_describe_c_addition.contains("包装在一起")
        && !is_charge_box_or_related
    {
        result.push(CheckResult {
            ok: false,
            result: "与设备包装在一起，其他描述中没有包装在一起5个字".to_string(),
        });
    }
    if (matches!(pkg_info, PekPkgInfo::Pkg967) || matches!(pkg_info, PekPkgInfo::Pkg970))
        && !other_describe_c_addition.contains("设备内置")
        && !is_charge_box_or_related
    {
        result.push(CheckResult {
            ok: false,
            result: "安装在设备上，其他描述中没有设备内置4个字".to_string(),
        });
    }
    let other_describe_checked: bool = current_data.other_describe_checked != "1".to_string();
    if other_describe_checked {
        result.push(CheckResult {
            ok: false,
            result: "未勾选其他描述".to_string(),
        });
    }
    // 品名验证
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

    // 跌落和堆码检测
    if inspection_item6 == 0 && !other_describe.contains("2c9180849267773c0192dc73c77e5fb2") {
        if matches!(inspection_item1, OtherDescribe::Two) {
            result.push(CheckResult {
                ok: false,
                result: "967/970 未勾选堆码，或堆码评估，如果是24年报告请忽略".to_string(),
            });
        }
        let conclusions = current_data.conclusions;
        if matches!(inspection_item1, OtherDescribe::One) && conclusions == 0 {
            result.push(CheckResult {
                ok: false,
                result: "966/969 第II部分未勾选堆码，或堆码评估，如果是24年报告请忽略".to_string(),
            });
        }
    }

    if matches!(pkg_info_subtype, PkgInfoSubType::Pkg965IB) {
        if matches!(inspection_item6, 0) {
            result.push(CheckResult {
                ok: false,
                result: "965, IB 未勾选堆码".to_string(),
            });
        }
        if matches!(inspection_item2, 0) {
            result.push(CheckResult {
                ok: false,
                result: "965, IB 未勾选跌落".to_string(),
            });
        }
    }
    if (matches!(pkg_info_subtype, PkgInfoSubType::Pkg966II)
        || matches!(inspection_item5_text1, PekPkgInfo::Pkg966))
        && inspection_item2 == 0
    {
        result.push(CheckResult {
            ok: false,
            result: "966，II未勾选跌落".to_string(),
        });
    }
    // 检验项目4
    let inspection_item3 = current_data.inspection_item3;

    if inspection_item3 != 1 {
        result.push(CheckResult {
            ok: false,
            result: "检验项目4错误，未勾选锂电池已通过 UN38.3 测试".to_string(),
        });
    }
    // 检查项目5 是否加贴锂电池标记
    let inspection_item4 = current_data.inspection_item4;
    if is_battery_label(&pkg_info_subtype, &bty_shape) {
        if inspection_item4 != 1 {
            if matches!(pkg_info_subtype, PkgInfoSubType::Pkg970II) {
                result.push(CheckResult {
                    ok: false,
                    result: "检验项目5错误，970, II，非纽扣电池，应勾选加贴锂电池标记".to_string(),
                });
            } else {
                result.push(CheckResult {
                    ok: false,
                    result: format!(
                        "检验项目5错误，{}应勾选加贴锂电池标记",
                        &pkg_info_subtype.to_string()
                    ),
                });
            }
        }
    } else {
        if inspection_item4 != 0 {
            if matches!(pkg_info_subtype, PkgInfoSubType::Pkg970II)
                && bty_shape == "8aad92b65aae82c3015ab094788a0026"
            {
                result.push(CheckResult {
                    ok: false,
                    result: "检验项目5错误，设备内置纽扣电池不应勾选加贴锂电池标记".to_string(),
                });
            } else {
                result.push(CheckResult {
                    ok: false,
                    result: format!(
                        "检验项目5错误，{}不应勾选加贴锂电池标记",
                        &pkg_info_subtype.to_string()
                    ),
                });
            }
        }
    }
    if is_dangerous {
        if !matches!(inspection_item5_text1, PekPkgInfo::None) {
            result.push(CheckResult {
                ok: false,
                result: "危险品，参见包装说明应为空".to_string(),
            });
        }
    } else {
        if matches!(inspection_item5_text1, PekPkgInfo::None) {
            result.push(CheckResult {
                ok: false,
                result: "非限制性，包装说明应为数字".to_string(),
            });
        }
    }
    // 检查项目6 是否含随附文件
    if inspection_item5 != 0 {
        result.push(CheckResult {
            ok: false,
            result: "检查项目6错误，附有随机文件应为：否".to_string(),
        });
    }
    // 鉴别项目1
    let inspection_item3_text1 = current_data.inspection_item3_text1;
    let inspection_item4_text1 = current_data.inspection_item4_text1;
    if is_ion {
        if current_data.market.is_empty() {
            result.push(CheckResult {
                ok: false,
                result: "鉴别项目1错误，瓦时数为空".to_string(),
            });
        }
        if !inspection_item4_text1.is_empty() {
            result.push(CheckResult {
                ok: false,
                result: "鉴别项目1错误，锂含量不为空".to_string(),
            });
        }
    } else {
        if !inspection_item3_text1.is_empty() {
            result.push(CheckResult {
                ok: false,
                result: "鉴别项目1错误，瓦时数不为空".to_string(),
            });
        }
        if inspection_item4_text1.is_empty() {
            result.push(CheckResult {
                ok: false,
                result: "鉴别项目1错误，锂含量不为空".to_string(),
            });
        }
    }
    // 验证瓦数数
    if watt_hour_from_name > 0.0 && is_ion && watt_hour != 0.0 {
        if watt_hour_from_name != watt_hour as f32 {
            result.push(CheckResult {
                ok: false,
                result: "瓦时数与项目名称不匹配".to_string(),
            });
        }
    }
    // 结论 非限制性 0 危险品 1
    // DGR规定,资料核实
    let result1 = current_data.result1;
    if result1 != "DGR规定,资料核实".to_string() {
        result.push(CheckResult {
            ok: false,
            result: "DGR规定，资料核实错误，未勾选".to_string(),
        });
    }
    // 是否属于危险品
    // 危险品
    // 结论验证
    let conclusions = current_data.conclusions;
    if conclusions == 1 {
        if !is_dangerous {
            result.push(CheckResult {
                ok: false,
                result:
                    "结论错误，经包装、电池瓦时、锂含量、净重、电芯类型判断，物品为非限制性货物"
                        .to_string(),
            });
        }
        // UN编号验证
        let un_no = get_un_no(&pkg_info_by_pack_cargo, is_ion);
        // 客货机验证
        let is_cargo_only = get_is_cargo_only(&pkg_info, net_weight as i32);
        if is_cargo_only && pack_passenger_cargo != "Forbidden".to_string() {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，客货机禁止运输'".to_string(),
            });
        }
        if unno.clone() != un_no {
            result.push(CheckResult {
                ok: false,
                result: format!("结论错误，UN编号应为{}", un_no),
            });
        }

        // 危险性类别验证
        if class_or_division != "9".to_string() {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，危险性类别应为9".to_string(),
            });
        }
        if inspection_item5_text1 != PekPkgInfo::None {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，危险品，参见包装说明应为空".to_string(),
            });
        }
    } else if conclusions == 0 {
        // 非限制性验证
        if !pack_cargo.is_empty() {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，仅限货机应为空".to_string(),
            });
        }

        if !pack_passenger_cargo.is_empty() {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，客货机应为空".to_string(),
            });
        }

        if !class_or_division.is_empty() {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，危险性类别应为空".to_string(),
            });
        }

        if unno.clone() != PekUNNO::None {
            result.push(CheckResult {
                ok: false,
                result: "结论错误，非限制性，UN编号应为空".to_string(),
            });
        }
    }

    // 数值验证
    if watt_hour.is_nan() && li_content.is_nan() && net_weight.is_nan() {
        result.push(CheckResult {
            ok: false,
            result: "瓦时数，锂含量，净重，三者中有非数字，表单验证可能不准确".to_string(),
        });
    }
    // IA IB 验证
    if is_ia {
        if (matches!(pkg_info_subtype, PkgInfoSubType::Pkg965IB)
            || matches!(pkg_info_subtype, PkgInfoSubType::Pkg968IB))
        {
            result.push(CheckResult {
                ok: false,
                result: "应为IA".to_string(),
            });
        }
    }
    if !is_ia {
        if (matches!(pkg_info_subtype, PkgInfoSubType::Pkg965IA)
            || matches!(pkg_info_subtype, PkgInfoSubType::Pkg968IA))
        {
            result.push(CheckResult {
                ok: false,
                result: "应为IB".to_string(),
            });
        }
    }
    // 技术备注验证
    if current_data.market.is_empty() {
        result.push(CheckResult {
            ok: false,
            result: "技术备注为空".to_string(),
        });
    }
    result
}
