import { CheckResult } from '../shared/types/index'
import { removeNonChineseCharacters } from '../summary/checkColor'

export function checkClassification(classificationLLM: string, classification: string): CheckResult[] {
  classification = removeNonChineseCharacters(classification.trim()).trim()
  if (classificationLLM !== classification) {
    return [{
      ok: false,
      result: `UN报告上的电池类型为:${classificationLLM}，概要上的为:${classification}`
    }]
  }
  return []
}