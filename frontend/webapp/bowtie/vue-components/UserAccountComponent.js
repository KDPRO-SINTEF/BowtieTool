let AccountProfileComponent = {
    template: '#account-profile-template',
    props: {
        userName: String,
        userEmail: String
    }
}

let AccountSecurityComponent = {
    template: '#account-security-template',
    props: {
        is2faActivated: Boolean
    },
    data: function() {
        return {
            userPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    }
}

let user_account_vue = new Vue({
    el: '#user-account-container',
    components: {
        'account-profile-component': AccountProfileComponent,
        'account-security-component': AccountSecurityComponent
    },
    data: {
        currentTab: 'Profile',
        tabs: ['Profile', 'Security'],
        isUserAuthenticated: true,
        userInfo: {
            name: null,
            email: null,
            authToken: null,
            is2faActivated: false
        },
        test: "bonsoir"
    },
    computed: {
        currentTabComponent: function() {
            return 'account-' + this.currentTab.toLowerCase() + '-component';
        }
    },
    /*beforeMount() {
        this.userInfo.name = localStorage.getItem('username');
        this.userInfo.authToken = localStorage.getItem('token');
        if (this.userInfo.name !== null && this.userInfo.authToken !== null) {
            axios.post(window.USER_INFO, {
                headers: {
                    Authorization: 'Token' + this.userInfo.authToken
                }
            })
                .then(res => {
                    this.userInfo.email = res.data.email;
                    this.userInfo.is2faActivated = false;
                    this.isUserAuthenticated = true;
                })
        }

    },*/
    methods: {

    }

})

