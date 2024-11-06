import Schema from 'schemastery'

export interface Config {
  enableCopyProjectNo?: boolean
  enableCopyProjectName?: boolean
  enablePreventCloseBeforeSave?: boolean
  enableSaveHotKey?: boolean
  enableImportHotKey?: boolean
  enableSetImportProjectNo?: boolean
  autoProjectNoPreset?: boolean
  pekProjectNoPreset?: string
  sekProjectNoPreset?: string
  enableSetQueryProjectNo?: boolean
  enableSetImportClassification?: boolean
  enableSetEntrust?: boolean
  category?: 0 | 1 | 2 | 3
  moonPay?: boolean
  amount?: string
  tagNextYear?: boolean
  customIcon?: boolean
  onekeyAssign?: boolean
  onekeyRollback?: boolean
  nextYearColor?: string
  nextYearBgColor?: string
  verify?: boolean
}

export const Config: Schema<Config> = Schema.intersect([
  // 业务受理 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Schema.object({
    onekeyAssign: Schema.boolean().description('一键分配').default(true),
  }).description("业务受理"),

  // 初验 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Schema.object({
    enableSetEntrust: Schema.boolean()
      .description(`自动设置初验的内容`)
      .default(true),

  }).description("初验"),
  Schema.union([
    Schema.object({
      enableSetEntrust: Schema.const(true),
      category: Schema.union([
        Schema.const(0).description('化学品'),
        Schema.const(1).description('锂电池类'),
        Schema.const(2).description('器械类'),
        Schema.const(3).description('磁性物质'),
      ]).description(`分类`).default(1),
      moonPay: Schema.boolean().description(`月结`).default(true),
      amount: Schema.string().description(`金额`).default('500.00'),
      tagNextYear: Schema.boolean().description(`导入项目后，标记为下一年报告`).default(false),
    }),
    Schema.object({
      enableSetEntrust: Schema.const(false),
    }),
  ]),
  // 样品检验 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Schema.object({
    onekeyRollback: Schema.boolean().description('一键回退').default(true),
  }).description("样品检验"),

  // 样品检验-主界面 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Schema.object({
    verify: Schema.boolean().description('表单验证（仅限锂电池），验证规则详见[rule](https://lims.initenc.cn/rule.html)，欢迎补充').default(true),
    enableCopyProjectNo: Schema.boolean()
      .description(
        `复制项目编号 （点击项目编号，或者双击 *Ctrl*，即可将项目编号复制到剪切板）`
      )
      .default(true),
    enableCopyProjectName: Schema.boolean()
      .description(
        `复制项目名称 （双击项目名称，或者按住 *Ctrl* 键并双击两次 *C* 键，即可将项目名称复制到剪切板）`
      )
      .default(true),
    enablePreventCloseBeforeSave: Schema.boolean()
      .description(`保存前阻止关闭 （当有未保存的数据时，关闭页面时会弹出提示）`)
      .default(true),
    enableSaveHotKey: Schema.boolean()
      .description(`保存快捷键 （使用快捷键 *Ctrl + S* 将保存检验单）`)
      .default(true),
    enableImportHotKey: Schema.boolean()
      .description(`导入快捷键 （使用快捷键 *Ctrl + D* 将打开导入窗口）`)
      .default(true),
    customIcon: Schema.boolean().description('自定义标签页图标（用更显眼的图标来区分空海运）').default(false),
  }).description('样品检验-主界面'),

  // 样品检验-导入 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Schema.object({
    enableSetImportProjectNo: Schema.boolean()
      .description(`自动填充剪切板中的项目编号`)
      .default(true),
    enableSetImportClassification: Schema.boolean()
      .description(`根据品名，自动填充分类`)
      .default(true),
    autoProjectNoPreset: Schema.boolean().description(`自动设置检验单编号前缀`).default(false),
  }).description('样品检验-导入-查询'),
  Schema.union([
    Schema.object({
      autoProjectNoPreset: Schema.const(false),
      pekProjectNoPreset: Schema.string().description(`手动设置空运检验单编号前缀`).default('PEKGZ2024'),
      sekProjectNoPreset: Schema.string().description(`手动设置海运检验单编号前缀`).default('SEKGZ2024'),
    }),
    Schema.object({
      autoProjectNoPreset: Schema.const(true),
    }),
  ]),

  // 样品检验单查询 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Schema.object({
    enableSetQueryProjectNo: Schema.boolean()
      .description(`设置查询项目编号 （在查询窗口中，自动填充项目编号）`)
      .default(false),
  }).description('样品检验单查询'),

  // 主题设置 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Schema.object({
    nextYearColor: Schema.string().description('下一年报告字体颜色').default(''),
    nextYearBgColor: Schema.string().description('下一年报告背景颜色').default('#76EEC6'),
  }).description('主题设置')
])