import Schema from 'schemastery'

export interface Config {
  enableCopyProjectNo: boolean
  selfId: string
}

export const Config: Schema<Config> = Schema.object({
  enableCopyProjectNo: Schema.boolean()
    .description(
      `复制项目编号 （点击项目编号，或者双击 *Ctrl*，即可将项目编号复制到剪切板）`
    )
    .default(true),
  selfId: Schema.string().description('占位').default(''),
}).description('设置')
