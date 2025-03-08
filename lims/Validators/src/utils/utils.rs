use crate::models::{
    pkg_info_subtype_from_string, transfer_pek_pkg_info_to_pkg_info_subtype,
    transfer_pkg_info_subtype_to_pek_pkg_info, BtyType, OtherDescribe, PekData, PekPkgInfo,
    PekUNNO, PkgInfoSubType,
};

pub fn get_un_no(pkg_info: &PekPkgInfo, is_ion: bool) -> PekUNNO {
    match pkg_info {
        PekPkgInfo::Pkg965 => PekUNNO::UN3480,
        PekPkgInfo::Pkg966 => PekUNNO::UN3481,
        PekPkgInfo::Pkg967 => PekUNNO::UN3481,
        PekPkgInfo::Pkg968 => PekUNNO::UN3090,
        PekPkgInfo::Pkg969 => PekUNNO::UN3091,
        PekPkgInfo::Pkg970 => PekUNNO::UN3091,
        PekPkgInfo::Pkg952 => {
            if is_ion {
                PekUNNO::UN3556
            } else {
                PekUNNO::UN3557
            }
        }
        _ => PekUNNO::None,
    }
}
pub fn get_is_cargo_only(pkg_info: &PekPkgInfo, net_weight: i32) -> bool {
    match pkg_info {
        PekPkgInfo::Pkg965 => true,
        PekPkgInfo::Pkg968 => true,
        PekPkgInfo::Pkg966 => net_weight > 5,
        PekPkgInfo::Pkg967 => net_weight > 5,
        PekPkgInfo::Pkg969 => net_weight > 5,
        PekPkgInfo::Pkg970 => net_weight > 5,
        _ => false,
    }
}

pub fn get_pkg_info_subtype(
    inspection_item5text1: &PekPkgInfo,
    pack_cargo: &str,
) -> PkgInfoSubType {
    if inspection_item5text1 == &PekPkgInfo::None && pack_cargo == "" {
        return PkgInfoSubType::None;
    }
    let clear_pack_cargo = pack_cargo.replace(|c: char| !c.is_alphanumeric(), "");
    if clear_pack_cargo.is_empty() {
        return transfer_pek_pkg_info_to_pkg_info_subtype(inspection_item5text1);
    }
    if clear_pack_cargo.len() < 3 {
        return PkgInfoSubType::None;
    }
    if clear_pack_cargo == "952" {
        return PkgInfoSubType::Pkg952;
    }
    let sub_type = clear_pack_cargo
        .chars()
        .filter(|c| c.is_ascii_uppercase())
        .collect::<String>();
    return pkg_info_subtype_from_string(&format!("{}, {}", &clear_pack_cargo[..3], sub_type));
}

pub fn get_pkg_info_by_pack_cargo(
    inspection_item5text1: &PekPkgInfo,
    pack_cargo: &str,
) -> PekPkgInfo {
    let pkg_info = get_pkg_info_subtype(inspection_item5text1, pack_cargo);
    return transfer_pkg_info_subtype_to_pek_pkg_info(pkg_info);
}

pub fn is_battery_label(
    pkg_info_sub_type: &PkgInfoSubType,
    shape: &str,
) -> bool {
    return match pkg_info_sub_type {
        PkgInfoSubType::Pkg952 => false,
        PkgInfoSubType::Pkg965IA => false,
        PkgInfoSubType::Pkg966I => false,
        PkgInfoSubType::Pkg967I => false,
        PkgInfoSubType::Pkg968IA => false,
        PkgInfoSubType::Pkg969I => false,
        PkgInfoSubType::Pkg970I => false,
        PkgInfoSubType::Pkg970II => shape != "8aad92b65aae82c3015ab094788a0026",
        PkgInfoSubType::Pkg965IB => true,
        PkgInfoSubType::Pkg966II => true,
        PkgInfoSubType::Pkg967II => true,
        PkgInfoSubType::Pkg968IB => true,
        PkgInfoSubType::Pkg969II => true,
        _ => false,
    };
}

pub fn get_pkg_info(un_no: &PekUNNO, is_ion: bool, other_describe: &OtherDescribe) -> PekPkgInfo {
    match other_describe {
        OtherDescribe::Zero => {
            if is_ion {
                PekPkgInfo::Pkg965
            } else {
                PekPkgInfo::Pkg968
            }
        }
        OtherDescribe::One => {
            if is_ion {
                PekPkgInfo::Pkg966
            } else {
                PekPkgInfo::Pkg969
            }
        }
        OtherDescribe::Two => match un_no {
            PekUNNO::UN3171 => PekPkgInfo::Pkg952,
            PekUNNO::UN3556 => PekPkgInfo::Pkg952,
            PekUNNO::UN3557 => PekPkgInfo::Pkg952,
            _ => {
                if is_ion {
                    PekPkgInfo::Pkg967
                } else {
                    PekPkgInfo::Pkg970
                }
            }
        },
    }
}

pub fn pkg_info_is_ia(
    watt_hour: f32,
    pkg_info: &PekPkgInfo,
    li_content: f32,
    net_weight: f32,
    is_single_cell: bool,
) -> bool {
    if pkg_info == &PekPkgInfo::Pkg965 {
        if watt_hour > 100f32 {
            return true;
        }
        if is_single_cell && watt_hour > 20f32 {
            return true;
        }
        if net_weight > 10f32 {
            return true;
        }
        return false;
    }
    if pkg_info == &PekPkgInfo::Pkg968 {
        if li_content > 2f32 {
            return true;
        }
        if is_single_cell && li_content > 1f32 {
            return true;
        }
        if net_weight > 2.5f32 {
            return true;
        }
        return false;
    }
    false
}

pub fn pek_is_dangerous(
    watt_hour: f32,
    pkg_info: PekPkgInfo,
    li_content: f32,
    net_weight: f32,
    is_single_cell: bool,
) -> bool {
    if watt_hour > 100f32 {
        return true;
    }

    if watt_hour > 20f32 && is_single_cell {
        return true;
    }
    if li_content > 2f32 {
        return true;
    }
    if li_content > 1f32 && is_single_cell {
        return true;
    }
    return match pkg_info {
        PekPkgInfo::Pkg965 => true,
        PekPkgInfo::Pkg968 => true,
        PekPkgInfo::Pkg952 => true,
        PekPkgInfo::Pkg966 => {
            if net_weight > 5f32 {
                return true;
            }
            false
        }
        PekPkgInfo::Pkg967 => {
            if net_weight > 5f32 {
                return true;
            }
            false
        }
        PekPkgInfo::Pkg969 => {
            if net_weight > 5f32 {
                return true;
            }
            false
        }
        PekPkgInfo::Pkg970 => {
            if net_weight > 5f32 {
                return true;
            }
            false
        }
        _ => false,
    };
}

// 锂离子电池 锂离子电芯 锂金属电池 锂金属电芯 单芯锂离子电池 单芯锂金属电池
// '500'     | '501'   | '502'   | '503'   | '504'       | '505'
pub fn get_is_single_cell(bty_type: BtyType) -> bool {
    if bty_type == BtyType::Bty500 || bty_type == BtyType::Bty502 {
        return false;
    }
    return true;
}

pub fn get_bty_type_code(current_data: PekData) -> BtyType {
    let is_ion: bool = current_data.type1 == 1i64;
    let is_cell: bool = current_data.type2 == 1i64;
    let is_single_cell: bool = current_data.other_describe.contains("1790");
    if is_ion {
        if is_cell {
            return BtyType::Bty501;
        } else {
            if is_single_cell {
                BtyType::Bty504
            } else {
                BtyType::Bty500
            }
        }
    } else {
        if is_cell {
            return BtyType::Bty503;
        } else {
            if is_single_cell {
                BtyType::Bty505
            } else {
                BtyType::Bty502
            }
        }
    }
}

pub fn parse_net_weight(net_weight: &str) -> f32 {
    let net_weight = net_weight.replace(|c: char| c == ' ' || c == '＜', "");
    if net_weight.is_empty() {
        return 0.0;
    }
    match net_weight.as_str() {
        "<5" => 4.9,
        "＜5" => 4.9,
        "<35" => 34.9,
        "＜35" => 34.9,
        _ => net_weight.parse::<f32>().unwrap_or(0.0),
    }
}