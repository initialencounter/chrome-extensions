import Schema from 'schemastery'

export interface Config {
  enableCopyProjectNo?: boolean
  enableCopyProjectName?: boolean
  enablePreventCloseBeforeSave?: boolean
  enableSaveHotKey?: boolean
  enableImportHotKey?: boolean
  enableSetImportProjectNo?: boolean
  enableSetQueryProjectNo?: boolean
  enableSetImportClassification?: boolean
  selfId?: string
  enableSetEntrust?: boolean
  customIcon?: boolean
  onekeyRollback?: boolean
  nextYearColor?: string
  nextYearBgColor?: string
}

export const Config: Schema<Config> = Schema.object({
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
    .description(`保存快捷键 （使用快捷键 *Ctrl + C* 将保存检验单）`)
    .default(true),
  enableImportHotKey: Schema.boolean()
    .description(`导入快捷键 （使用快捷键 *Ctrl + D* 将打开导入窗口）`)
    .default(true),
  enableSetImportProjectNo: Schema.boolean()
    .description(`设置导入项目编号 （在导入窗口中，自动填充项目编号）`)
    .default(true),
  enableSetQueryProjectNo: Schema.boolean()
    .description(`设置查询项目编号 （在查询窗口中，自动填充项目编号）`)
    .default(true),
  enableSetImportClassification: Schema.boolean()
    .description(`设置导入分类 （在导入窗口中，自动填充分类）`)
    .default(true),
  selfId: Schema.string().description('占位').default(''),
  enableSetEntrust: Schema.boolean()
    .description(`自动设置初验的内容`)
    .default(true),
  customIcon: Schema.boolean().description('自定义图标（用更显眼的图标来区分空海运）').default(false),
  onekeyRollback: Schema.boolean().description('一键回退').default(true),
  nextYearColor: Schema.string().description('下一年报告字体颜色').default(''),
  nextYearBgColor: Schema.string().description('下一年报告背景颜色').default('#76EEC6'),
}).description('设置')
