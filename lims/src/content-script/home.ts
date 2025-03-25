import { startSyncInterval } from './screenshot'
import { sleep } from './utils'

;(async function () {
  sleep(500)
  startSyncInterval()
})()