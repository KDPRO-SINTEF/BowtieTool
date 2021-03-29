/**
 * LoginComponent
 * Handles the login process
 * Related template: common/authentication.html
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
                twoFactorAuth: false,
                totpToken: null,
                id: null,
                loginToken: null
            },
            errors: {
                InvalidCredentialsErr: {
                    message: 'Invalid credentials provided.',
                    show: false
                },
                InvalidEmailErr: {
                    message: 'Valid email is required.',
                    show: false
                },
                InvalidTotpTokenErr: {
                    message: '6-digit code is required.',
                    show: false
                },
                ExpiredTotpTokenErr: {
                    message: 'This code has expired, try with a new one.',
                    show: false
                }
            }
        }
    },
    methods: {
        // Checks if the login form is valid
        checkLoginForm: function() {
            this.cleanErrorMessages(this.errors);
            let isValid = true;
            if (!this.validEmail()) {
                this.errors.InvalidEmailErr.show = true;
                this.user.email = '';
                isValid = false;
            }
            if (this.user.totpToken !== null && !this.validTotpCode()) {
                this.errors.InvalidTotpTokenErr.show = true;
                isValid = false;
            }
            return isValid;
        },
        // Submits the login form
        submitLoginForm: function () {
            if (this.checkLoginForm()) {
                if (this.user.twoFactorAuth) {
                    let params = JSON.stringify({ "token_totp": this.user.totpToken});
                    let url = window.LOGIN_2FA + '/' + this.user.id + '/' + this.user.loginToken;
                    axios.post(url, params, {
                        headers: {
                            'Content-type': 'application/json'
                        }
                    })
                        .then(res => {
                            this.saveAuthToken(res.data.token);
                        })
                        .catch(error => {
                            if (error.response) this.filter2faLoginErrors(error.response);
                        })
                } else {
                    let params = JSON.stringify({"email": this.user.email, "password": this.user.password});
                    axios.post(window.LOGIN, params, {
                        headers: {
                            'Content-type': 'application/json'
                        },
                    })
                        .then(res => {
                            this.setLoginMode(res.data);
                        })
                        .catch(error => {
                            if (error.response) this.filterLoginErrors(error.response);
                        })
                }
            }

        },
        // Saves authentication token and redirects to the root page if login succeeded
        saveAuthToken(token) {
            localStorage.setItem('token', token);
            window.location.assign(window.BASE_PATH);
        },
        // Checks if the mail matches the right pattern
        validEmail: function() {
            let mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return mailRegex.test(this.user.email);
        },
        // Checks if the totp code matches the right pattern
        validTotpCode: function() {
            let totpCodeRegx = /^[0-9]{6}$/;
            return totpCodeRegx.test(this.user.totpToken);
        },
        // Sets the login mode (2FA login mode or normal login mode) according to the first login form submission
        setLoginMode: function(data) {
            if (data.uidb64 !== undefined && data.token !== undefined) {
                this.user.id = data.uidb64;
                this.user.loginToken = data.token;
                this.user.twoFactorAuth = true;
                this.user.totpToken = '';
            } else {
                this.saveAuthToken(data.token);
            }
        },
        // Handles http errors coming from the login form submission
        filterLoginErrors: function(error) {
            if (error.status === 401 || error.status === 400) {
                this.errors.InvalidCredentialsErr.show = true;
            } else {
                console.log('Unexpected error while logging in');
            }
        },
        //  Handles http errors coming from the login form submission in 2FA login mode
        filter2faLoginErrors: function(error) {
            switch(error.status) {
                case 400:
                    if(error.data.errors !== undefined) {
                        this.user.twoFactorAuth = false;
                        this.user.loginToken = null;
                        alert('Your login token has expired. Please try again.');
                    } else {
                        this.errors.ExpiredTotpTokenErr.show = true;
                        this.qrCode = '';
                    }
                    break;
                default:
                    console.log('Unexpected error while logging in');
            }
        }
    }
}
