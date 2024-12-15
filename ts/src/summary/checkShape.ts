import { shapeMap } from "../shared/appearence/index"
import { CheckResult } from "../shared/types/index"

export function checkShape(formShape: string, summaryShape: string): CheckResult[] {
  const shapeText = summaryShape.trim().split('色')[1]
  let formShapeChineseName = ''
  let summaryShapeId = ''
  shapeMap.forEach(item => {
    if (formShape === item.id) {
      formShapeChineseName = item.chineseName
    }
    if (item.chineseName === shapeText) {
      summaryShapeId = item.id
    }
  })
  if (formShape !== summaryShapeId && summaryShapeId) {
    return [{
      ok: false,
      result: `形状不一致, 系统上为${formShapeChineseName}, 概要上为${shapeText}`
    }]
  }
  return []
}