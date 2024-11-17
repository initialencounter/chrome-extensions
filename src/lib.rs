use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::from_value;

use models::pek::PekData;
use models::sek::SekData;
use utils::{check_pek_bty_type, check_sek_bty_type};

mod models;
mod utils;

#[wasm_bindgen]
pub fn check_pek_bty(data: JsValue) -> Result<JsValue, JsError> {
    let data: PekData = from_value(data).unwrap();
    let result = check_pek_bty_type(data);
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[wasm_bindgen]
pub fn check_sek_bty(data: JsValue) -> Result<JsValue, JsError> {
    let data: SekData = from_value(data).unwrap();
    let result = check_sek_bty_type(data);
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[cfg(test)]
mod tests {
    use std::fs;

    use super::*;

    #[test]
    fn it_works() {
        for i in 1..=164 {
            let data = fs::read_to_string(format!("tests/data/pek/data{}.json", i)).unwrap();
            let data: PekData = serde_json::from_str(&data).unwrap();
            let result = check_pek_bty_type(data);
            if result.len() > 0 {
                if result.len() == 1 {
                    if result[0].result.contains("如果是24年报告请忽略") {
                        continue;
                    }
                }
                println!("id: ------------  {}", i);
                println!("{:?}", result);
            }
        }
        assert_eq!(0, 0);
    }
    #[test]
    fn sek_works() {
        for i in 0..199 {
            let data = fs::read_to_string(format!("tests/data/sek/{}.json", i)).unwrap();
            let data: SekData = serde_json::from_str(&data).unwrap();
            let result = check_sek_bty_type(data);
            if result.len() > 0 {
                println!("id: ------------  {}", i);
                println!("{:?}", result);
            }
        }
    }


    #[test]
    fn prepare_pek_data() {
        for i in 181..=181 {
            fs::write(format!("tests/data/pek/data{}.json", i), "").unwrap();
        }

        assert_eq!(0, 0);
    }
    #[test]
    fn prepare_sek_data() {
        let data = match fs::read_to_string("tests/data/sek/data2.json") {
            Ok(data) => data,
            Err(e) => {
                println!("Error1: {}", e);
                return;
            }
        };
        let data: Vec<SekData> = match serde_json::from_str(&data) {
            Ok(data) => data,
            Err(e) => {
                println!("Error2: {}", e);
                return;
            }
        };
        for i in 0..data.len() {
            println!("{}", i);
            let content = match serde_json::to_string(&data[i]) {
                Ok(content) => content,
                Err(e) => {
                    println!("Error3: {}", e);
                    return;
                }
            };
            fs::write(format!("tests/data/sek/{}.json", i + 99), content).unwrap();
        }
        assert_eq!(0, 0);
    }
}
