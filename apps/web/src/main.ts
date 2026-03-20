import { createApp } from "vue"
import { createPinia } from "pinia"
import { PiniaSharedState } from "pinia-shared-state"
import { router } from "./router"
import App from "./App.vue"
import "./style.css"

const pinia = createPinia()
pinia.use(PiniaSharedState({ enable: true }))

createApp(App).use(pinia).use(router).mount("#app")
