<template>
  <el-form ref="ruleFormRef" :model="ruleForm" size="large" label-width="auto">
    <h1>Settings</h1>
    <div v-for="(item, index) in Object.keys(metaData)" :key="index">
      <SwitchItem
        :name="item"
        :description="metaData[item]['meta'].description as string"
        v-model="ruleForm[item as keyof typeof ruleForm]"
      >
      </SwitchItem>
    </div>
    <br />
    <el-form-item>
      <el-button type="primary" @click="submitForm()">保存</el-button>
      <el-button type="info" @click="resetForm()">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { type ComponentSize, ElMessage, type FormInstance } from 'element-plus'
import { ref } from 'vue'
import Schema from 'schemastery'
import SwitchItem from './Switch.vue'

interface Config {
  enabledReplace: boolean
  enableCopyProjectNo: boolean
  enableCopyProjectName: boolean
  enablePreventCloseBeforeSave: boolean
  enableSaveHotKey: boolean
  enableImportHotKey: boolean
  enableSetImportProjectNo: boolean
  enableSetQueryProjectNo: boolean
}

const Config: Schema<Config> = Schema.object({
  enabledReplace: Schema.boolean()
    .description(
      `开启替换 （当检验单为*空运*时，点击右键菜单栏的替换数据按钮，将自动替换为剪切板中的*海运*编号数据；当检验单为*海运*时，点击右键菜单栏的替换数据按钮，将自动替换为剪切板中的*空运*编号数据）`
    )
    .default(true),
  enableCopyProjectNo: Schema.boolean()
    .description(
      `复制项目编号 （点击项目编号，或者双击 *Ctrl*，即可将项目编号复制到剪切板）`
    )
    .default(true),
  enableCopyProjectName: Schema.boolean()
    .description(
      `复制项目名称 （双击项目名称，或者按住 *Ctrl* 键并双击两次 *C* 键，即可将项目名称复制到剪切板）`
    )
    .default(true),
  enablePreventCloseBeforeSave: Schema.boolean()
    .description(
      `保存前阻止关闭 （当有未保存的数据时，关闭页面时会弹出提示）`
    )
    .default(true),
  enableSaveHotKey: Schema.boolean()
    .description(
      `保存快捷键 （使用快捷键 *Ctrl + C* 将保存检验单）`
    )
    .default(true),
  enableImportHotKey: Schema.boolean()
    .description(
      `导入快捷键 （使用快捷键 *Ctrl + D* 将打开导入窗口）`
    )
    .default(true),
  enableSetImportProjectNo: Schema.boolean()
    .description(
      `设置导入项目编号 （在导入窗口中，自动填充项目编号）`
    )
    .default(true),
  enableSetQueryProjectNo: Schema.boolean()
    .description(
      `设置查询项目编号 （在查询窗口中，自动填充项目编号）`
    )
    .default(true)
})

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
  chrome.storage.sync.get(
    [
      'enabledReplace',
      'enableCopyProjectNo',
      'enableCopyProjectName',
      'enablePreventCloseBeforeSave',
      'enableSaveHotKey',
      'enableImportHotKey',
      'enableSetImportProjectNo',
      'enableSetQueryProjectNo'
    ],
    (data) => {
      ruleForm.value = new Config(data as Config)
    }
  )
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
