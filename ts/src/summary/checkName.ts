import { CheckResult } from "../shared/types/index"

// inspectionItem1 0 965 1 966 2 967
export function checkName(packageType: '0' | '1' | '2', formEName: string, formCName: string, model: string, summaryCName: string): CheckResult[] {
  formCName = formCName.trim()
  formEName = formEName.trim()
  summaryCName = summaryCName.trim()
  model = model.trim()
  let formCNameText = ''
  let formENameText = ''
  let keyWord = ''
  switch (packageType) {
    case '0':
      formCNameText = formCName.split(model)[0]
      formENameText = formEName.split(model)[0]
      break
    case '1':
      keyWord = "包装"
      break
    case '2':
      keyWord = "内置"
      break
  }
  if (keyWord === '内置') {
    let indexKeyWord = formCName.indexOf('内置')
    let indexKeyEWord = formEName.indexOf("Containing")
    let indexModel = formCName.indexOf(model)
    let indexEModel = formEName.indexOf(model)
    console.log('indexKeyWord', indexKeyWord)
    console.log('indexModel', indexModel)
    if (indexKeyWord < indexModel) {
      formCNameText = formCName.substring(indexKeyWord + 2, indexModel)
      formENameText = formEName.substring(indexKeyEWord + 10, indexEModel)
    }
    else {
      formCNameText = formCName.substring(0, indexModel)
      formENameText = formEName.substring(0, indexModel)
    }
  }
  else if (keyWord === '包装') {
    let indexKeyWord = formCName.indexOf('与')
    let indexKeyEWord = formEName.indexOf('Packed With')
    let indexModel = formCName.indexOf(model)
    let indexEModel = formEName.indexOf(model)
    if (indexKeyWord < indexModel) {
      formCNameText = formCName.substring(0, indexModel)
      formENameText = formEName.substring(0, indexEModel)
    }
    else {
      formCNameText = formCName.substring(indexKeyWord + 1, indexModel)
      formENameText = formEName.substring(indexKeyEWord + 1, indexEModel)
    }
  }
  formCNameText = formCNameText.trim()
  formENameText = formENameText.trim()
  let result: CheckResult[] = []
  if (!summaryCName.includes(formCNameText)) {
    result.push({
      ok: false,
      result: `中文电池名称不一致, 系统上为${formCNameText}, 概要上为${summaryCName}`
    })
  }
  if (!summaryCName.includes(formENameText)) {
    result.push({
      ok: false,
      result: `英文电池名称不一致, 系统上为${formENameText}, 概要上为${summaryCName}`
    })
  }
  return result
}

