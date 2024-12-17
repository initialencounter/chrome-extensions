import { CheckResult } from "../shared/types/index"

// 检查日期 2024-11-06
export function checkIssueDate(issue_date: string, projectNo: string): CheckResult[] {
  // 解析输入的日期
  const inputDate = new Date(issue_date)
  // 获取今天的日期，并设置时分秒为0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = inputDate.getTime() - today.getTime()

  const projectDate = parseProjectData(projectNo)
  const diffProjectTime = inputDate.getTime() - projectDate.getTime()
  let result: CheckResult[] = []
  if (diffProjectTime < 0) {
    result.push({
      ok: false,
      result: '签发日期早于项目编号日期'
    })
  }
  // 如果日期差大于等于1天或小于-1天，返回false
  if (diffTime > 0) {
    result.push({
      ok: false,
      result: '签发日期晚于今天'
    })
  }
  return result
}

function parseProjectData(projectNo: string) {
  const year = projectNo.slice(5, 9)
  const month = projectNo.slice(9, 11)
  const day = projectNo.slice(11, 13)
  let date = `${year}-${month}-${day}`
  return new Date(date)
}
