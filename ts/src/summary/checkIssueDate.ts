import { CheckResult } from "../shared/types/index"

// 检查日期 2024-11-06
export function checkIssueDate(issue_date: string): CheckResult[] {
  // 解析输入的日期
  const inputDate = new Date(issue_date)
  // 获取今天的日期，并设置时分秒为0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 计算日期差值（毫秒）
  const diffTime = inputDate.getTime() - today.getTime()
  // 转换为天数
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  // 如果日期差大于等于1天或小于-1天，返回false
  if (diffDays >= 1 || diffDays < -1) {
    return [{
      ok: false,
      result: `概要签发日期可能错误, 概要上为${issue_date}`
    }]
  }
  return []
}