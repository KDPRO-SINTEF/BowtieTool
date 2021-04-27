import { router } from "./router.js";
import { store } from "./store.js";
import { HomePage } from "./pages/HomePage.js";

export const app = new Vue({
    router,
    store,
    data: {
        message: 'hello-world'
    },
    components: {
        'home': HomePage
    }

}).$mount('#app');
