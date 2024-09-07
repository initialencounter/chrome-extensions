<template>
  <k-form v-model="config" :schema="Config"></k-form>
  <br />
  <el-button type="primary" @click="submitForm()">保存</el-button>
  <el-button type="info" @click="resetForm()">重置</el-button>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { Config } from './Schema'

const saveConfig = () => {
  try {
    const tmpConfig = new Config(config.value)
    console.log(tmpConfig)
    chrome.storage.sync.set(tmpConfig)
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
const config = ref<Config | null>(null)
const initial = ref<Config | null>(null)

// 判断是否处于开发环境
const isDev = import.meta.env.DEV
if (!isDev) {
}

const submitForm = async () => {
  saveConfig()
}

const resetForm = () => {
  config.value = new Config()
}
</script>

<style>
.el-form {
  background: rgba(121, 187, 255, 0.18);
  padding: 2rem;
  display: block;
  margin: auto;
  border-radius: 0.8rem;
}

.el-item {
  margin: 1rem;
}

.config-button {
  display: block;
  margin: auto;
}
.description {
  font: 0.8em sans-serif;
  margin: 0.8rem;
}
</style>
