/**
 * ValidationVue
 * Handles different validations linked to sent email
 * For : email verification, password reset, totp validation
 * Related template : validation.html
 */

let validation_vue = new Vue({
    el: '#validation-vue',
    data: {
        context: null,
        user: {
            id: null,
            token: null
        },
        isPasswordChangeSuccessful : false,
        isRegistrationSuccessful: false,
        errors: {
            ExpiredTokenErr: {
                message: 'An error occurred. Please check your email box for a valid link.',
                show: false
            },
            InvalidUrlErr: {
                message: '404 Page not found.',
                show: false
            },
        }
    },
    beforeMount() {
        this.processUrlParams(window.location.href);
    },
    mounted() {
        if (this.context !== undefined && this.user.id !== undefined && this.user.token !== undefined) {
            this.processValidationInfo();
        } else {
            this.errors.InvalidUrlErr.show = true;
        }
    },
    methods: {
        // Get the information about the user via the url params
        processUrlParams: function(url) {
            let result = new Object
            let idx = url.lastIndexOf('?');
            if (idx > 0) {
                let params = url.substring(idx + 1).split('&');
                for (let i = 0; i < params.length; i++ ) {
                    idx = params[i].indexOf('=');
                    if (idx > 0) {
                        result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
                    }

                }
            }
            this.context = result.for;
            this.user.id = result.id;
            this.user.token = result.token;
        },
        // Makes the necessary validations according to the user information
        processValidationInfo: function() {
            let url = '';
            let user_info = '/' + this.user.id + '/' + this.user.token;
            if (this.context === 'email_confirm') {
                url = window.CONFIRM_EMAIL + user_info;
                axios.get(url)
                    .then(res => {
                        if (res.status === 200) {
                            this.isRegistrationSuccessful = true;
                            console.log("Registration");
                            //alert('Your email is now confirmed.')
                        }
                    })
                    .catch(error => {
                        if (error.response) this.filterEmailConfirmErrors(error.response)
                    })
            } else if (this.context === 'reset_pwd') {
                if (this.user.token !== null && this.user.id !== null) {
                    localStorage.setItem('resetPwdToken', this.user.token);
                    localStorage.setItem('userId', this.user.id);
                    this.isPasswordChangeSuccessful = true;
                    console.log("Pasword");
                    alert('Your password reset request is now authorized. You will be redirected to the corresponding page.')
                    location.assign(window.RESET_PWD_PAGE);
                }
            }
        },
        // Handles http errors coming from the validations
        filterEmailConfirmErrors: function(error) {
            switch(error.status) {
                case 400:
                    this.errors.ExpiredTokenErr.show = true;
                    break;
                case 404:
                    this.errors.InvalidUrlErr.show = true;
                    break;
            }
        }
    }
})