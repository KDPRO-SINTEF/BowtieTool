export const EmailConfirmationPage = {
    template: `
        <div id="email-confirm">
            <div class="card shadow">
                <div class="card-header">
                    <div class="card-header-content">
                        <img src="../../../images/logo.png" id="card-header-logo">
                        <div class="card-header-text">Bowtie++</div>
                    </div>
                </div>
                <div class="card-body">
                    <div v-if="waitForResponse">
                        <div class="text-center">
                            <span class="spinner-border text-secondary" role="status"></span>
                        </div>
                    </div>
                    <div v-else>
                        <div v-if="success">
                            <h5 class="card-title text-success">Successful email confirmation</h5>
                            <p class="card-text">Your email is now confirmed. You can login to your account with the link below and start creating bowtie diagrams.</p>
                            <router-link to="/login">Login page</router-link>
                        </div>
                        <div v-else>
                            <h5 class="card-title text-danger">Unsuccessful email confirmation</h5>
                            <p class="card-text">An error occurred. If you're trying to confirm your email, check your mailbox and use the link we sent after your registration.</p>
                            <router-link to="/">Home page</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function() {
        return {
            id: null,
            confirmationToken: null,
            success: false,
            waitForResponse: true
        }
    },
    methods: {
        confirmEmail: function() {
            let url = window.API_CONFIRM_EMAIL + '/' + this.id + '/' + this.confirmationToken;
            axios.get(url)
                .then(res => {
                    if (res.status === 200) {
                        this.success = true;
                    }
                })
                .catch(err => {
                    this.success = false;
                })
                .finally(() => {
                    this.waitForResponse = false;
                })
        }
    },
    created() {
        let urlData = this.$route.query;
        if (urlData.id !== undefined && urlData.token !== undefined) {
            this.id = urlData.id;
            this.confirmationToken = urlData.token;
            this.confirmEmail();
        } else {
            this.$router.push('/404');
        }
    }
}
