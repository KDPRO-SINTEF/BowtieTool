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
    },
    methods: {
        submit2faActivation: function() {
            let validate2faUrl = window.VALIDATE_2FA + this.qrCode;
            axios.post(validate2faUrl, {
                headers: {
                    Authorization: 'Token ' + this.totpToken
                }
            })
                .then(res => {
                    alert('OK');
                })
        }
    }
}