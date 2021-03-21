/**
 * PasswordResetComponent
 * Handles the password reset procedure
 * Related template: common/authentication.html
 */

let PasswordResetComponent = {
    template: '#password-reset-template',
    props: {
        cleanErrorMessages: Function
    },
    data: function() {
        return {
            user: {
                email: '',
                newPassword: '',
                passwordConfirm: '',
                id: null,
                resetPwdToken: null,
            },
            isResetEmailSent: false,
            errors: {
                ConfirmPwdErr: {
                    message: 'The two typed passwords are different.',
                    show: false
                },
                WeakPasswordErr: {
                    message: 'This password is not strong enough.',
                    show: false
                },
                MissingFieldsErr: {
                    message: 'All elements are required. Please fill them.',
                    show: false
                },
                InvalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                },
                InvalidTokenErr: {
                    message: 'The token is invalid or has expired. Please, retry the procedure.'
                }
            }
        }
    },
    // Verifies if the reset password email has already been sent
    beforeMount() {
        this.user.id = localStorage.getItem('userId');
        this.user.resetPwdToken = localStorage.getItem('resetPwdToken');
        if (this.user.id !== null && this.user.resetPwdToken !== null) {
            this.isResetEmailSent = true;
        }
    },
    methods: {
        // Checks if the email form is valid
        checkEmailForm: function() {
            if (!this.validEmail()) {
                this.errors.InvalidEmailErr.show = true;
                this.user.email = '';
                return false;
            }
            return true;
        },
        // Checks if the new password form is valid
        checkNewPwdForm: function() {
           this.cleanErrorMessages(this.errors);
            if (this.user.newPassword === '' && this.user.passwordConfirm === '') {
                this.errors.MissingFieldsErr.show = true;
                return false;
            } else if (this.user.newPassword !== this.user.passwordConfirm) {
                this.errors.ConfirmPwdErr.show = true;
                this.user.passwordConfirm = '';
               return  false;
            }
            return true;
        },
        // Submits the email to reset the password
        submitResetEmail: function() {
            if (this.checkEmailForm()) {
                let params = JSON.stringify({'email': this.user.email });
                axios.post(window.PWD_RESET, params, {
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                    .then(res => {
                        alert('A password reset mail has been sent. You will be redirected to the login page.');
                        location.hash = 'login';
                    })
                    .catch(error => {
                        if (error.response) this.filterMailErrorResponse(error.response);
                    });
            }

        },
        // Submits the new passwords of the user
        submitNewPassword: function() {
            if (this.user.id === null && this.user.resetPwdToken === null) {
                this.user.id = localStorage.getItem('userId');
                this.user.resetPwdToken = localStorage.getItem('resetPwdToken');
            }
            if (this.checkNewPwdForm()) {
                let params = JSON.stringify({'password': this.user.newPassword });
                let url = window.PWD_RESET + '/'+ this.user.id + '/' + this.user.resetPwdToken;
                axios.post(url, params, {
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                    .then(res => {
                        alert('Your password is now reset, you will be redirected to login page.');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('resetPwdToken');
                        window.location.assign(window.LOGIN_PAGE);
                    })
                    .catch(error => {
                        if (error.response) this.filterPwdErrorResponse(error.response);
                    })
            }
        },
        // Checks if the email matches the right pattern
        validEmail: function() {
            let mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return mailRegex.test(this.user.email);
        },
        // Handles http errors coming from the email form submission
        filterMailErrorResponse: function(error) {
            if (error.status === 403) {
                alert('If this email is registered, an message will be sent. Please verify your email box.');
                this.isResetEmailSent = true;
            }
        },
        // Handles http errors coming from the new password form submission
        filterPwdErrorResponse: function(error) {
            console.log(error.data);
            switch (error.status) {
                case 400:
                    if (error.data === 'bad credentials') {
                        this.errors.WeakPasswordErr.show = true;
                        this.user.passwordConfirm = '';
                    } else if (error.data === 'Invalid token') {
                        alert('The token is invalid or has expired. Please, enter your email again.');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('resetPwdToken');
                        window.location.reload();
                    }
                    break;
                default:
                    console.log('Error while contacting the server.');
            }
        }
    }
}
