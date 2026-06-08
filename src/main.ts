import "./assets/main.css";

import { assetUrl } from "./utils/assetUrl";
import { createApp } from "vue";

document.documentElement.style.setProperty(
  "--paper-bg",
  `url('${assetUrl("images/paper_background.png")}')`,
);
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
