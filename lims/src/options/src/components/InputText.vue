<template>
    <div class="switch-item">
      <div class="switch-main">
        <div class="switch-left">
          <h3>
            <span>{{ name }}</span>
          </h3>
          <VueMarkdown :source="description"></VueMarkdown>
        </div>
        <div class="switch-right">
          <el-input 
            v-model="text"
            clearable
          ></el-input>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  // @ts-ignore
  import VueMarkdown from 'markdown-vue'
  
  const text = defineModel<string>({ required: true })
  defineProps<{
    name: string
    description: string
  }>()
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
    width: 300px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  </style>
  