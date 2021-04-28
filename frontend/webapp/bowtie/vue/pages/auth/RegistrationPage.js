import * as validators from '/js/modules/validators.js'
import { store } from "../../store.js";

export const RegistrationPage = {
    template: `
        <div class="form__auth">
            <img src="/images/logo.png" class="bowtie-logo__auth">
            <h2 class="title__auth mb-4">Register to Bowtie++</h2>
            <div id="password-policy" class="card text-dark bg-light mb-4">
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
                <form v-on:keyup.enter="submitRegisterForm">
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
                    <button type="button" v-bind:class="['btn', 'btn-full', 'btn-success', { disabled: waitForResponse } ]" v-on:click="submitRegisterForm">
                        <span v-if="!waitForResponse">Register</span>
                        <div v-else class="spinner-border text-light" role="status"></div>
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
            validators: validators
        }
    },
    methods: {
        checkRegisterForm: function() {
            let fieldsName = Object.keys(this.form);
            Object.values(this.form).forEach((field, index) => {
                let fieldType = fieldsName[index];
                // Erase old errors
                field.error = '';
                if (validators.isEmpty(field)) {
                    field.error = 'missing';
                    // If password is missing or invalid, cancel missing error for passwordConfirm
                    if (fieldType === 'passwordConfirm' && (validators.isMissing(this.form.password) || validators.isInvalid(this.form.password))) {
                        field.error = '';
                    }
                } else {
                    if (fieldType === 'passwordConfirm') {
                        // If password is invalid, erase passwordConfirm
                        // Else, check passwordConfirm
                        if (validators.isInvalid(this.form.password)) {
                            field.value = '';
                            this.form.passwordConfirm.value = '';
                        } else {
                            if (!validators.validField(fieldType, field.value, this.form.password.value)) {
                                field.error = 'invalid';
                                field.value = '';
                            }
                        }
                    } else {
                        if (!validators.validField(fieldType, field.value)) {
                            field.error = 'invalid';
                            field.value = '';
                        }
                    }
                }
            });

            let checkOk = true;

            Object.values(this.form).forEach(field => {
                if (field.error !== '') {
                    checkOk = false;
                }
            });
            return checkOk;
        },
        submitRegisterForm: function() {
            if (this.checkRegisterForm()) {
                this.waitForResponse = true;
                let requestData = { 'username': this.form.username.value, 'email': this.form.email.value, 'password': this.form.password.value };
                axios.post(window.REGISTER, requestData, {
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                    .then(res => {
                        if (res.status === 201) {
                            setTimeout(() => {
                                alert('An email has been sent for confirmation.');
                                this.$router.push('/login');
                            }, 10)
                        }
                    })
                    .catch(err => {
                        if (err.response) this.filterRegistrationErrors(err.response);
                    })
                    .finally(() => {
                        this.waitForResponse = false;
                    })
            }
            console.log('submitted');
        },
        filterRegistrationErrors: function(error) {
            if (error.status === 400) {
                let errorData = error.data.errors;
                if (errorData.username !== undefined) {
                    this.form.username.error = 'invalid';
                    this.form.username.value = '';
                }
                if (errorData.email !== undefined) {
                    this.form.email.error = 'invalid';
                    this.form.email.value = '';
                }
                if (errorData.password !== undefined) {
                    this.form.password.error = 'invalid';
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
