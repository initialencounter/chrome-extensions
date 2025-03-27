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

export function match967BatteryNumber(sourceText: string): number {
  const batteryNumRegex = /内置\s*(\d+)\s*块电池/;
  const batteryMatch = sourceText.match(batteryNumRegex);
  const batteryNumber = batteryMatch ? parseInt(batteryMatch[1], 10) : 0;
  return batteryNumber
}

export function match966BatteryNumber(sourceText: string): number {
  const batteryNumRegex = /与\s*(\d+)\s*块电池包装在一起/;
  const batteryMatch = sourceText.match(batteryNumRegex);
  const batteryNumber = batteryMatch ? parseInt(batteryMatch[1], 10) : 0;
  return batteryNumber
}

export function matchDeviceNumber(sourceText: string): number {
  const deviceNumRegex = /内含\s*(\d+)\s*台设备/;
  const deviceMatch = sourceText.match(deviceNumRegex);
  const deviceNumber = deviceMatch ? parseInt(deviceMatch[1], 10) : 0;
  return deviceNumber
}