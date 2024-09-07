<template>
  <el-row class="row-bg" justify="end">
    <el-button class="el-button-save" @click="submitForm()">保存</el-button>
    <el-button class="el-button-reset" @click="resetForm()">重置</el-button>
  </el-row>
  <k-form v-model="config" :schema="Config" :initial="initial"></k-form>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { Config } from './Schema'
// 判断是否处于开发环境
const isDev = import.meta.env.DEV

const saveConfig = () => {
  try {
    const tmpConfig = new Config(config.value)
    if (isDev) {
      console.log(tmpConfig)
    } else {
      chrome.storage.sync.set(tmpConfig)
    }
    ElMessage({
      message: '保存成功',
      type: 'success',
      plain: true
    })
  } catch (error) {
    ElMessage({
      message: '保存失败，请检查配置',
      type: 'error',
      plain: true
    })
    return
  }
}

const config = ref<Config>({})
const initial = ref<Config>({})

if (!isDev) {
  chrome.storage.sync.get(Object.keys(new Config()), (data: Config) => {
    console.log(JSON.parse(JSON.stringify(data)))
    initial.value = JSON.parse(JSON.stringify(data))
    config.value = JSON.parse(JSON.stringify(data))
  })
}

const submitForm = async () => {
  saveConfig()
}

const resetForm = () => {
  config.value = new Config()
}
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.grid-content {
  background-color: aliceblue;
}
.el-button-save {
  background-color: rgb(66, 128, 66);
  color: #000;
}
.el-button-reset {
  background-color: rgb(128, 128, 128);
  color: #000;
}

.el-button-save:hover {
  background-color: rgb(110, 216, 110);
}
.el-button-reset:hover {
  background-color: rgb(192, 192, 192);
}
</style>
