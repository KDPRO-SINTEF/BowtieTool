import { router } from "./router.js";
import { store } from "./store.js";
import { HomePage } from "./pages/HomePage.js";
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
        showNavbar: function() {
            return (this.onPage('Home') || this.onPage('Statistics') || this.onPage('Settings'));
        },
        onPage: function(pageName) {
            let currentPage = this.$route.name;
            if (currentPage !== undefined) {
                if (pageName === 'Settings') {
                    return (currentPage === 'UserProfile' || currentPage.indexOf('Account') !== -1);
                } else {
                    return this.$route.name === pageName;
                }
            }
            return false;
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
