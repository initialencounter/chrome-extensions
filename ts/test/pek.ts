import {checkPekBtyType} from '../src/pek/index'
import {PekData} from "../src/types/index";
import {readFileSync} from 'fs'
// @ts-ignore
import path from 'path'


for (let i = 1; i < 165; i++) {
    const data: PekData = JSON.parse(readFileSync(path.resolve(__dirname, `../../tests/data/pek/data${i}.json`), 'utf-8'))
    let result = checkPekBtyType(data)
    if (result.length) {
        if (result.length === 1 && result[0].result.includes("如果是24年报告请忽略")) {

        } else {
            console.log(i)
            console.log(result)
        }
    }

}







