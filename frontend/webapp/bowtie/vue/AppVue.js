import { router } from "./router.js";
import { store } from "./store.js";

export const app = new Vue({
    router,
    store,
    data: {
        message: 'hello-world'
    }

}).$mount('#app');
