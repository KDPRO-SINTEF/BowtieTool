import { router } from "./router.js";
import { store } from "./store.js";
import { HomePage } from "./pages/HomePage.js";
//import { LoginPage } from "./pages/auth/LoginPage.js";
import { TheNavbarComponent } from "./components/TheNavbarComponent.js";

export const app = new Vue({
    router,
    store,
    data: {
        isStoreLoaded: false
    },
    components: {
        'home': HomePage,
        'navbar': TheNavbarComponent
    },
    methods: {
        homePage: function() {
            return (this.$router.currentRoute.path === '/');
        },
        showNavbar: function() {
            return (this.onPage('home') || this.onPage('statistics') || this.onPage('settings'));
        },
        onPage: function(pageName) {
            let route = '/' + pageName;
            if (pageName === 'home') {
                route = '/';
            } else if (pageName === 'settings') {
                return (this.$router.currentRoute.path.indexOf(route) !== -1);
            }
            return this.$router.currentRoute.path === route;
        }
    },
    created: function() {
        let sessionToken = localStorage.getItem('sessionToken');
        if (sessionToken !== null) {
            this.$store.commit('setSessionToken', sessionToken);
            this.$store.dispatch('fetchUserData')
                .then(res => {
                    if (res.status === 200) {
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
