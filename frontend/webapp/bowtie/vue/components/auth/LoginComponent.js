/**
 * LoginComponent
 * Description: uses to handle the login process via the login form
 */

let LoginComponent =  {
    template: '#login-template',
    data: function() {
        return {
            email: '',
            password: '',
            errors: {
                invalidCredentialsErr: {
                    message: 'Invalid credentials.',
                    show: false
                },
                invalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                }
            }
        }
    },
    methods: {
        // Checks if the login form is valid
        checkLoginForm: function() {
            for (const errorName in this.errors)  {
                this.errors[errorName].show = false;
            }
            if (!this.validEmail()) {
                this.errors.invalidEmailErr.show = true;
                this.email = '';
                return false;
            }
            return true;
        },
        // Submits the login form
        submitLoginForm: function () {
            if (this.checkLoginForm()) {
                let params = JSON.stringify({"email": this.email, "password": this.password});
                axios.post(window.LOGIN, params, {
                    headers: {
                        'Content-type': 'application/json'
                    },
                })
                    .then(res => {
                        this.processToken(res.data.token);
                        this.goto();
                    })
                    .catch(error => {
                        if (error.response) this.filterErrorResponse(error.response);
                    })
            }

        },
        goto: function() {
            this.$emit('registration-ok');
        },
        // Checks if the mail matches the right pattern
        validEmail: function() {
            let mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return mailRegex.test(this.email);
        },
        // Handles the received token if the login form has been successfully submitted
        processToken: function (token) {
            localStorage.setItem('token', token);
            axios.get(window.USER_INFO, {
                headers: {
                    'Authorization': 'Token ' + token
                }
            })
                .then(res => {
                    this.processName(res.data.username);
                })

        },
        // Handles the user information received thanks to the token
        processName: function (name) {
            localStorage.setItem('username', name);
            window.location.assign(window.BASE_PATH);

        },
        // Handles the errors coming from the login form submission
        filterErrorResponse: function(error) {
            switch(error.status) {
                case 401:
                    this.errors.invalidCredentialsErr.show = true;
                    this.password = '';
                    break;
                default:
                    console.log('Error while loging in');
            }
        }
    }
}
