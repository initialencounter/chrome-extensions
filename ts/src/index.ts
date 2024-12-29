import {checkPekBtyType} from './pek/index'
import {checkSekBtyType} from './sek/index'
import {checkSekAttachment, checkPekAttachment} from './summary/index'
(window as any).checkPekBtyType = checkPekBtyType;
(window as any).checkSekBtyType = checkSekBtyType;
(window as any).checkPekAttachment = checkPekAttachment;
(window as any).checkSekAttachment = checkSekAttachment;
