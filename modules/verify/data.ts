import { getFormData } from '../utils/form'
import { getData } from '../utils/api'
import { checkAttachment } from './attachment'
import { checkAttachmentFiles } from './attachment'
import { getHost } from '../utils/helpers'
import { checkLabelManual } from './label'
import type { PekData, SekData } from '../../Validators/shared/types/index'
import type { LocalConfig } from '@/share/utils'

/**
 * 验证表单数据
 */
export async function verifyFormData(
  systemId: 'pek' | 'sek', 
  projectId: string, 
  projectNo: string,
  localConfig: typeof LocalConfig
): Promise<Array<{ ok: boolean; result: string }>> {
  let result = []
  let dataFromForm: PekData | SekData
  
  if (systemId === 'pek') {
    dataFromForm = getFormData<PekData>(systemId)
    result = window.checkPekBtyType(dataFromForm)
  } else {
    dataFromForm = getFormData<SekData>(systemId)
    result = window.checkSekBtyType(dataFromForm)
  }
  
  result.push(
    ...(await checkAttachmentFiles(projectNo, projectId))
  )

  result.push(...(await checkAttachment(systemId, dataFromForm, localConfig)))
  
  if (localConfig.enableLabelCheckManual) {
    result.push(...checkLabelManual(systemId, dataFromForm))
  }
  
  return result
}

/**
 * 测试验证多个项目
 */
export async function testVerifyMultiple(systemId: 'pek' | 'sek'): Promise<void> {
  const host = getHost()
  const response = await fetch(
    `https://${host}/rest/inspect/query?category=battery&projectNo=${systemId.toUpperCase()}GZ&startDate=2024-09-03&endDate=2024-09-03&page=1&rows=100`,
    {
      method: 'GET',
      credentials: 'include'
    }
  )
  
  if (!response.ok) {
    console.log('请求失败1')
    return
  }
  
  const { total, rows }: { total: number; rows: PekData[] } =
    await response.json()
    
  for (let i = 0; i < 100; i++) {
    await new Promise(resolve => setTimeout(resolve, 100))
    // if (rows[i]['editStatus'] !== 3) continue
    try {
      const projectId = rows[i]['projectId']
      console.log(rows[i]['projectNo'])
      const currentData = await getData(projectId, systemId)
      
      if (currentData === null) {
        console.log(projectId)
        console.log('请求失败2')
        continue
      }
      
      let result = []
      if (systemId === 'pek') {
        result = window.checkPekBtyType(currentData as PekData)
      } else {
        result = window.checkSekBtyType(currentData as SekData)
      }
      
      if (result.length) {
        if (result.length === 1 && result[0].result.includes('请忽略')) {
          // 忽略的错误
        } else {
          console.log(result)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}
