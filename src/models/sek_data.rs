use serde::{Serialize, Deserialize};

/// SekData
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SekData {
    pub according: String,

    pub appraise_date: String,

    pub appraiser: String,

    pub appraiser_name: String,

    pub bty_brand: String,

    pub bty_color: String,

    pub bty_count: String,

    pub bty_count_checked: String,

    pub bty_gross_weight: String,

    pub bty_gross_weight_checked: Option<serde_json::Value>,

    pub bty_kind: String,

    pub bty_net_weight: String,

    pub bty_net_weight_checked: String,

    pub bty_shape: String,

    pub bty_size: String,

    pub bty_type: String,

    pub check_date: Option<serde_json::Value>,

    pub checked: bool,

    pub checker: Option<serde_json::Value>,

    pub checker_name: Option<serde_json::Value>,

    pub check_location: String,

    pub check_location_name: String,

    pub class_or_div: String,

    pub comment: String,

    pub comment_extra: String,

    pub conclusions: i64,

    pub created_by: String,

    pub created_date: String,

    pub edit_status: i64,

    pub id: String,

    pub inspection_item1: String,

    pub inspection_item1_text1: String,

    pub inspection_item1_text2: String,

    pub inspection_item2: String,

    pub inspection_item3: String,

    pub inspection_item4: String,

    pub inspection_item5: String,

    pub inspection_item6: String,

    pub inspection_item7: String,

    pub inspection_item8_cn: String,

    pub inspection_item8_en: String,

    pub inspection_item9_cn: String,

    pub inspection_item9_en: String,

    pub inspection_result1: String,

    pub inspection_result2: String,

    pub inspection_result3: String,

    pub inspection_result4: String,

    pub inspection_result5: String,

    pub inspection_result6: String,

    pub inspection_result7: String,

    pub inspection_result8: String,

    pub inspection_result9: String,

    pub item_c_name: String,

    pub item_e_name: String,

    pub market: String,

    pub modified_by: String,

    pub modified_date: String,

    pub other_describe: String,

    pub other_describe_c_addition: String,

    pub other_describe_checked: String,

    pub other_describe_e_addition: String,

    pub pg: String,

    pub principal_name: Option<serde_json::Value>,

    pub project_id: String,

    pub project_no: String,

    pub psn: String,

    pub remarks: String,

    pub unno: String,
}