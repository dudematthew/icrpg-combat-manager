import "./assets/main.css";

import { assetUrl } from "./utils/assetUrl";
import { createApp } from "vue";

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        let reloaded = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        });

        window.setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch(() => {
        // Install prompt may be unavailable; the app still runs normally.
      });
  });
}

registerServiceWorker();

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
