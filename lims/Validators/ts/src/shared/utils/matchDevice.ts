export function matchDeviceName(projectName: string) {
  let matches = [...projectName.matchAll(/设备[:：](.*?)[。;；]/g)]
  let results = matches.map((match) => match[1])
  let result = results[results.length - 1]
  if (!results.length) return ''
  return result
}

export function matchDeviceModel(projectName: string) {
  let matches = [...projectName.matchAll(/设备[:：].*?[;；]型号[:：](.*?)[。；;]/g)]
  let results = matches.map((match) => match[1])
  let result = results[results.length - 1]
  if (!results.length) return ''
  return result
}

export function matchDeviceTrademark(projectName: string) {
  let matches = [...projectName.matchAll(/设备[:：].*?[;；]型号[:：].*?[；;]商标[:：](.*?)[。;；]/g)]
  let results = matches.map((match) => match[1])
  let result = results[results.length - 1]
  if (!results.length) return ''
  return result
}

export function matchTestManual(testManual: string) {
  let matches = [...testManual.matchAll(/[\(（]?(第.*?)[\)）]?\s?[第]?38.3节/g)]
  let results = matches.map((match) => match[1])
  let result = results[results.length - 1]
  if (!results.length) return ''
  return result
}