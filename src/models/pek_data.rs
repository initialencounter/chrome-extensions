use serde::{Serialize, Deserialize};

/// PekData
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PekData {
    pub according: String,

    pub appraise_date: String,

    pub appraiser: String,

    pub appraiser_name: String,

    pub brands: String,

    pub bty_count: String,

    pub check_date: Option<serde_json::Value>,

    pub checked: bool,

    pub checker: Option<serde_json::Value>,

    pub checker_name: Option<serde_json::Value>,

    pub check_location: String,

    pub check_location_name: String,

    pub class_or_div: String,

    pub color: String,

    pub conclusions: i64,

    pub created_by: String,

    pub created_date: String,

    pub edit_status: i64,

    pub gross_weight: String,

    pub id: String,

    pub inspection_item1: i64,

    pub inspection_item1_text1: String,

    pub inspection_item1_text2: String,

    pub inspection_item1_text3: String,

    pub inspection_item1_text4: String,

    pub inspection_item2: i64,

    pub inspection_item2_text1: String,

    pub inspection_item2_text2: String,

    pub inspection_item3: i64,

    pub inspection_item3_text1: String,

    pub inspection_item4: i64,

    pub inspection_item4_text1: String,

    pub inspection_item5: i64,

    pub inspection_item5_text1: String,

    pub inspection_item6: i64,

    pub item_c_name: String,

    pub item_e_name: String,

    pub market: String,

    pub model: String,

    pub modified_by: String,

    pub modified_date: String,

    pub net_weight: String,

    pub other_describe: String,

    pub other_describe_c_addition: String,

    pub other_describe_checked: String,

    pub other_describe_e_addition: String,

    pub pack_cargo: String,

    pub pack_passenger_cargo: String,

    pub pack_special: String,

    pub pack_sub_danger: String,

    pub pg: String,

    pub principal_name: Option<serde_json::Value>,

    pub project_id: String,

    pub project_no: String,

    pub psn: String,

    pub remarks: String,

    pub result1: String,

    pub shape: String,

    pub size: String,

    pub type1: i64,

    pub type2: i64,

    pub unno: String,
}