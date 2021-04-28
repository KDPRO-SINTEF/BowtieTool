export const TheNavbarComponent = {
    template: `
        <div id="navbar">
            <div id="navbar-links">
                <div v-if="!isUserAuthenticated">
                    <router-link to="/login" class="navbar-link navbar-link__login">Login</router-link>
                </div>
                <div v-else>
                    <button class="navbar-btn navbar-btn__logout" v-on:click="logout">Logout</button>
                </div>
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
