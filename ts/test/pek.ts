import { checkPekBtyType } from '../src/pek/index'
import { PekData } from "../src/shared/types/index";
// @ts-ignore
import { readFileSync } from 'fs'
// @ts-ignore
import path from 'path'
// @ts-ignore
const cwd = path.resolve(__dirname)

for (let i = 1; i < 165; i++) {
    const data: PekData = JSON.parse(readFileSync(path.resolve(cwd, `../../tests/data/pek/data${i}.json`), 'utf-8'))
    let result = checkPekBtyType(data)
    if (result.length) {
        if (result.length === 1 && result[0].result.includes("如果是24年报告请忽略")) {

        } else {
            console.log(i)
            console.log(result)
        }
    }

}

// @ts-ignore
// const data: PekData = JSON.parse(readFileSync(path.resolve(cwd, `../../tests/data/pek/1.json`), 'utf-8'))
// let result = checkPekBtyType(data)
// console.log(result)

// function matchVoltage(projectName: string) {
//     const matches = [...projectName.matchAll(/(\d+\.?\d*)[Vv]/g)]
//     const results = matches.map((match) => match[1])
//     let voltage = Number(results[0])
//     if (!results.length) return 0
//     if (isNaN(voltage)) return 0
//     return voltage
// }
//
//
// for (let i = 1; i < 165; i++) {
//     const data: PekData = JSON.parse(readFileSync(path.resolve(cwd, `../../tests/data/pek/data${i}.json`), 'utf-8'))
//     const voltage = matchVoltage(data['itemCName'])
//     if (voltage) {
//         console.log(i, voltage)
//     } else {
//         console.log(i, 'no voltage')
//     }
// }

// function matchBatteryWeight(describe: string) {
//     const matches = [...describe.matchAll(/(\d+\.?\d*)[Kk]?[g]/g)]
//     const results = matches.map((match) => match[1])
//     let weight = Number(results[0])
//     if (!results.length) return 0
//     if (isNaN(weight)) return 0
//     if (describe.toLowerCase().includes("kg")) weight = weight * 1000
//     return weight
// }
//
// for (let i = 1; i < 165; i++) {
//     const data: PekData = JSON.parse(readFileSync(path.resolve(cwd, `../../tests/data/pek/data${i}.json`), 'utf-8'))
//     let otherDescribeCAddition = data['otherDescribeCAddition']
//     const weight = matchBatteryWeight(otherDescribeCAddition)
//     if (weight) {
//         console.log(i, weight)
//     } else {
//         console.log(otherDescribeCAddition)
//         console.log(i, 'no weight')
//     }
// }