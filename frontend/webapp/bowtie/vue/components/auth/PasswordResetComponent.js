let PasswordResetComponent = {
    template: '#password-reset-template',
    data: function() {
        return {
            email: '',
            newPassword: '',
            passwordConfirm: '',
            resetPwdToken: null,
            isResetEmailSent: false,
            errors: {
                confirmPwdErr: {
                    message: 'The two typed passwords are different.',
                    show: false
                },
                weakPasswordErr: {
                    message: 'This password is not strong enough.',
                    show: false
                },
                missingFieldsErr: {
                    message: 'All elements are required. Please fill them.',
                    show: false
                },
                invalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                },
            }
        }
    },
    // Verifies if the reset password email has already been sent
    beforeMount() {
        this.userId = localStorage.getItem('userId');
        this.resetPwdToken = localStorage.getItem('resetPwdToken');
        if (this.userId !== null && this.resetPwdToken != null) {
            this.isResetEmailSent = true;
        }
    },
    methods: {
        // Checks if the email form is valid
        checkEmailForm: function() {
            if (!this.validEmail()) {
                this.errors.invalidEmailErr.show = true;
                this.email = '';
                return false;
            }
            return true;
        },
        // Checks if the new password form is valid
        checkNewPwdForm: function() {
            let isValid = true;
            for (const errorName in this.errors)  {
               this.errors[errorName].show = false;
            }
            if (this.newPassword === '' && this.passwordConfirm === '') {
                this.errors.missingFieldsErr.show = true;
                return false;
            } else if (this.newPassword !== this.passwordConfirm) {
                this.errors.confirmPwdErr.show = true;
                this.passwordConfirm = '';
               return  false;
            }
            return true;
        },
        // Submits the email to reset the password
        submitResetEmail: function() {
            if (this.checkEmailForm()) {
                let params = JSON.stringify({'email': this.email });
                axios.post(window.RESET_PWD, params, {
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
            this.userId = localStorage.getItem('userId');
            this.resetPwdToken = localStorage.getItem('resetPwdToken');
            if (this.checkNewPwdForm()) {
                let params = JSON.stringify({'password': this.newPassword });
                let url = window.RESET_PWD + this.userId + '/' + this.resetPwdToken;
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
            return mailRegex.test(this.email);
        },
        // Handles the errors coming from the email form submission
        filterMailErrorResponse: function(error) {
            if (error.status === 403) {
                alert('If this email is registered, an message will be sent. Please verify your email box.');
                this.isResetEmailSent = true;
            }
        },
        // Handles the errors coming from the new password form submission
        filterPwdErrorResponse: function(error) {
            if (error.status === 400) {
                this.errors.weakPasswordErr.show = true;
                this.newPassword = '';
                this.passwordConfirm = '';
            }
        }
    }
}
