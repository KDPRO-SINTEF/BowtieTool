Vue.component('AuthorizationsComponent', {
    template: `<p v-if="isActionSuccessful">Success</p>
                    <p v-else>Fail</p>`,
    data: function() {
        return {
            context: null,
            userId: null,
            userToken: null,
            isActionSuccessful: false
        }
    },
    methods: {
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
            this.userId = result.id;
            this.userToken = result.token;
        },
        sendAuthRequest: function() {
            let url = '';
            let user_info = this.userId + '/' + this.userToken;
            if (this.context === 'email_confirm') {
                url = window.CONFIRM_EMAIL + user_info;
                axios.get(url)
                    .then(res => {
                        this.isActionSuccessful = true
                        location.assign(window.LOGIN_PAGE);
                    });
            } else if (this.context === 'reset_pwd') {
                localStorage.setItem('resetPwdToken', this.userToken);
                localStorage.setItem('userId', this.userId);
                location.assign(window.PWD_RESET);
                this.isActionSuccessful = true
            }
        }
    },
    beforeMount() {
        this.processUrlParams(window.location.href);
    },
    mounted() {
        this.sendAuthRequest();
    }
})

let authorize_vue = new Vue({
    el: "#authorize-vue",
})