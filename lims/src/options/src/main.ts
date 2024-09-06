import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
// @ts-ignore
import App from './App.vue'
import form from 'schemastery-vue'
import { createI18n } from 'vue-i18n'
const i18n = createI18n({
    legacy: false,
})
createApp(App).use(i18n).use(ElementPlus).use(form).mount('#app')
