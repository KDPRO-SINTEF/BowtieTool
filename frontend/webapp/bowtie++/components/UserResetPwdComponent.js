Vue.component('UserResetPwdComponent', {
    template: '#reset-password',
    data: function() {
        return {
            userEmail: '',
            userPassword: '',
            passwordConfirm: '',
            resetPwdToken: '',
            isResetEmailSent: false,
            errors: {
                invalidTokenErr: {
                    message: 'This verification token is not correct.',
                    show: false
                },
                confirmPwdErr: {
                    message: 'The two typed passwords are different.',
                    show: false
                },
                unsecuredPwdErr: {
                    message: 'This password is not safe enough.',
                    show: false
                },
                missingFieldsErr: {
                    message: 'All elements are required. Please fill them.',
                    show: false
                }
            }
        }
    },
    methods: {
        verifyNewPwdForm: function() {
            for (const errorName in this.errors)  {
               this.errors[errorName].show = false;
            }
            if (this.resetPwdToken === '' || this.userPassword === '') {
                this.errors.missingFieldsErr.show = true;
                return false;
            }
            if (this.userPassword !== this.passwordConfirm) {
                this.errors.confirmPwdErr.show = true;
                this.passwordConfirm = '';
                return false;
            }
            return true;
        },
        resetEmailSubmit: function() {
            let params = JSON.stringify({'email': this.userEmail });
            axios.post(window.RESET_PWD, params, {
                headers: {
                    'Content-type': 'application/json'
                }
            })
                .then(res => {
                    alert('If this email is registered, an message will be sent. Please verify your email box.');
                    this.isResetEmailSent = true;
                })
                .catch(error => {
                    if (error.response) this.filterMailErrorResponse(error.response);
                });
        },
        newPasswordSubmit: function() {
            if (this.verifyNewPwdForm()) {
                let params = JSON.stringify({'password': this.userPassword});
                let reset_url = window.RESET_PWD + 'MQ/' + this.resetPwdToken;
                axios.post(reset_url, params, {
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                    .then(res => {
                        alert('Your password is now reset, you will be redirected to login page.');
                    })
                    .catch(error => {
                        if (error.response) this.filterPwdErrorResponse(error.response);
                    })
            }
        },
        filterMailErrorResponse: function(error) {
            if (error.status === 403) {
                alert('If this email is registered, an message will be sent. Please verify your email box.');
                this.isResetEmailSent = true;
            }
        },
        filterPwdErrorResponse: function(error) {
            if (error.status === 400) {
                let errorData = error.data;
                if (errorData === 'Your token has expired') {
                    this.errors.invalidTokenErr.show = true;
                    this.resetPwdToken = '';
                } else {
                    this.errors.unsecuredPwdErr.show = true;
                    this.userPassword = '';
                    this.passwordConfirm = '';

                }

            }
        }
    }
})

let reset_pwd_vue = new Vue({
    el: '#reset-pwd-form-container',
    data: {
        title: 'Reset password'
    }
})