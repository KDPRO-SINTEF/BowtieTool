/**
 * UserRegisterComponent
 * Description: uses to handle the registration process via the register form (see register.html)
 */

Vue.component('UserRegisterComponent', {
    props: {
        title: String
    },
    template: '#user-register',
    data: function () {
        return {
            userName: '',
            userEmail: '',
            userPassword: '',
            passwordConfirm: '',
            errors: {
                existingEmailErr: {
                    message: 'This email is already register.',
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
                },
                invalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                },
            }
        }
    },
    methods: {
        // Verify if the form is correct or not
        checkRegisterForm: function() {
            let isValid = true;
            for (const errorName in this.errors)  {
                this.errors[errorName].show = false;
            }
            if (this.userName === '' || this.userEmail === '' | this.userPassword === '') {
                this.errors.missingFieldsErr.show = true;
                isValid = false;
            }
            if (!this.validEmail()) {
                this.errors.invalidEmailErr.show = true;
                isValid = false;
            }
            if (this.userPassword !== this.passwordConfirm) {
                this.errors.confirmPwdErr.show = true;
                this.passwordConfirm = '';
                isValid = false;
            }
            return isValid;
        },
        // Submit the register by fetching the api
        registerSubmit: function() {
            if (this.checkRegisterForm()) {
                let params = JSON.stringify({ "username": this.userName, "email": this.userEmail, "password": this.userPassword });
                axios.post(window.REGISTER, params, {
                    headers: {
                        'Content-type': 'application/json'
                    },
                })
                    .then(res => {
                        alert('Registration succeeded. You will be redirected to login page.');
                        window.location.assign(window.LOGIN_PAGE);
                    })
                    .catch(error => {
                        if (error.response) this.filterErrorResponse(error.response);
                    });
            }
        },
        validEmail: function() {
            let mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return mailRegex.test(this.userEmail);
        },
        // Handles the different errors received after the above axios operation
        filterErrorResponse: function(error) {
            if(error.status === 400) {
                if (error.data.email !== undefined) {
                    this.errors.existingEmailErr.show = true;
                    this.userEmail = '';
                }
                if (error.data.password !== undefined) {
                    console.log(error.data.password);
                    this.errors.unsecuredPwdErr.show = true;
                    this.userPassword = '';
                    this.passwordConfirm = '';
                }
            }

        }
    }
})

let register_vue = new Vue({
    el: '#register-vue',
    data: {
        title: 'Register'
    }
})

