/**
 * Account2FAComponent
 * Handles the 2fa activation from the user account page
 * Related template: common/my_account.html
 */

let Account2faComponent = {
    template: '#account-2fa-template',
    props: {
        authToken: String,
        cleanErrorMessages: Function
    },
    data: function() {
        return {
            qrImage: null,
            validationToken: null,
            qrCode: '',
            errors: {
                UnauthorizedTotpCreationErr: {
                    message: "An error occurred - invalid authentication token.",
                    show: false
                },
                ExpiredTotpTokenErr: {
                    message: "This code has expired, try with a new one.",
                    show: false
                },
                InvalidTotpCodeErr: {
                    message: '6-digit code is required.',
                    show: false
                },
                ExpiredValidationTokenErr: {
                    message: "Validation token expired - quit this window and retry.",
                    show: false
                }
            }
        }
    },
    computed: {
        activeErrors: function() {
            return Object.values(this.errors).filter(error => error.show === true);
        }
    },
    // When mounted, gets the information needed for 2fa activation (qrCode and linked token)
    mounted() {
        axios.get(window.CREATE_2FA_CODE, {
            headers: {
                Authorization: 'Token ' + this.authToken
            }
        })
            .then(res => {
                this.qrImage = res.data.qrImg;
                this.validationToken = res.data.token;
            })
            .catch(error => {
                if (error.response) this.filterTotpCreateErrors(error.response);
            })
    },
    methods: {
        // Submits the 2FA activation form
        submit2faActivation: function () {
            this.cleanErrorMessages(this.errors);
            if (this.validTotpCode()) {
                let params = JSON.stringify({"token_totp": this.qrCode});
                let validate2faUrl = window.VALIDATE_2FA + '/' + this.validationToken;
                axios.post(validate2faUrl, params, {
                    headers: {
                        Authorization: 'Token ' + this.authToken,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(res => {
                        this.$emit('2fa-enabled');
                        location.hash = "settings";
                    })
                    .catch(error => {
                        if (error.response) this.filter2faActivationErrors(error.response);
                    })
            } else {
                this.errors.InvalidTotpCodeErr.show = true;
            }
        },
        // Checks if the entered qr code matches the right pattern
        validTotpCode: function() {
            let totpCodeRegx = /^[0-9]{6}$/;
            return totpCodeRegx.test(this.qrCode);
        },
        // Handles http errors coming from the 2FA creation request
        filterTotpCreateErrors: function(error) {
            switch(error.status) {
                case 401:
                    this.errors.UnauthorizedTotpCreationErr.show = true;
                    break;
                default:
                    console.log('Error while contacting the server.');
            }
        },
        // Handles http errors coming from the 2FA form submission
        filter2faActivationErrors: function(error) {
            switch(error.status) {
                case 400:
                    if (error.data.errors !== undefined) {
                        this.errors.ExpiredValidationTokenErr.show = true;
                    } else {
                        this.errors.ExpiredTotpTokenErr.show = true;
                        this.qrCode = '';
                    }
                default:
                    console.log('Error while contacting the server.');
            }
        }
    }
}