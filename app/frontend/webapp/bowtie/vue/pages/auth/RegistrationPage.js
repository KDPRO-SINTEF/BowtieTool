import * as validators from '/js/modules/validators.js';
import { store } from "../../store.js";

/**
 * Registration page
 * Related route: /register
 */
export const RegistrationPage = {
    template: `
        <div class="form__auth">
            <img src="/images/logo.png" class="bowtie-logo__auth">
            <h2 class="title__auth mb-4">Sign up to Bowtie++</h2>
            <div class="card text-dark bg-light mb-4 information-msg">
                <div class="card-body">
                    <p class="card-text">To be valid, a <b>password</b> must:
                        <ul class="m-0">
                            <li>Contain at least 9 characters</li>
                            <li>Be a mix of letters (uppercase AND lowercase), digits and special characters</li>
                        </ul>
                    </p>
                </div>
            </div>
            <div id="register-form">
                <form @submit.prevent="submitRegistrationForm">
                    <div class="mb-3">
                        <label for="username" class="form-label">Username <span class="text-danger">*</span></label>
                        <input id="username" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.username) }]" v-model="form.username.value" placeholder="Username">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.username, 'username') }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email address <span class="text-danger">*</span></label>
                        <input id="email" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.email) }]" v-model="form.email.value" placeholder="name@example.com">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.email, 'email') }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                        <input type="password" id="password" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.password) }]" v-model="form.password.value" placeholder="Password">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.password, 'password') }}</div>
                    </div>
                    <div class="mb-3">
                        <label for="password-confirm" class="form-label">Password Confirmation <span class="text-danger">*</span></label>
                        <input type="password" id="password-confirm" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.passwordConfirm) }]" v-model="form.passwordConfirm.value">
                        <div class="invalid-feedback">{{ validators.getErrorMessage(form.passwordConfirm, 'passwordConfirm') }}</div>
                    </div>
                    <button type="submit" v-bind:class="['btn', 'btn-full', 'btn-success', { disabled: waitForResponse }]">
                        <span v-if="!waitForResponse">Sign up</span>
                        <span v-else class="spinner-border text-light" role="status"></span>
                    </button>
                </form>
            </div>
        </div>
    `,
    data: function() {
        return {
            form: {
                username: {
                    value: '',
                    error: ''
                },
                email: {
                    value: '',
                    error: ''
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
            waitForResponse: false,
            validators: validators,
            validations: {
                username: ['required', 'valid'],
                email: ['required', 'valid'],
                password: ['required', 'valid'],
                passwordConfirm: ['required', 'valid']
            }
        }
    },
    methods: {
        checkRegistrationForm: function() {
            validators.checkForm(this.form, this.validations);
            if (this.form.password.error !== '') {
                this.form.passwordConfirm.value = '';
                this.form.passwordConfirm.error = '';
            }

            let formArray = Object.values(this.form);
            let checkOk = true;
            for (let i = 0; i < formArray.length; i++) {
                if (formArray[i].error !== '') {
                    checkOk = false;
                    break;
                }
            }
            return checkOk;
        },
        submitRegistrationForm: function() {
            if (this.checkRegistrationForm()) {
                this.waitForResponse = true;
                let requestData = { 'username': this.form.username.value, 'email': this.form.email.value, 'password': this.form.password.value };
                axios.post(window.API_REGISTER, requestData, {
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                    .then(res => {
                        if (res.status === 201) {
                            alert('An email has been sent for confirmation.');
                            this.$router.push('/login');
                        }
                    })
                    .catch(err => {
                        if (err.response) this.filterRegistrationErrors(err.response);
                    })
                    .finally(() => {
                        this.waitForResponse = false;
                    })
            }
        },
        filterRegistrationErrors: function(error) {
            if (error.status === 400) {
                let errorData = error.data.errors;
                if (errorData.username === 'Invalid field.') {
                    this.form.username.error = 'invalid';
                    this.form.username.value = '';
                }
                if (errorData.email === 'Invalid field.') {
                    this.form.email.error = 'invalid';
                    this.form.email.value = '';
                }
                if (errorData.password === 'Invalid field.') {
                    this.form.password.error = 'invalid';
                    this.form.password.value = '';
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
