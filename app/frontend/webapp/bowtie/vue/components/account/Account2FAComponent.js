import * as validators from '../../../js/modules/validators.js'
import { store } from "../../store.js";

export const Account2FAComponent = {
    props: {
        showActivationDialog: Boolean
    },
    template: `
        <div>
            <h4 class="mb-3">Two-factor authentication</h4>
            <div class="card text-dark bg-light mb-3 information-msg">
                <div class="card-body">
                    <p class="card-text" v-if="!showActivationDialog">
                        <span v-if="!is2faEnabled">
                            <span class="text-success"><strong>INFO: </strong></span>
                            Two-factor authentication adds a layer of security for your authentication process. Enabling it is <strong>really recommended</strong>.
                        </span>
                        <span v-else>
                            <span class="text-danger"><strong>Warning: </strong></span>
                            Two-factor authentication adds a layer of security for your authentication process. Leave it on is <strong>really recommended</strong>.
                        </span>
                    </p>
                    <p class="card-text" v-else>
                        Scan the following qrCode with an app such as Google Authenticator and enter the code it gives to you.
                    </p>
                </div>
            </div>
            <div v-if="!showActivationDialog">
                <div v-if="is2faEnabled">
                    <form @submit.prevent="submit2faDisablingForm">
                        <div class="mb-3">
                            <label for="totp-disabling" class="form-label">6-digit code</label>
                            <input id="totp-disabling" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.totp) }]" v-model="form.totp.value" maxlength="6" placeholder="123456">
                            <div class="invalid-feedback">{{ validators.getErrorMessage(form.totp, 'totp') }}</div>
                        </div>
                        <button type="submit" class="btn btn-medium btn-danger">
                            <span v-if="waitForResponse" class="spinner-border text-light" role="status"></span>
                            <span v-else>Disable 2FA</span>
                        </button>
                    </form>
                </div>
                <div v-else>
                    <button class="btn btn-medium btn-success" v-on:click="request2faActivation" v-if="!is2faEnabled">
                        <span v-if="waitForResponse" class="spinner-border text-light" role="status"></span>
                        <span v-else>Enable 2FA</span>
                    </button>
                </div>
            </div>
            <div v-else>
                <div class="mb-3">
                    <img v-bind:src="'data:image/png;base64,' + qrImage" width="70%">
                </div>
                <form @submit.prevent="submit2faActivationForm">
                    <div class="mb-3">
                        <label for="totp-activation" class="form-label">6-digit code</label>
                        <input id="totp-activation" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.totp) }]" v-model="form.totp.value" maxlength="6" placeholder="123456">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.totp, 'totp') }}</div>
                    </div>
                    <button type="button" class="btn btn-secondary" v-on:click="exit2faActivation">Cancel</button>
                    <button type="submit" class="btn btn-small btn-success">
                        <span v-if="waitForResponse" class="spinner-border text-light"></span>
                        <span v-else>Submit code</span>
                    </button>
                </form>
            </div>
        </div>
    `,
    data: function()  {
        return {
            form: {
                totp: {
                    value: '',
                    error: ''
                },
            },
            qrImage: null,
            validationToken: null,
            waitForResponse: false,
            validators: validators,
            validations: {
                totp: ['required', 'valid', 'correct']
            }
        }
    },
    computed: {
        is2faEnabled: function() {
            return store.state.user.twoFactorAuth;
        }
    },
    methods: {
        request2faActivation: function() {
            this.waitForResponse = true;
            axios.get(window.API_CREATE_2FA_CODE, {
                headers: {
                    Authorization: 'Token ' + store.state.user.sessionToken
                }
            })
                .then(res => {
                    if (res.status === 201) {
                        this.qrImage = res.data.qrImg;
                        this.validationToken = res.data.token;
                        this.$emit('activate-2fa');
                    }
                })
                .catch(err => {
                    this.$emit('show-toast', ['Failure while enabling two-factor authentication.', 'failure']);
                })
                .finally(() => {
                    this.waitForResponse = false;
                })
        },
        exit2faActivation: function() {
            this.qrImage = null;
            this.validationToken = null;
            this.waitForResponse = false;
            this.form.totp.value = '';
            this.form.totp.error = '';
            this.$emit('hide-2fa-dialog');
        },
        check2faForm: function() {
            validators.checkForm(this.form, this.validations);
            return (this.form.totp.error === '');
        },
        submit2faActivationForm: function() {
            if (this.check2faForm()) {
                this.waitForResponse = true;
                let fetchedUrl = window.API_VERIFY_2FA_CODE + '/' + this.validationToken;
                let requestData = { 'token_totp': this.form.totp.value }
                axios.post(fetchedUrl, requestData, {
                    headers: {
                        Authorization: 'Token ' + store.state.user.sessionToken,
                    }
                })
                    .then(res => {
                        if (res.status === 200) {
                            store.commit('setAuthenticationMode', true);
                            this.$emit('show-toast', ['Two-factor authentication is now enabled.', 'success']);
                            this.exit2faActivation();
                        }
                    })
                    .catch(err => {
                        if (err.response) this.filter2faActivationErrors(err.response);
                    })
                    .finally(() => {
                        this.waitForResponse = false;
                    })
            }
        },
        submit2faDisablingForm: function() {
            if (this.check2faForm()) {
                this.waitForResponse = true;
                let requestData = { 'token_totp': this.form.totp.value };
                axios.post(window.API_DISABLE_2FA, requestData, {
                    headers: {
                        Authorization: 'Token ' + store.state.user.sessionToken,
                        'Content-type': 'application/json'
                    }
                })
                    .then(res => {
                        store.commit('setAuthenticationMode', false);
                        this.form.totp.value = '';
                        this.form.totp.error = '';
                        this.$emit('show-toast', ['Two-factor authentication is now disabled.', 'success']);
                    })
                    .catch(err => {
                        if (err.response) this.filter2faDisablingErrors(err.response);
                    })
                    .finally(() => {
                        this.waitForResponse = false;
                    })
            }
        },
        filter2faActivationErrors: function(error) {
            if (error.status === 400) {
                this.form.totp.error = 'incorrect';
                this.form.totp.value = '';
            } else if (error.status === 401) {
                if (error.data.errors !== undefined) {
                    if (error.data.errors[0] === 'Validation token expired') {
                        this.$emit('show-toast', ['Validation token has expired, please try again.', 'failure']);
                        this.exit2faActivation();
                    }
                }
            }
        },
        filter2faDisablingErrors: function(error) {
            if (error.status === 400) {
                if (error.data.errors !== undefined) {
                    if (error.data.errors[0] === 'Invalid code') {
                        this.form.totp.error = 'incorrect';
                        this.form.totp.value = '';
                    }
                }
            }
        }
    }

}
