<template>
  <el-form ref="ruleFormRef" :model="ruleForm" size="large" label-width="auto">
    <h1>Settings</h1>
    <div v-for="(item, index) in Object.keys(metaData)" :key="index">
      <SwitchItem
        v-if="metaData[item].type === 'boolean'"
        :name="item"
        :description="metaData[item]['meta'].description as string"
        v-model="ruleForm[item as keyof typeof ruleForm] as boolean"
      >
      </SwitchItem>
      <InputText
        v-if="metaData[item].type === 'string'"
        :name="item"
        :description="metaData[item]['meta'].description as string"
        v-model="ruleForm[item as keyof typeof ruleForm] as string"
      >
      </InputText>
    </div>
    <br />
    <el-form-item>
      <el-button type="primary" @click="submitForm()">保存</el-button>
      <el-button type="info" @click="resetForm()">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ElMessage, type FormInstance } from 'element-plus'
import { ref } from 'vue'
import SwitchItem from './Switch.vue'
import InputText from './InputText.vue'
import { Config } from './Schema'

const saveConfig = () => {
  const tmpConfig = { ...ruleForm.value }
  try {
    new Config(tmpConfig)
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

const ruleFormRef = ref<FormInstance>()
let ruleForm = ref<Config>(new Config())
const metaData = { ...Config['dict'] }
// 判断是否处于开发环境
const isDev = import.meta.env.DEV
if (!isDev) {
  chrome.storage.sync.get(Object.keys(ruleForm.value), (data) => {
    ruleForm.value = new Config(data as Config)
  })
}

const submitForm = async () => {
  saveConfig()
}

const resetForm = () => {
  ruleForm.value = new Config()
}
</script>

<style>
.el-form {
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
