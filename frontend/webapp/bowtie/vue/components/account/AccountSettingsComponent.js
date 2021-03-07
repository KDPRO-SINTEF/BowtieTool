let AccountProfileComponent = {
    template: '#account-profile-template',
    props: {
        username: String,
        email: String
    }
}

let AccountSecurityComponent = {
    template: '#account-security-template',
    props: {
        is2faActivated: Boolean
    },
    data: function() {
        return {
            password: '',
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
            password: '',
            errors: {
                emptyPasswordErr: {
                    message: 'Please, type your password.',
                    show: false
                }
            }
        }
    },
    methods: {
        checkDeleteAccountForm: function() {
          if (this.password === '') {
              this.errors.emptyPasswordErr.show = true;
              return false;
          }
          return true;
        },

        submitAccountDeletionForm: function() {
            if (this.checkDeleteAccountForm()) {
                let userConfirmation = confirm('Continue by deleting your account ?');
                if (userConfirmation) this.confirmAccountDeletion();
            }
        },
        confirmAccountDeletion: function() {
            let params = JSON.stringify({ password: this.password })
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

let AccountSettingsComponent = {
    template: '#account-settings-template',
    props: {
        username: String,
        email: String,
        authToken: String,
        is2faActivated: Boolean
    },
    components: {
        'account-profile': AccountProfileComponent,
        'account-security': AccountSecurityComponent,
        'account-danger-zone': AccountDangerZoneComponent
    },
    data: function() {
        return {
            currentTab: 'Profile',
            tabs: ['Profile', 'Security', 'Danger-Zone'],
        }
    }
}