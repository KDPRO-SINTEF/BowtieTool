export const TheNavbarComponent = {
    template: `
        <div id="navbar">
            <div id="navbar-links">
                <router-link to="/" class="navbar-link-simple">Home</router-link>
                <span v-if="isUserAuthenticated && isUserResearcher">
                    <router-link to="/statistics" class="navbar-link-simple">Statistics</router-link>
                </span>
                <span v-if="!isUserAuthenticated">
                    <router-link to="/login" class="navbar-link navbar-link__login">Login</router-link>
                </span>
                <span v-else>
                    <button class="navbar-btn" v-on:click="settings">My account</button>
                    <button class="navbar-btn navbar-btn__logout" v-on:click="logout">Logout</button>
                </span>
            </div>
        </div>
    `,
    computed: {
        isUserAuthenticated: function() {
            return this.$store.getters.isUserAuthenticated;
        },
        isUserResearcher: function() {
            return this.$store.state.user.researcher;
        }
    },
    methods: {
        logout: function() {
            this.$store.commit('setAuthenticationStatus', false);
            this.$store.dispatch('logout');
            window.location.assign(window.ROOT_PAGE);
        },
        settings() {
            this.$router.push('/settings');
        }
    }
}
