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
            twoFactorAuth: false
        },
        toast: {
            message: 'Two-factor authentication is now enabled.',
            show: false
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
                    this.userInfo.twoFactorAuth = false;
                    this.isUserAuthenticated = true;
                })
        }
        axios.get(window.CHECK_2FA_STATUS, {
            headers: {
                Authorization: 'Token ' + this.userInfo.authToken
            }
        })
            .then(res => console.log(res))
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
        },
        on2faActivation: function() {
            this.toast.show = true;
            this.userInfo.twoFactorAuth = true;
        },
        cleanAllErrors: function(errors) {
            Object.values(errors).forEach(error => {
                error.show = false
            });
        }
    }
})