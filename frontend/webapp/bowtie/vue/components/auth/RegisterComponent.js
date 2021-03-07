/**
 * RegisterComponent
 * Handles the registration process
 * Related template: common/authentication.html
 */

let RegisterComponent = {
    template: '#register-template',
    props: {
        cleanErrorMessages: Function,
    },
    data: function () {
        return {
            user: {
                username: '',
                email: '',
                password: '',
                passwordConfirm: '',
            },
            errors: {
                ConfirmPasswordErr: {
                    message: 'The two typed passwords are different.',
                    show: false
                },
                WeakPasswordErr: {
                    message: 'This password is not strong enough.',
                    show: false
                },
                MissingFieldsErr: {
                    message: 'All fields are required. Please fill in them.',
                    show: false
                },
                InvalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                },
            }
        }
    },
    methods: {
        // Checks if the register form is valid
        checkRegisterForm: function() {
            let isValid = true;
            this.cleanErrorMessages(this.errors);
            if (this.user.username === '' || this.user.email === '' || this.user.password === '') {
                this.errors.MissingFieldsErr.show = true;
                isValid = false;
            }
            if (!this.validEmail()) {
                this.errors.InvalidEmailErr.show = true;
                isValid = false;
            }
            if (this.user.password !== this.user.passwordConfirm) {
                this.errors.ConfirmPasswordErr.show = true;
                this.user.passwordConfirm = '';
                isValid = false;
            }
            return isValid;
        },
        // Submits the register form
        submitRegisterForm: function() {
            if (this.checkRegisterForm()) {
                let params = JSON.stringify({ "username": this.user.username, "email": this.user.email, "password": this.user.password });
                axios.post(window.REGISTER, params, {
                    headers: {
                        'Content-type': 'application/json'
                    },
                })
                    .then(function(res) {
                        alert('An email has been sent for confirmation. You will be redirected to the login page.');
                        location.hash = 'login';
                    })
                    .catch(error => {
                        if (error.response) this.filterErrorResponse(error.response);
                    });
            }
        },
        // Checks if the email matches the right pattern
        validEmail: function() {
            let mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return mailRegex.test(this.user.email) || this.user.email === '';
        },
        // Handles http errors coming from the register form submission
        filterErrorResponse: function(error) {
            switch(error.status) {
                case 400:
                    if (error.data.email !== undefined) {
                        this.errors.InvalidEmailErr.show = true;
                    }
                    if (error.data.password !== undefined) {
                        this.errors.WeakPasswordErr.show = true;
                        this.user.passwordConfirm = '';
                    }
                    if (error.data.username !== undefined) {
                        this.errors.MissingFieldsErr.show = true;
                    }
                    break;
                default:
                    console.log('Error while contacting the server');
            }
        }
    }
}