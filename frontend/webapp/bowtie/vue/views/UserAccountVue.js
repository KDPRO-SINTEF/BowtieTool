let user_account_vue = new Vue ({
    el: '#user-account-vue',
    components: {
        'account-settings': AccountSettingsComponent,
        'account-2fa': Account2faComponent
    },
    data: {
        account_tabs: ['settings', '2fa'],
        currentAccountTab: 'settings',
        isUserAuthenticated: false,
        userInfo: {
            name: null,
            email: null,
            authToken: null,
            is2faActivated: false
        }
    },
    beforeMount() {
        this.processUrlHash(location.hash.substring(1));
        this.userInfo.name = localStorage.getItem('username');
        this.userInfo.authToken = localStorage.getItem('token');
        if (this.userInfo.name !== null && this.userInfo.authToken !== null) {
            axios.get(window.USER_INFO, {
                headers: {
                    Authorization: 'Token ' + this.userInfo.authToken
                }
            })
                .then(res => {
                    this.userInfo.email = res.data.email;
                    this.userInfo.is2faActivated = false;
                    this.isUserAuthenticated = true;
                })
        }
    },
    methods: {
        switchToTab: function(tab) {
            this.currentAccountTab = tab;
            location.hash = this.currentAccountTab;
        },
        processUrlHash(hash) {
            if (this.account_tabs.includes(hash)) {
                this.currentAccountTab = hash;
            } else {
                location.hash = 'settings';
            }
        }
    }
})