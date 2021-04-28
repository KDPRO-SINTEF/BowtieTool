import * as validators from '/js/modules/validators.js'
import { store } from "../../store.js"

export const LoginPage = {
    template: `
        <div class="form__auth">
            <img src="/images/logo.png" class="bowtie-logo__auth">
            <h2 class="title__auth mb-4">Login to Bowtie++</h2>
            <div id="login-form">
                <form v-on:keyup.enter="submitLoginForm">
                <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input id="email" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.email) }]" v-model="form.email.value" v-bind:disabled="totpLogin.required">
                    <div class="invalid-feedback">{{ validators.getErrorMessage(form.email, 'email') }}</div>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.password) }]" v-model="form.password.value" v-bind:disabled="totpLogin.required">
                    <div class="invalid-feedback">{{ validators.getErrorMessage(form.password, 'password') }}</div>
                    <router-link to="/" id="forgot-password-link">Forgot your password?</router-link>
                    <div class="error-message mt-2" v-show="validators.credentialsInError(form.email, form.password)">{{ validators.IncorrectCredentialsErr }}</div>
                </div>
                <div class="mb-3" hidden>
                    <label for="totp" class="form-label">6-digit code</label>
                    <input id="totp" class="form-control">
                </div>
                    <button type="button" class="btn btn-full btn-success mb-3" v-on:click="submitLoginForm">
                        <span v-if="!waitForResponse && !totpLogin.required">Login</span>
                        <span v-else-if="!waitForResponse && totpLogin.required">Submit code</span>
                        <div v-else class="spinner-border text-light" role="status"></div>
                    </button>
                </form>
                <p>Don't have an account yet? Please <router-link to="/register">register</router-link>.</p>
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
            validators: validators
        }
    },
    methods: {
        checkLoginForm: function() {
            let fieldsName = Object.keys(this.form);
            Object.values(this.form).forEach((field, index) => {
                let fieldType = fieldsName[index];
                field.error = '';
                if (validators.isEmpty(field)) {
                    field.error = 'missing';
                } else {
                    if (fieldType === 'email') {
                        if (!validators.validField(fieldType,  field.value)) {
                            field.error = 'invalid';
                            field.value = '';
                        }
                    }
                }
            });
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
                    //
                }
            }
        },
        setLoginMode: function(data) {
            if (data.uidb64 !== undefined && data.token !== undefined) {
                this.totpLogin.required = true;
                this.totpLogin.id = data.id;
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
        }
    },
    created() {
        if (store.state.isUserAuthenticated) {
            this.$router.push('/');
        }
    }
}
