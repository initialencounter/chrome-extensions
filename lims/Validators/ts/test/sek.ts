import { checkSekBtyType } from '../src/sek/index'
import { SekData } from "../src/shared/types/index";
// @ts-ignore
import { readFileSync } from 'fs'
// @ts-ignore
import path from 'path'


for (let i = 0; i < 199; i++) {
    // @ts-ignore
    const data: SekData = JSON.parse(readFileSync(path.resolve(__dirname, `../../tests/data/sek/${i}.json`), 'utf-8'))
    let result = checkSekBtyType(data)
    if (result.length) {
        console.log(i)
        console.log(result)
    }
}