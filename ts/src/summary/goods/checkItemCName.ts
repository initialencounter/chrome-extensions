import { CheckResult } from "../../shared/types/index";

function replaceSpace(str: string) {
  return str.replace(/\s+/g, '')
}

export function checkItemCName(currentDataItemCName: string, goodsInfoItemCName: string): CheckResult[] {
  currentDataItemCName = replaceSpace(currentDataItemCName)
  goodsInfoItemCName = replaceSpace(goodsInfoItemCName)
  if (currentDataItemCName !== goodsInfoItemCName) {
    return [{
      ok: false, result: `图片品名不一致: ${currentDataItemCName} !== ${goodsInfoItemCName}`,
    }]
  }
  return []
}