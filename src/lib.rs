mod utils;
mod models;

use models::pek_data::PekData;
use models::sek_data::SekData;

use wasm_bindgen::prelude::*;
use utils::check_pek_bty_type;

#[wasm_bindgen]
pub fn check_pek_bty(data: String) -> String {
    let data: PekData = serde_json::from_str(&data).unwrap();
    let result = check_pek_bty_type(data);
    serde_json::to_string(&result).expect("Failed to serialize result")
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
    // #[test]
    // fn clear_data() {
    //     for i in 181..=181 {
    //         fs::write(format!("tests/data/pek/data{}.json", i), "").unwrap();
    //     }
        
    //     assert_eq!(0, 0);
    // }
}
