import { router } from "./router.js";
import { store } from "./store.js";
import { HomePage } from "./pages/HomePage.js";
import { TheNavbarComponent } from "./components/TheNavbarComponent.js";

/**
 * Main Vue instance, mounted on index.html
 * Contains the router (router.js) and the store (store.js) objects
 */
export const app = new Vue({
    router,
    store,
    data: {
        isStoreLoaded: false // Describes if the store objet is correctly filled
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
        // If the session token in the localStorage, fetch the API to get the user information linked to that token
        // The child components of AppVue are mounted only if the store is well filled ...
        // ... this means waiting for the API response
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
