export const TheNavbarComponent = {
    template: `
        <div id="navbar">
            <span id="navbar-links">
            <router-link to="/" class="navbar-link navbar-link__home">Home</router-link>
                <span v-if="!isUserAuthenticated">
                    <router-link to="/login" class="navbar-link navbar-link__login">Login</router-link>
                </span>
                <span v-else>
                    <button class="navbar-btn navbar-btn__logout" v-on:click="logout">Logout</button>
                </span>
            </div>
        </div>
    `,
    computed: {
        isUserAuthenticated: function() {
            return this.$store.state.isUserAuthenticated;
        }
    },
    methods: {
        logout: function() {
            this.$store.dispatch('logout');
            window.location.assign(window.ROOT_PAGE);
        }
    }
}
