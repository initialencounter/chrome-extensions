import {checkPekBtyType} from './pek/index'
import {checkSekBtyType} from './sek/index'
import {checkSekSummary, checkPekSummary} from './summary/index'
(window as any).checkPekBtyType = checkPekBtyType;
(window as any).checkSekBtyType = checkSekBtyType;
(window as any).checkSekSummary = checkSekSummary;
(window as any).checkPekSummary = checkPekSummary;
