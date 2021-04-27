import { router } from "./router.js";
import { store } from "./store.js";
import { HomePage } from "./pages/HomePage.js";
//import { LoginPage } from "./pages/auth/LoginPage.js";

export const app = new Vue({
    router,
    store,
    data: {
        message: 'hello-world'
    },
    components: {
        'home': HomePage,
    },
    methods: {
        homePage: function() {
            return (this.$router.currentRoute.path === '/');
        }
    }

}).$mount('#app');
