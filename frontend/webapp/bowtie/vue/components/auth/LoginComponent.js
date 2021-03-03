/**
 * LoginComponent
 * Handles the login process
 * Related template : common/authentication.html
 */

let LoginComponent =  {
    template: '#login-template',
    props: {
        cleanErrorMessages: Function
    },
    data: function() {
        return {
            user: {
                email: '',
                password: '',
            },
            errors: {
                InvalidCredentialsErr: {
                    message: 'Invalid credentials provided.',
                    show: false
                },
                InvalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                }
            }
        }
    },
    methods: {
        // Checks if the login form is valid
        checkLoginForm: function() {
            this.cleanErrorMessages(this.errors);
            if (!this.validEmail()) {
                this.errors.InvalidEmailErr.show = true;
                this.user.email = '';
                return false;
            }
            return true;
        },
        // Submits the login form
        submitLoginForm: function () {
            if (this.checkLoginForm()) {
                let params = JSON.stringify({"email": this.user.email, "password": this.user.password});
                axios.post(window.LOGIN, params, {
                    headers: {
                        'Content-type': 'application/json'
                    },
                })
                    .then(res => {
                        this.processToken(res.data.token);
                    })
                    .catch(error => {
                        if (error.response) this.filterErrorResponse(error.response);
                    })
            }

        },
        // Checks if the mail matches the right pattern
        validEmail: function() {
            let mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return mailRegex.test(this.user.email);
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
        // Handles http errors coming from the login form submission
        filterErrorResponse: function(error) {
            if (error.status === 401 || error.status === 400) {
                this.errors.InvalidCredentialsErr.show = true;
            } else {
                console.log('Unexpected error while logging in');
            }
        }
    }
}
