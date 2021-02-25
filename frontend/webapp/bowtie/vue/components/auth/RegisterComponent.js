/**
 * UserRegisterComponent
 * Description: uses to handle the registration process via the register form
 */

let RegisterComponent = {
    template: '#register-template',
    data: function () {
        return {
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
            errors: {
                confirmPasswordErr: {
                    message: 'The two typed passwords are different.',
                    show: false
                },
                weakPasswordErr: {
                    message: 'This password is not strong enough.',
                    show: false
                },
                missingFieldsErr: {
                    message: 'All fields are required. Please in fill them.',
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
            if (this.username === '' || this.email === '' | this.password === '') {
                this.errors.missingFieldsErr.show = true;
                isValid = false;
            }
            if (!this.validEmail()) {
                this.errors.invalidEmailErr.show = true;
                isValid = false;
            }
            if (this.password !== this.passwordConfirm) {
                this.errors.confirmPasswordErr.show = true;
                this.passwordConfirm = '';
                isValid = false;
            }
            return isValid;
        },
        // Submit the register by fetching the api
        submitRegisterForm: function() {
            if (this.checkRegisterForm()) {
                let params = JSON.stringify({ "username": this.username, "email": this.email, "password": this.password });
                axios.post(window.REGISTER, params, {
                    headers: {
                        'Content-type': 'application/json'
                    },
                })
                    .then(function(res) {
                        console.log(res);
                        alert('An email has been sent for confirmation. You will be redirected to the login page');
                        location.hash = 'login';
                    })
                    .catch(error => {
                        if (error.response) this.filterErrorResponse(error.response);
                    });
            }
        },
        validEmail: function() {
            let mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return mailRegex.test(this.email) || this.email === '';
        },
        // Handles the different errors received after the above axios operation
        filterErrorResponse: function(error) {
            if (error.status === 400) {
                this.errors.weakPasswordErr.show = true;
                this.password = '';
                this.passwordConfirm = '';
            }
        }
    }
}