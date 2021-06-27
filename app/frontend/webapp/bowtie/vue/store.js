const userModule = {
    state: () => ({
        sessionToken: null,
        username: '',
        email: '',
        researcher: false,
        twoFactorAuth: false,
        authenticated: false
    }),
    mutations: {
        setSessionToken(state, token) {
            state.sessionToken = token;
        },
        setUserData(state, data) {
            state.username = data.username;
            state.email = data.email;
            state.researcher = data.is_Researcher;
            state.twoFactorAuth = data.profile.two_factor_enabled;
        },
        setAuthenticationMode(state, mode) {
            state.twoFactorAuth = mode;
        },
        setAuthenticationStatus(state, authStatus) {
            state.authenticated = authStatus;
        },
        logout(state) {
            state.sessionToken = null;
            state.username = '';
            state.email = '';
            state.researcher = false;
            state.twoFactorAuth = false;
            state.authenticated = false;
        }
    },
    actions: {
        async fetchUserData({ commit, state }) {
            return await axios.get(window.API_USER_DATA, {
                headers: {
                    Authorization: 'Token ' + state.sessionToken
                }
            })
        },
        async login({ commit }, formData) {
            return await axios.post(window.API_LOGIN, formData, {
                headers: {
                    'Content-type': 'application/json'
                }
            })
        },
        logout({ commit }) {
            localStorage.removeItem('sessionToken');
            commit('logout');
        }
    }
}

export const store = new Vuex.Store({
    modules: {
        user: userModule
    },
    getters: {
        isUserAuthenticated(state) {
            return state.user.authenticated;
        }
    }
})
