let AccountProfileComponent = {
    template: '#account-profile-template',
    props: {
        userName: String,
        userEmail: String
    }
}

let AccountSecurityComponent = {
    template: '#account-security-template',
    props: {
        is2faActivated: Boolean
    },
    data: function() {
        return {
            userPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    }
}

let AccountDangerZoneComponent = {
    template: '#account-danger-zone-template',
    props: {
        authToken: String
    },
    data: function() {
        return {
            userPassword: '',
            errors: {
                emptyPasswordErr: {
                    message: 'Please type your password.',
                    show: false
                }
            }
        }
    },
    methods: {
        checkDeleteAccountForm: function() {
          if (this.userPassword === '') {
              this.errors.emptyPasswordErr.show = true;
              return false;
          }
          return true;
        },

        deleteAccountSubmit: function() {
            if (this.checkDeleteAccountForm()) {
                let userConfirmation = confirm('Continue by deleting your account ?');
                if (userConfirmation) this.deleteAccountConfirm();
            }
        },
        deleteAccountConfirm: function() {
            let params = JSON.stringify({ password: this.userPassword })
            axios.post(window.DELETE_ACCOUNT, params, {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: 'Token ' + this.authToken
                }
            })
                .then(res => {
                    localStorage.removeItem('username');
                    localStorage.removeItem('token');
                    alert('Your account has been successfully deleted. You will be redirected to login page.');
                    window.location.assign(window.LOGIN_PAGE);
                });
        }
    }
}

let user_account_vue = new Vue({
    el: '#user-account-container',
    components: {
        'account-profile-component': AccountProfileComponent,
        'account-security-component': AccountSecurityComponent,
        'account-danger-zone-component': AccountDangerZoneComponent
    },
    data: {
        currentTab: 'Profile',
        tabs: ['Profile', 'Security', 'Danger-Zone'],
        isUserAuthenticated: true,
        userInfo: {
            name: null,
            email: null,
            authToken: null,
            is2faActivated: false
        },
        test: "bonsoir"
    },
    computed: {
        currentTabComponent: function() {
            return 'account-' + this.currentTab.toLowerCase() + '-component';
        }
    },
    beforeMount() {
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

})

