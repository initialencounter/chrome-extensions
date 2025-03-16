import {checkPekBtyType} from './pek/index'
import {checkSekBtyType} from './sek/index'
import {checkSekAttachment, checkPekAttachment} from './summary/index'
import {checkSummaryFromLLM} from './llm/index'
(window as any).checkPekBtyType = checkPekBtyType;
(window as any).checkSekBtyType = checkSekBtyType;
(window as any).checkPekAttachment = checkPekAttachment;
(window as any).checkSekAttachment = checkSekAttachment;
(window as any).checkSummaryFromLLM = checkSummaryFromLLM;