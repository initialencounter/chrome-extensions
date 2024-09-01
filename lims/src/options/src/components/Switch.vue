<template>
  <div class="switch-item" :style="{opacity: enable ? 1: 0.4}">
    <div class="switch-main">
      <div class="switch-left" :onclick="switchValue">
        <h3>
          <span>{{ name }}</span>
        </h3>
        <VueMarkdown :source="description"></VueMarkdown>
      </div>
      <div class="switch-right">
        <el-switch v-model="enable"></el-switch>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import VueMarkdown from 'markdown-vue'

const enable = defineModel<boolean>({ required: true })
defineProps<{
  name: string
  description: string
}>()

function switchValue(){
  enable.value = !enable.value
}
</script>

<style scoped>
.switch-item {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef530;
}
.switch-main {
  display: flex;
  justify-content: space-between;
}
.switch-left {
  flex: 1;
}
.switch-left:hover {
  cursor: pointer;
}
.switch-right {
  width: 100px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
