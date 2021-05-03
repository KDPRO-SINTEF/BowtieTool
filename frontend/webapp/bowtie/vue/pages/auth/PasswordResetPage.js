import * as validators from '/js/modules/validators.js';

export const PasswordResetPage = {
    template:`
        <div class="form__auth">
            <img src="/images/logo.png" class="bowtie-logo__auth">
            <h2 class="title__auth mb-4">Password reset</h2>
            <div id="password-reset-form">
                <div class="card text-dark bg-light mb-4 information-msg" v-if="!emailReceived">
                    <div class="card-body">
                    <p class="card-text">To start the password reset procedure, enter your email address in the field below.
                        Then, use the link you receive at this address.
                    </p>
                    </div>
                </div>
                <div v-show="fetchingError" class="alert alert-danger alert-dismissible" role="alert">
                    Sorry, an error occurred. Please, try again.
                    <button type="button" class="btn-close" v-on:click="fetchingError=false"></button>
                </div>
                <form @submit.prevent="submitPasswordResetForm">
                    <div v-if="!emailReceived">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email address</label>
                            <input id="email" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.email) }]" v-model="form.email.value">
                            <div class="invalid-feedback">{{ validators.getErrorMessage(form.email, 'email')}}</div>
                        </div>
                    </div>
                    <div v-else>
                         <div class="mb-3">
                            <label for="password" class="form-label">New password</label>
                            <input type="password" id="password" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.password) }]" v-model="form.password.value">
                            <div class="invalid-feedback">{{ validators.getErrorMessage(form.password, 'password')}}</div>
                        </div>
                        <div class="mb-3">
                            <label for="passwordConfirm" class="form-label">Password confirmation</label>
                            <input type="password" id="passwordConfirm" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.passwordConfirm) }]" v-model="form.passwordConfirm.value">
                            <div class="invalid-feedback">{{ validators.getErrorMessage(form.passwordConfirm, 'passwordConfirm')}}</div>
                        </div>
                    </div>
                    <button type="submit" v-bind:class="['btn', 'btn-full', 'btn-success', 'mb-3', { disabled: waitForResponse }]">
                        <span v-if="waitForResponse" class="spinner-border text-light" role="status"></span>
                        <span v-else-if="!emailReceived">Send password reset email</span>
                        <span v-else>Submit new password</span>
                    </button>
                </form>
            </div>
        </div>
    `,
    data: function() {
        return {
            form: {
                email: {
                    value: '',
                    error: '',
                },
                password: {
                    value: '',
                    error: ''
                },
                passwordConfirm: {
                    value: '',
                    error: ''
                }
            },
            resetData: {
                id: null,
                token: null
            },
            emailReceived: false,
            waitForResponse: false,
            fetchingError: false,
            validators: validators,
            validations: {
                email: ['required', 'valid'],
                password: ['required', 'valid'],
                passwordConfirm: ['required', 'valid']
            }
        }
    },
    methods: {
        checkPasswordResetForm: function() {
            validators.checkForm(this.form, this.validations);
            if (!this.emailReceived) {
                return (this.form.email.error === '');
            } else {
                if (this.form.password.error !== '') {
                    this.form.passwordConfirm.value = '';
                    this.form.passwordConfirm.error = '';
                }
                return (this.form.password.error === '' && this.form.passwordConfirm.error === '');
            }
        },
        submitPasswordResetForm: function() {
            this.fetchingError = false;
            if (this.checkPasswordResetForm()) {
                let requestData = {};
                let fetchedUrl = '';
                this.waitForResponse = true;
                if (!this.emailReceived) {
                    fetchedUrl = window.API_RESET_PASSWORD;
                    requestData = { 'email': this.form.email.value };
                    axios.post(fetchedUrl, requestData, {
                        headers: {
                            'Content-type': 'application/json'
                        }
                    })
                        .then(res => {
                            if (res.status === 200) {
                                alert('A password reset email has been sent.');
                                this.$router.push('/login');
                            }
                        })
                        .catch(err => {
                            if (err.response) this.filterEmailSubmissionErrors(err.response);
                            else this.fetchingError = true;
                        })
                        .finally(() => {
                            this.waitForResponse = false;
                        })

                } else {
                    fetchedUrl = window.API_RESET_PASSWORD + '/' + this.resetData.id + '/' + this.resetData.token;
                    requestData = { 'password': this.form.password.value };
                    axios.post(fetchedUrl, requestData)
                        .then(res => {
                            if (res.status === 200) {
                                alert('Your password has been successfully reset.');
                                this.$router.push('/login');
                            }
                        })
                        .catch(err => {
                            this.fetchingError = true;
                            this.$router.push('/password-reset');
                            this.resetData.id = null;
                            this.resetData.token = null;
                            this.emailReceived = false;
                        })
                        .finally(() => {
                            this.waitForResponse = false;
                        })
                }
            }
        },
        filterEmailSubmissionErrors: function(error) {
            if (error.status === 400) {
                if (error.data.email !== undefined) {
                    if (error.data.email[0] === 'Enter a valid email address.') {
                        this.form.email.error = 'invalid';
                    } else {
                        this.form.email.error = 'missing';
                    }
                    this.form.email.value = '';
                }
            } else {
                this.fetchingError = true;
            }
        }
    },
    created: function() {
        let urlData = this.$route.query;
        if (urlData.id !== undefined && urlData.token !== undefined) {
            this.resetData.id = urlData.id;
            this.resetData.token = urlData.token;
            this.emailReceived = true;
        }
    },
}
