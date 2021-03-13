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
        is2faActivated: Boolean,
        cleanErrorMessages: Function,
        authToken: String
    },
    data: function() {
        return {
            user: {
                password: '',
                newPassword: '',
                confirmPassword: '',
                totpToken: '',
            },
            errors: {
                ExpiredTotpTokenErr: {
                    message: "This code has expired, try with a new one.",
                    show: false
                },
                InvalidTotpTokenErr: {
                    message: '6-digit code is required.',
                    show: false
                },
                InvalidAuthTokenErr: {
                    message: 'An error occurred - invalid authentication token.',
                    show: false
                }
            }
        }
    },
    computed: {
        activeErrors: function() {
            return Object.values(this.errors).filter(error => error.show === true);
        }
    },
    methods: {
        submit2faDisabling: function() {
            this.cleanErrorMessages(this.errors);
            if (!this.validTotpCode()) {
                this.errors.InvalidTotpTokenErr.show = true;
                this.user.totpToken = '';
            } else {
                if (confirm('Disable two-factor authentication ?')) {
                    let params = JSON.stringify({"token_totp": this.user.totpToken});
                    axios.post(window.DISABLE_2FA, params, {
                        headers: {
                            Authorization: 'Token ' + this.authToken,
                            'Content-type': 'application/json'
                        }
                    })
                        .then(res => {
                            this.$emit('disable-2fa');
                            this.user.totpToken = '';
                        })
                        .catch(error => {
                            if (error.response)  this.filter2faDisablingErrors(error.response);
                        })
                }
            }


        },
        validTotpCode: function() {
            let totpCodeRegx = /^[0-9]{6}$/;
            return totpCodeRegx.test(this.user.totpToken);
        },
        filter2faDisablingErrors: function(error) {
            switch(error.status) {
                case 400:
                    this.errors.ExpiredTotpTokenErr.show = true;
                    this.user.totpToken = '';
                    break;
                case 401:
                    if (error.data.detail !== undefined) {
                        this.errors.InvalidAuthTokenErr.show = true;
                        this.user.totpToken = '';
                    }
                default:
                    console.log('Error while contacting the server.');
            }
        }
    },
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
                    alert('Your account has been successfully deleted.');
                    window.location.assign(window.LOGIN_PAGE);
                })
        }
    }
}

let AccountSettingsComponent = {
    template: '#account-settings-template',
    props: {
        username: String,
        email: String,
        authToken: String,
        is2faActivated: Boolean,
        cleanErrorMessages: Function
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