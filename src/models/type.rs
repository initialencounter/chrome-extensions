use std::fmt;

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum PekUNNO {
    None,
    UN3480,
    UN3481,
    UN3090,
    UN3091,
    UN3171,
    UN3556,
    UN3557,
    UN3558,
}
impl fmt::Display for PekUNNO {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PekUNNO::None => write!(f, ""),
            PekUNNO::UN3480 => write!(f, "UN3480"),
            PekUNNO::UN3481 => write!(f, "UN3481"),
            PekUNNO::UN3090 => write!(f, "UN3090"),
            PekUNNO::UN3091 => write!(f, "UN3091"),
            PekUNNO::UN3171 => write!(f, "UN3171"),
            PekUNNO::UN3556 => write!(f, "UN3556"),
            PekUNNO::UN3557 => write!(f, "UN3557"),
            PekUNNO::UN3558 => write!(f, "UN3558"),
        }
    }
}

pub fn transfer_str_to_pek_unno(unno_string: &str) -> PekUNNO {
    match unno_string {
        "UN3480" => PekUNNO::UN3480,
        "UN3481" => PekUNNO::UN3481,
        "UN3090" => PekUNNO::UN3090,
        "UN3091" => PekUNNO::UN3091,
        "UN3171" => PekUNNO::UN3171,
        "UN3556" => PekUNNO::UN3556,
        "UN3557" => PekUNNO::UN3557,
        "UN3558" => PekUNNO::UN3558,
        _ => PekUNNO::None,
    }
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum PekPkgInfo {
    None,
    Pkg965,
    Pkg966,
    Pkg967,
    Pkg968,
    Pkg969,
    Pkg970,
    Pkg952,
}

impl fmt::Display for PekPkgInfo {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PekPkgInfo::None => write!(f, ""),
            PekPkgInfo::Pkg965 => write!(f, "965"),
            PekPkgInfo::Pkg966 => write!(f, "966"),
            PekPkgInfo::Pkg967 => write!(f, "967"),
            PekPkgInfo::Pkg968 => write!(f, "968"),
            PekPkgInfo::Pkg969 => write!(f, "969"),
            PekPkgInfo::Pkg970 => write!(f, "970"),
            PekPkgInfo::Pkg952 => write!(f, "952"),
        }
    }
}

pub fn transfer_str_to_pek_pkg_info(pkg_info_string: &str) -> PekPkgInfo {
    match pkg_info_string {
        "965" => PekPkgInfo::Pkg965,
        "966" => PekPkgInfo::Pkg966,
        "967" => PekPkgInfo::Pkg967,
        "968" => PekPkgInfo::Pkg968,
        "969" => PekPkgInfo::Pkg969,
        "970" => PekPkgInfo::Pkg970,
        _ => PekPkgInfo::None,
    }
}
pub fn transfer_pkg_info_subtype_to_pek_pkg_info(pkg_info_subtype: PkgInfoSubType) -> PekPkgInfo {
    match pkg_info_subtype {
        PkgInfoSubType::Pkg968IB => PekPkgInfo::Pkg968,
        PkgInfoSubType::Pkg966II => PekPkgInfo::Pkg966,
        PkgInfoSubType::Pkg967II => PekPkgInfo::Pkg967,
        PkgInfoSubType::Pkg969II => PekPkgInfo::Pkg969,
        PkgInfoSubType::Pkg970II => PekPkgInfo::Pkg970,
        PkgInfoSubType::Pkg965IB => PekPkgInfo::Pkg965,
        PkgInfoSubType::Pkg965IA => PekPkgInfo::Pkg965,
        PkgInfoSubType::Pkg966I => PekPkgInfo::Pkg966,
        PkgInfoSubType::Pkg967I => PekPkgInfo::Pkg967,
        PkgInfoSubType::Pkg968IA => PekPkgInfo::Pkg968,
        PkgInfoSubType::Pkg969I => PekPkgInfo::Pkg969,
        PkgInfoSubType::Pkg970I => PekPkgInfo::Pkg970,
        PkgInfoSubType::Pkg952 => PekPkgInfo::Pkg952,
        _ => PekPkgInfo::None,
    }
}
#[derive(Debug, PartialEq, Eq, Clone)]
pub enum PkgInfoSubType {
    None,
    Pkg968IB,
    Pkg966II,
    Pkg967II,
    Pkg969II,
    Pkg970II,
    Pkg965IB,
    Pkg965IA,
    Pkg966I,
    Pkg967I,
    Pkg968IA,
    Pkg969I,
    Pkg970I,
    Pkg952,
}

impl fmt::Display for PkgInfoSubType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PkgInfoSubType::None => write!(f, ""),
            PkgInfoSubType::Pkg968IB => write!(f, "968, IB"),
            PkgInfoSubType::Pkg966II => write!(f, "966, II"),
            PkgInfoSubType::Pkg967II => write!(f, "967, II"),
            PkgInfoSubType::Pkg969II => write!(f, "969, II"),
            PkgInfoSubType::Pkg970II => write!(f, "970, II"),
            PkgInfoSubType::Pkg965IB => write!(f, "965, IB"),
            PkgInfoSubType::Pkg965IA => write!(f, "965, IA"),
            PkgInfoSubType::Pkg966I => write!(f, "966, I"),
            PkgInfoSubType::Pkg967I => write!(f, "967, I"),
            PkgInfoSubType::Pkg968IA => write!(f, "968, IA"),
            PkgInfoSubType::Pkg969I => write!(f, "969, I"),
            PkgInfoSubType::Pkg970I => write!(f, "970, I"),
            PkgInfoSubType::Pkg952 => write!(f, "952"),
        }
    }
}

pub fn transfer_pek_pkg_info_to_pkg_info_subtype(pek_pkg_info: &PekPkgInfo) -> PkgInfoSubType {
    match pek_pkg_info {
        PekPkgInfo::Pkg966 => PkgInfoSubType::Pkg966II,
        PekPkgInfo::Pkg967 => PkgInfoSubType::Pkg967II,
        PekPkgInfo::Pkg969 => PkgInfoSubType::Pkg969II,
        PekPkgInfo::Pkg970 => PkgInfoSubType::Pkg970II,
        _ => PkgInfoSubType::None,
    }
}

pub fn pkg_info_subtype_from_string(string: &str) -> PkgInfoSubType {
    match string {
        "968, IB" => PkgInfoSubType::Pkg968IB,
        "966, II" => PkgInfoSubType::Pkg966II,
        "967, II" => PkgInfoSubType::Pkg967II,
        "969, II" => PkgInfoSubType::Pkg969II,
        "970, II" => PkgInfoSubType::Pkg970II,
        "965, IB" => PkgInfoSubType::Pkg965IB,
        "965, IA" => PkgInfoSubType::Pkg965IA,
        "966, I" => PkgInfoSubType::Pkg966I,
        "967, I" => PkgInfoSubType::Pkg967I,
        "968, IA" => PkgInfoSubType::Pkg968IA,
        "969, I" => PkgInfoSubType::Pkg969I,
        "970, I" => PkgInfoSubType::Pkg970I,
        "952" => PkgInfoSubType::Pkg952,
        _ => PkgInfoSubType::None,
    }
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum OtherDescribe {
    Zero,
    One,
    Two,
}

impl fmt::Display for OtherDescribe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            OtherDescribe::Zero => write!(f, "0"),
            OtherDescribe::One => write!(f, "1"),
            OtherDescribe::Two => write!(f, "2"),
        }
    }
}

pub fn transfer_i64_to_other_describe(i64: i64) -> OtherDescribe {
    match i64 {
        0 => OtherDescribe::Zero,
        1 => OtherDescribe::One,
        2 => OtherDescribe::Two,
        _ => OtherDescribe::Zero,
    }
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum BtyType {
    Bty500,
    Bty501,
    Bty502,
    Bty503,
    Bty504,
    Bty505,
}

impl fmt::Display for BtyType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            BtyType::Bty500 => write!(f, "500"),
            BtyType::Bty501 => write!(f, "501"),
            BtyType::Bty502 => write!(f, "502"),
            BtyType::Bty503 => write!(f, "503"),
            BtyType::Bty504 => write!(f, "504"),
            BtyType::Bty505 => write!(f, "505"),
        }
    }
}

pub fn transfer_str_to_bty_type(bty_type_string: &str) -> BtyType {
    match bty_type_string {
        "500" => BtyType::Bty500,
        "501" => BtyType::Bty501,
        "502" => BtyType::Bty502,
        "503" => BtyType::Bty503,
        "504" => BtyType::Bty504,
        "505" => BtyType::Bty505,
        _ => BtyType::Bty500,
    }
}
