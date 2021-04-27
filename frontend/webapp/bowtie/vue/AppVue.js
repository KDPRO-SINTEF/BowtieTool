import { router } from "./router.js";
import { store } from "./store.js";
import { HomePage } from "./pages/HomePage.js";
//import { LoginPage } from "./pages/auth/LoginPage.js";

export const app = new Vue({
    router,
    store,
    data: {
        isStoreLoaded: false
    },
    components: {
        'home': HomePage,
    },
    methods: {
        homePage: function() {
            return (this.$router.currentRoute.path === '/');
        }
    },
    created: function() {
        let sessionToken = localStorage.getItem('sessionToken');
        if (sessionToken !== null) {
            this.$store.dispatch('fetchUserData')
                .then(res => {
                    if (res.status === 200) {
                        this.$store.commit('setSessionToken', sessionToken);
                        this.$store.commit('setAuthenticationStatus', true);
                        this.$store.commit('setUserData', res.data);
                    }
                })
                .catch(err => {
                    this.$store.dispatch('logout');
                })
                .finally(() => {
                    this.isStoreLoaded = true;
                })
        } else {
            this.isStoreLoaded = true;
        }
    }

}).$mount('#app');
