let auth_vue = new Vue({
    el: '#auth-vue',
    components: {
        'login': LoginComponent,
        'register': RegisterComponent,
        'password-reset': PasswordResetComponent
    },
    data: {
        currentTab: 'login',
        tabs: ['login', 'password-reset', 'register'],
    },
    computed: {
        tabTitle: function() {
            if (this.isCurrentTab('login')) {
                return 'Login to Bowtie++'
            } else if (this.isCurrentTab('register')) {
                return 'Register to Bowtie++'
            } else if (this.isCurrentTab('password-reset')) {
                return 'Password reset'
            }
        }

    },
    methods: {
        isCurrentTab: function(tab) {
            return this.currentTab === tab;
        },
        switchToTab(tab) {
            this.currentTab = tab;
            location.hash = this.currentTab;
        },
        processUrlHash(hash) {
            if (this.tabs.includes(hash)) {
                this.currentTab = hash;
            } else {
                location.hash = 'login';
            }
        },
        cleanAllErrors: function(errors) {
            Object.values(errors).forEach(error => {
                error.show = false
            });
        }
    },
    beforeMount() {
        this.processUrlHash(location.hash.substring(1));
    }
})