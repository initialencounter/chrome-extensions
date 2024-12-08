use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref WATT_HOUR_REGEX: Regex = Regex::new(r"\s(\d+\.{0,1}\d+)[Kk]?[Ww][Hh]").unwrap();
    static ref NUMBER_REGEX: Regex = Regex::new(r"[0-9]+(\.\d*)?").unwrap();
    static ref VOLTAGE_REGEX: Regex = Regex::new(r"(\d+\.{0,1}\d*)[Vv]").unwrap();
    static ref CAPACITY_REGEX: Regex = Regex::new(r"(\d+\.{0,1}\d*)[Mm]?[Aa][Hh]").unwrap();
}

pub fn match_watt_hour(project_name: &str) -> f32 {
    let captures: Vec<f32> = WATT_HOUR_REGEX
        .captures_iter(project_name)
        .filter_map(|cap| cap[1].parse::<f32>().ok())
        .collect();

    if captures.is_empty() {
        return 0.0;
    }

    let mut watt_hour = captures[captures.len() - 1];

    if project_name.to_lowercase().contains("kwh") {
        watt_hour *= 1000.0;
    }

    watt_hour
}

pub fn match_number(num: &str) -> f32 {
    let num = num.replace(|c: char| c == ' ', "");
    NUMBER_REGEX
        .captures_iter(num.as_str())
        .filter_map(|cap| cap[0].parse::<f32>().ok())
        .next()
        .unwrap_or(0.0)
}

pub fn match_voltage(project_name: &str) -> f32 {
    let captures: Vec<f32> = VOLTAGE_REGEX
        .captures_iter(project_name)
        .filter_map(|cap| cap[1].parse::<f32>().ok())
        .collect();
    if captures.is_empty() {
        return 0.0;
    }
    let voltage = captures[captures.len() - 1];
    voltage
}

pub fn match_capacity(project_name: &str) -> f32 {
    let captures: Vec<f32> = CAPACITY_REGEX
        .captures_iter(project_name)
        .filter_map(|cap| cap[1].parse::<f32>().ok())
        .collect();
    if captures.is_empty() {
        return 0.0;
    }
    let mut capacity = captures[captures.len() - 1];
    if !project_name.to_lowercase().contains("mah") {
        capacity *= 1000.0;
    }
    capacity
}
