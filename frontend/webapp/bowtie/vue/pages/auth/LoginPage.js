import * as validators from '/js/modules/validators.js';
import { store } from "../../store.js";

export const LoginPage = {
    template: `
        <div class="form__auth">
            <img src="/images/logo.png" class="bowtie-logo__auth">
            <h2 class="title__auth mb-4">Sign in to Bowtie++</h2>
            <div id="login-form">
                <form @submit.prevent="submitLoginForm">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input id="email" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.email) }]" v-model="form.email.value" v-bind:disabled="totpLogin.required">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.email, 'email') }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" id="password" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.password) }]" v-model="form.password.value" v-bind:disabled="totpLogin.required">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.password, 'password') }}</div>
                        <router-link to="/password-reset" id="forgot-password-link">Forgot your password?</router-link>
                        <div class="error-message mt-2" v-show="validators.credentialsInError(form.email, form.password)">{{ validators.IncorrectCredentialsErr }}</div>
                    </div>
                    <div class="mb-3" v-if="totpLogin.required">
                        <label for="totp" class="form-label">6-digit code</label>
                        <input id="totp" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.totp) }]" v-model="form.totp.value" placeholder="123456">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.totp, 'totp') }}</div>
                    </div>
                    <button type="submit" v-bind:class="['btn', 'btn-full', 'btn-success', 'mb-3', { disabled: waitForResponse }]">
                        <span v-if="waitForResponse" class="spinner-border text-light" role="status"></span>
                        <span v-else-if="!totpLogin.required">Login</span>
                        <span v-else="!waitForResponse && totpLogin.required">Submit code</span>
                    </button>
                </form>
                <p>Don't have an account yet? Please <router-link to="/register">sign up</router-link>.</p>
            </div>
        </div>
    `,
    data: function() {
        return {
            form: {
                email: {
                    value: '',
                    error: ''
                },
                password: {
                    value: '',
                    error: ''
                },
                totp: {
                    value: '',
                    error: ''
                }
            },
            totpLogin: {
                id: null,
                token: null,
                required: false
            },
            waitForResponse: false,
            validators: validators,
            validations: {
                email: ['required', 'valid'],
                password: ['required'],
                totp: ['required', 'valid', 'correct']
            }
        }
    },
    methods: {
        checkLoginForm: function() {
            validators.checkForm(this.form, this.validations);
            if (this.totpLogin.required) {
                return (this.form.totp.error === '');
            } else {
                this.form.totp.error = '';
                return (this.form.email.error === '' && this.form.password.error === '');
            }

        },
        submitLoginForm: function() {
            if (this.checkLoginForm()) {
                this.waitForResponse = true;
                let requestData = {};
                if (!this.totpLogin.required) {
                    requestData = { 'email': this.form.email.value, 'password': this.form.password.value }
                    store.dispatch('login', requestData)
                        .then(res => {
                            if (res.status === 200) this.setLoginMode(res.data);
                        })
                        .catch(err => {
                            if (err.response) this.filterLoginErrors(err.response);
                        })
                        .finally(() => {
                            this.waitForResponse = false;
                        })
                } else {
                    let fetchedUrl = window.API_LOGIN_2FA + '/' + this.totpLogin.id + '/' + this.totpLogin.token;
                    let requestData = { 'token_totp': this.form.totp.value };
                    axios.post(fetchedUrl, requestData)
                        .then(res => {
                            if (res.status === 200) this.saveSessionToken(res.data.token);
                        })
                        .catch(err => {
                            if (err.response) this.filter2faLoginErrors(err.response);
                        })
                        .finally(() => {
                            this.waitForResponse = false;
                        })
                }
            }
        },
        setLoginMode: function(data) {
            if (data.uidb64 !== undefined && data.token !== undefined) {
                this.totpLogin.required = true;
                this.totpLogin.id = data.uidb64;
                this.totpLogin.token = data.token;
            } else {
                this.saveSessionToken(data.token);
            }
        },
        saveSessionToken(token) {
            localStorage.setItem('sessionToken', token);
            store.commit('setSessionToken', token);
            store.dispatch('fetchUserData')
                .then(res => {
                    store.commit('setAuthenticationStatus', true);
                    store.commit('setUserData', res.data);
                    this.$router.push('/');
                });
        },
        filterLoginErrors: function(error) {
            if (error.status === 401) {
                if (error.data.errors !== undefined) {
                    this.form.email.error = 'credentials';
                    this.form.password.error = 'credentials';
                    this.form.password.value = '';
                }
            }
        },
        filter2faLoginErrors: function(error) {
            if (error.status === 400) {
                if (error.data.errors !== undefined) {
                    if (error.data.errors[0] === 'Expired token') {
                        alert('An error occured, please try again.');
                        this.totpLogin.required = false;
                        this.totpLogin.id = null;
                        this.totpLogin.token = null;
                        this.form.totp.value = '';
                        this.form.totp.error = '';
                    } else {
                        this.form.totp.error = 'incorrect';
                        this.form.totp.value = '';
                    }
                }
            }
        }
    },
    created() {
        if (store.getters.isUserAuthenticated) {
            this.$router.push('/settings');
        }
    }
}
