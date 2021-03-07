let Account2faComponent = {
    template: '#account-2fa-template',
    props: {
        authToken: String
    },
    data: function() {
        return {
            qrImage: null,
            totpToken: null,
            qrCode: '',
            errors: {
                UnauthorizedTotpCreationErr: {
                    message: "An error occurred - invalid authentication token.",
                    show: false
                }
            }
        }
    },
    mounted() {
        axios.get(window.CREATE_2FA_CODE, {
            headers: {
                Authorization: 'Token ' + this.authToken
            }
        })
            .then(res => {
                this.qrImage = res.data.qrImg;
                this.totpToken = res.data.token;
            })
            .catch(error => {
                if (error.response) this.filterTotpCreateErrors(error.response);
            })
    },
    methods: {
        submit2faActivation: function () {
            let params = JSON.stringify({"token_totp": this.qrCode});
            let validate2faUrl = window.VALIDATE_2FA + this.totpToken;
            axios.post(validate2faUrl, params, {
                headers: {
                    Authorization: 'Token ' + this.authToken,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.$emit('2fa-enabled');
                    location.hash = "settings";
                });
        },
        filterTotpCreateErrors: function(error) {
            switch(error.status) {
                case 401:
                    this.errors.UnauthorizedTotpCreationErr.show = true;
                    break;
            }
        }
    }
}