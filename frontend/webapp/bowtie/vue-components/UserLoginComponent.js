/**
 * UserLoginComponent
 * Description: uses to handle the login process via the login form (see login.html)
 */

Vue.component('UserLoginComponent',  {
    template: '#user-login',
    data: function() {
        return {
            userEmail: '',
            userPassword: '',
            errors: {
                wrongCredentialsErr: {
                    message: 'Provided credentials are wrong. Please try again.',
                    show: false
                },
                invalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                },
                forbiddenAccessErr: {
                    message: 'This email is either not registered or not confirmed.',
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
                this.userEmail = '';
                return false;
            }
            return true;
        },
        // Submits the login form
        loginSubmit: function () {
            if (this.checkLoginForm()) {
                let params = JSON.stringify({"email": this.userEmail, "password": this.userPassword});
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
            return mailRegex.test(this.userEmail);
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
                case 400:
                    this.errors.wrongCredentialsErr.show = true;
                    this.userPassword = '';
                    break;
                case 401:
                    this.errors.forbiddenAccessErr.show = true;
                    break;
                case 403:
                    this.errors.forbiddenAccessErr.show = true;
                    break;
                default:
                    alert('Error while contacting the server.');
            }
        }
    }
})

let login_vue = new Vue({
    el: '#login-vue',
    data: {
        title: 'Login'
    },
})

