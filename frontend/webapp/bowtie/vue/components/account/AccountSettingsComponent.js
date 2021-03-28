/**
 * AccountProfileComponent
 * Displays the general information about the user
 * Related template: common/my_account.html
 */

let AccountProfileComponent = {
    template: '#account-profile-template',
    props: {
        username: String,
        email: String,
        isResearcher: Boolean
    },
    data: function() {
        return {
            role: 'Basic user'
        }
    },
    beforeMount() {
        if (this.isResearcher) {
            this.role = 'Researcher';
        }
    }
}

/**
 * AccountSecurityComponent
 * Handles the password update and 2FA activation/deactivation processes (calls to Account2faComponent)
 * Related template: common/my_account.html
 */

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
                MissingFieldsErr: {
                    message: 'All fields are required.',
                    show: false
                },
                WeakPasswordErr: {
                    message: 'This password is not strong enough.',
                    show: false
                },
                ConfirmPasswordErr: {
                    message: 'Typed passwords are different.',
                    show: false
                },
                WrongActualPasswordErr: {
                    message: 'Invalid password provided.',
                    show: false
                },
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
        active2faErrors: function() {
            return Object.values(this.errors).filter(error => error.show === true);
        }
    },
    methods: {
        // Checks if the password update form is valid
        checkPasswordUpdateForm: function() {
            let isValid = true;
            this.cleanErrorMessages(this.errors);
            if (this.user.password === '' || this.user.newPassword === '' || this.user.confirmPassword === '') {
                this.errors.MissingFieldsErr.show = true;
                isValid = false;
            }
            if ((this.user.newPassword !== this.user.confirmPassword) && this.user.confirmPassword !== '') {
                this.errors.ConfirmPasswordErr.show = true
                this.user.confirmPassword = '';
                isValid = false;
            }
            return isValid;
        },
        // Submits the password update form
        submitPasswordUpdateForm: function() {
            if (this.checkPasswordUpdateForm()) {
                let params = JSON.stringify({ 'new_password': this.user.newPassword, 'old_password': this.user.password});
                axios.put(window.UPDATE_PASSWORD, params, {
                    headers: {
                        Authorization: 'Token ' + this.authToken,
                        'Content-type': 'application/json'
                    }
                })
                    .then(res => {
                        this.user.password = '';
                        this.user.newPassword = '';
                        this.user.confirmPassword = '';
                        this.$emit('update-password');
                    })
                    .catch(error => {
                        if (error.response) this.filterPasswordUpdateErrors(error.response);
                    })
            }
        },
        // Submits the 2FA disabling form
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
        // Checks if the totp code matches the right pattern
        validTotpCode: function() {
            let totpCodeRegx = /^[0-9]{6}$/;
            return totpCodeRegx.test(this.user.totpToken);
        },
        // Handles http errors coming from the password update form submission
        filterPasswordUpdateErrors: function(error) {
            switch(error.status) {
                case 400:
                    if (error.data.errors !== undefined && error.data.errors[0] === "Wrong password") {
                        console.log(error.data.errors[0]);
                        this.errors.WrongActualPasswordErr.show = true;
                        this.user.password = '';
                    } else if (error.data.non_field_errors !== undefined) {
                        this.errors.WeakPasswordErr.show = true;
                        this.user.newPassword = '';
                        this.user.confirmPassword = '';
                    }
                    break;
            }
        },
        // Handles http errors coming from the 2FA disabling form submission
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

/**
 * AccountDangerZoneComponent
 * Handles the account deletion process
 * Related template: common/my_account.html
 */

let AccountDangerZoneComponent = {
    template: '#account-danger-zone-template',
    props: {
        authToken: String,
        cleanErrorMessages: Function
    },
    data: function() {
        return {
            password: '',
            errors: {
                EmptyPasswordErr: {
                    message: 'Password is required.',
                    show: false
                },
                WrongPasswordErr: {
                    message: 'Invalid password provided.',
                    show: false
                }
            }
        }
    },
    methods: {
        // Checks if the account deletion form is valid
        checkDeleteAccountForm: function() {
            this.cleanErrorMessages(this.errors);
          if (this.password === '') {
              this.errors.EmptyPasswordErr.show = true;
              return false;
          }
          return true;
        },
        // Submits the account deletion form
        submitAccountDeletionForm: function() {
            if (this.checkDeleteAccountForm()) {
                let userConfirmation = confirm('Continue by deleting your account ?');
                if (userConfirmation) this.confirmAccountDeletion();
            }
        },
        // Requests confirmation from the user for account deletion
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
                .catch(error => {
                    if (error.response) this.filterAccountDeletionErrors(error.response);
                })
        },
        filterAccountDeletionErrors: function(error) {
            if (error.status === 400) {
                this.errors.WrongPasswordErr.show = true;
            }
        }
    }
}

/**
 * AccountSettingsComponent
 * Unifies all the previous component as general settings, and handles the render of these components
 * Related template: common/my_account.html
 */


let AccountSettingsComponent = {
    template: '#account-settings-template',
    props: {
        username: String,
        email: String,
        authToken: String,
        is2faActivated: Boolean,
        cleanErrorMessages: Function,
        isResearcher: Boolean
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