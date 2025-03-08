use serde::{Deserialize, Serialize};

/// PekData
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PekData {
    /// 依据
    pub according: String,

    /// 委托日期
    pub appraise_date: String,

    /// 委托人
    pub appraiser: String,

    /// 委托人名称
    pub appraiser_name: String,

    /// 商标
    pub brands: String,

    /// 包装件数量
    pub bty_count: String,

    /// 检查日期
    pub check_date: Option<serde_json::Value>,

    pub checked: bool,

    /// 检查人
    pub checker: Option<serde_json::Value>,

    /// 审核人
    pub checker_name: Option<serde_json::Value>,

    /// 检查地点
    pub check_location: String,

    /// 检查地点名称
    pub check_location_name: String,

    /// 危险性类别
    pub class_or_div: String,

    /// 颜色
    pub color: String,

    /// 结论 0: 非限制性 1：危险品
    pub conclusions: i64,

    /// 创建人
    pub created_by: String,

    /// 创建日期
    pub created_date: String,

    /// 编辑状态
    pub edit_status: i64,

    /// 毛重
    pub gross_weight: String,

    /// id
    pub id: String,

    /// 0：单独包装，防止短路 1：966 2：967
    pub inspection_item1: i64,

    /// 检查项目1文本1
    pub inspection_item1_text1: String,

    pub inspection_item1_text2: String,

    /// 检查项目1文本3
    pub inspection_item1_text3: String,

    /// 检查项目1文本4
    pub inspection_item1_text4: String,

    /// 提供测试报告，通过1.2米跌落试验 1：是 0：否
    pub inspection_item2: i64,

    /// 电压
    pub inspection_item2_text1: String,

    /// 容量
    pub inspection_item2_text2: String,

    /// 提供并通过UN38.3标准实验 1：是 0：否
    pub inspection_item3: i64,

    /// 瓦时数
    pub inspection_item3_text1: String,

    /// 加贴锂电池标记 1：是 0：否
    pub inspection_item4: i64,

    // 锂含量
    pub inspection_item4_text1: String,

    /// 附有随机文件 1：是 0：否
    pub inspection_item5: i64,

    /// 参加包装说明
    pub inspection_item5_text1: String,

    /// 包装件通过3米堆码试验 0：是 1：否
    pub inspection_item6: i64,

    /// 物品中文名称
    pub item_c_name: String,

    /// 物品英文名称
    pub item_e_name: String,

    /// 技术部备注
    pub market: String,

    /// 型号
    pub model: String,

    /// 修改人
    pub modified_by: String,

    /// 修改日期
    pub modified_date: String,

    /// 净重
    pub net_weight: String,

    /// 操作信息
    pub other_describe: String,

    /// 附加操作信息中文
    pub other_describe_c_addition: String,

    /// 勾选附加操作信息 1：是 0：否
    pub other_describe_checked: String,

    /// 附加操作信息英文
    pub other_describe_e_addition: String,

    /// 仅限货机包装说明
    pub pack_cargo: String,

    /// 客货机
    pub pack_passenger_cargo: String,

    pub pack_special: String,

    pub pack_sub_danger: String,

    /// 包装等级
    pub pg: String,

    pub principal_name: Option<serde_json::Value>,

    /// 项目id
    pub project_id: String,

    /// 项目编号
    pub project_no: String,

    /// 运输专有名称
    pub psn: String,

    pub remarks: String,

    /// DGR规定,资料核实
    pub result1: String,

    /// 形状
    pub shape: String,

    /// 尺寸
    pub size: String,

    /// 电池类型 0：锂金属电池 1：锂离子电池
    pub type1: i64,

    /// 电池类型 0：电池 1：电芯
    pub type2: i64,

    /// UN编号
    pub unno: String,
}