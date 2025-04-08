import { baseCheck } from "./baseCheck";
import { SummaryFromLLM, SummaryInfo } from "../shared/types/attachment";
import { CheckResult } from "../shared/types/index";
import { checkClassification } from "./checkClassification";
import { checkCompany } from "./checkCompany";
import { checkContainUnit } from "./checkContainUnit";
import { checkName } from "./checkName";
import { checkT1_8 } from "./checkT1_8";
import { checkTestManual } from "./checkTestManual";

export function checkSummaryFromLLM(summaryFromLLM: SummaryFromLLM, summaryInfo: SummaryInfo): CheckResult[] {
  let results: CheckResult[] = []
  // 生产单位和测试单位验证
  results.push(...checkCompany(summaryFromLLM, summaryInfo))
  // 电池名称验证
  results.push(...checkName(String(summaryFromLLM.cnName), String(summaryFromLLM.enName), summaryInfo.cnName))
  // 电池类型验证
  results.push(...checkClassification(String(summaryFromLLM.classification), summaryInfo.classification))
  // 基本信息验证，"type", "testReportNo", "testDate"
  results.push(...baseCheck(summaryFromLLM, summaryInfo))
  // 电池参数验证，"voltage", "capacity", "watt", "mass", "licontent"
  results.push(...checkContainUnit(summaryFromLLM, summaryInfo))
  // 测试标准验证
  results.push(...checkTestManual(String(summaryFromLLM.testManual), summaryInfo.testManual))
  // T1-8验证
  results.push(...checkT1_8(summaryFromLLM, summaryInfo))
  console.log(results)
  for (let result of results) {
    result.result = "LLM验证：" + result.result
  }
  return results
}