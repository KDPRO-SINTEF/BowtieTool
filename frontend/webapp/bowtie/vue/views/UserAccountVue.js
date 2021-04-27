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
        user: {
            name: null,
            email: null,
            authToken: null,
            twoFactorAuth: false,
            isResearcher: null
        },
        toast: {
            message: '',
            show: false
        },
    },
    beforeMount() {
        this.processUrlHash(location.hash.substring(1));
        this.getUserInfo();
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
            this.toast.message = 'Two-factor authentication is now enabled.'
            this.user.twoFactorAuth = true;
        },
        on2faDisabling: function() {
            this.user.twoFactorAuth = false;
            this.toast.show = true;
            this.toast.message = 'Two-factor authentication has been disabled.'
        },
        cleanAllErrors: function(errors) {
            Object.values(errors).forEach(error => {
                error.show = false
            });
        },
        onPasswordUpdate: function() {
            this.toast.show = true;
            this.toast.message = 'Password has been updated.';
        },
        getUserInfo: function() {
            this.user.authToken = localStorage.getItem('sessionToken');
            if (this.user.authToken !== null) {
                axios.get(window.USER_INFO, {
                    headers: {
                        Authorization: 'Token ' + this.user.authToken
                    }
                })
                    .then(res => {
                        this.user.name = res.data.username;
                        this.user.isResearcher = res.data.is_Researcher;
                        this.user.twoFactorAuth = res.data.profile.two_factor_enabled;
                        this.user.email = res.data.email;
                        this.isUserAuthenticated = true;
                    })
            }
        },
    }
})
