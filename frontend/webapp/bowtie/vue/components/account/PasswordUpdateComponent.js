import * as validators from  '../../../js/modules/validators.js'
import { store } from "../../store.js";

export const PasswordUpdateComponent = {
    template: `
        <div>
            <h4 class="mb-3">Password Update</h4>
            <div class="card text-dark bg-light mb-3 information-msg">
                <div class="card-body">
                    <p class="card-text">
                        The new password <strong>must be different</strong> from the old one.
                    </p>
                </div>
            </div>
            <form @submit.prevent="submitPasswordUpdateForm">
                <div class="mb-3">
                    <label for="password-old" class="form-label">Old password</label>
                    <input type="password" id="password-old" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.oldPassword) }]" v-model="form.oldPassword.value">
                    <div class="invalid-feedback">{{ validators.getErrorMessage(form.oldPassword, 'oldPassword') }}</div>
                </div>
                <div class="mb-3">
                    <label for="password-new" class="form-label">New password</label>
                    <input type="password" id="password-new" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.password) }]" v-model="form.password.value">
                    <div class="invalid-feedback">{{ validators.getErrorMessage(form.password, 'newPassword') }}</div>
                </div>
                <div class="mb-3">
                    <label for="password-confirm" class="form-label">New password confirmation</label>
                    <input type="password" id="password-confirm" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.passwordConfirm) }]" v-model="form.passwordConfirm.value">
                    <div class="invalid-feedback">{{ validators.getErrorMessage(form.passwordConfirm, 'passwordConfirm') }}</div>
                </div>
                <button type="submit" class="btn btn-medium btn-dark">
                    <span v-if="waitForResponse" class="spinner-border text-light" role="status"></span>
                    <span v-else>Update my password</span>
                </button>
            </form>
        </div>
    `,
    data: function() {
        return {
            form: {
                oldPassword: {
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
            validators: validators,
            validations: {
                oldPassword: ['required', 'correct'],
                password: ['required', 'valid'],
                passwordConfirm: ['required', 'valid']
            },
            waitForResponse: false
        }
    },
    methods: {
        checkPasswordUpdateForm: function() {
            validators.checkForm(this.form, this.validations);
            if (this.form.password.error !== '') {
                this.form.passwordConfirm.value = '';
                this.form.passwordConfirm.error = '';
            }
            return (this.form.oldPassword.error === '' && this.form.password.error === '' && this.form.passwordConfirm.error === '');
        },
        submitPasswordUpdateForm: function() {
            if (this.checkPasswordUpdateForm()) {
                this.waitForResponse = true;
                let requestData = { 'old_password': this.form.oldPassword.value, 'new_password': this.form.password.value };
                axios.put(window.API_UPDATE_PASSWORD, requestData, {
                    headers: {
                        Authorization: 'Token ' + store.state.user.sessionToken
                    }
                })
                    .then(res => {
                        if (res.status === 200) {
                            this.$emit('show-toast', 'Your password has been updated.');
                            Object.values(this.form).forEach(field => {
                                field.value = '';
                                field.error = '';
                            })
                        }
                    })
                    .catch(err => {
                        if (err.response) this.filterPasswordUpdateErrors(err.response);
                    })
                    .finally(() => {
                        this.waitForResponse = false;
                    })

            }
        },
        filterPasswordUpdateErrors: function(error) {
            if (error.status === 400) {
                let errorData = error.data;
                if (errorData.new_password !== undefined) {
                    switch(errorData.new_password[0]) {
                        case 'This field is required.':
                            this.form.password.error = 'missing';
                            break;
                        case 'The two passwords must be different.':
                            this.form.password.value = ''
                            this.form.password.error = 'invalid';
                            this.form.passwordConfirm.value = '';
                            break;
                    }
                }
                if (errorData.old_password !== undefined) {
                    switch(errorData.old_password[0]) {
                        case 'This field is required.':
                            this.form.oldPassword.error = 'missing';
                            break;
                        case 'Wrong old password.':
                            this.form.oldPassword.value  = '';
                            this.form.oldPassword.error = 'incorrect';
                            break;
                    }
                }
                if (errorData.password !== undefined) {
                    this.form.password.value = ''
                    this.form.password.error = 'invalid';
                    this.form.passwordConfirm.value = '';
                }
            }
        }
    }
}
