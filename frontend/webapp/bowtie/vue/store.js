const userModule = {
    state: () => ({
        sessionToken: null,
        username: '',
        email: '',
        researcher: false,
        twoFactorAuth: false
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
        logout(state) {
            state.sessionToken = null;
            state.username = '';
            state.email = '';
            state.researcher = false;
            state.twoFactorAuth = false;
        }
    },
    actions: {
        async fetchUserData({ commit, state }) {
            return await axios.get(window.USER_INFO, {
                headers: {
                    Authorization: 'Token ' + state.sessionToken
                }
            })
        },
        async login({ commit }, formData) {
            return await axios.post(window.LOGIN, formData, {
                headers: {
                    'Content-type': 'application/json'
                }
            })
        },
        logout({ commit }, state) {
            localStorage.removeItem('sessionToken');
           commit('logout');
        }
    }
}

export const store = new Vuex.Store({
    modules: {
        user: userModule
    },
    state: {
        isUserAuthenticated: false
    },
    mutations: {
        setAuthenticationStatus(state, authStatus) {
            state.isUserAuthenticated = authStatus;
        }
    }
})
