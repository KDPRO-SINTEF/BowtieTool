/**
 * UserLoginComponent
 * Description: uses to handle the login process via the login form (see login.html)
 */

Vue.component('UserLoginComponent',  {
    props: {
        title: String
    },
    template: '#user-login',
    data: function() {
        return {
            userEmail: '',
            userPassword: '',
            errors: {
                wrongCredentialsErr: {
                    message: 'Provided credentials are wrong. Please try again.',
                    show: false
                }
            }
        }
    },
    methods: {
        // Submit the login by fetching the api
        loginSubmit: function () {
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
                    if (error.response) {
                        if (error.response.status === 400) {
                            this.userPassword = '';
                            this.errors.wrongCredentialsErr.show = true;
                        }
                    }
                })
                /*.then(res => {
                    if (res.status == 400) {
                        this.userPassword = '';
                        this.errors.wrongCredentialsErr.show = true;
                        if(!res.ok) throw new Error('Error while login.');
                    } else {
                        this.processToken(res.data.token);
                    }
                })
            .catch(error => {
                console.error(error.message);
            });*/
        },
        // Handle the token if the login form has been correctly submitted
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
        // Handle the user information after request
        processName: function (name) {
            localStorage.setItem('username', name);
            window.location.assign(window.BASE_PATH);

        }
    }
})

let login_vue = new Vue({
    el: '#login-form-container',
    data: {
        title: 'Login'
    }
})

