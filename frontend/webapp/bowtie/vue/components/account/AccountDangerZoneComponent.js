import * as validators from '../../../js/modules/validators.js';
import { store } from "../../store.js";

export const AccountDangerZoneComponent = {
    template: `
        <div>
            <h2 class="mb-4">Danger zone</h2>
            <h4 class="mb-3">Delete my account</h4>
            <div class="card text-dark bg-light mb-3 information-msg">
                <div class="card-body">
                    <p class="card-text">
                        <span class="text-danger"><strong>WARNING: </strong></span>
                        Deleting your account is irreversible. All your data will be erased from our database.
                    </p>
                </div>
            </div>
            <form @submit.prevent="submitAccountDeletionForm">
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" v-bind:class="['form-control', { 'is-invalid': validators.inError(form.password) }]" v-model="form.password.value">
                    <div class="invalid-feedback">{{ validators.getErrorMessage(form.password, 'password') }}</div>
                </div>
                <button type="submit" class="btn btn-medium btn-danger">
                    <span v-if="waitForResponse" class="spinner-border text-light" role="status"></span>
                    <span v-else>Delete my account</span>
                </button>
            </form>
        </div>
    `,
    data: function() {
        return {
            form: {
                password: {
                    value: '',
                    error: ''
                }
            },
            waitForResponse: false,
            validators: validators,
            validations: {
                password: ['required', 'correct']
            }
        }
    },
    methods: {
        checkAccountDeletionForm: function() {
            validators.checkForm(this.form, this.validations);
            return this.form.password.error === '';

        },
        submitAccountDeletionForm: function() {
            if (this.checkAccountDeletionForm()) {
                let userConfirmation = confirm('Continue by deleting your account?');
                if (userConfirmation) {
                    let requestData = { 'password': this.form.password.value }
                    axios.post(window.API_DELETE_ACCOUNT, requestData, {
                        headers: {
                            Authorization: 'Token ' + store.state.user.sessionToken
                        }
                    })
                        .then(res => {
                            if (res.status === 200) {
                                alert('Your account has been successfully deleted.');
                                store.commit('setAuthenticationStatus', false);
                                store.dispatch('logout');
                                window.location.assign(window.ROOT_PAGE);
                            }
                        })
                        .catch(err => {
                            if (err.response) this.filterAccountDeletionErrors(err.response);
                        })
                        .finally(() => {
                            this.waitForResponse = false;
                        })
                }
            }
        },
        filterAccountDeletionErrors: function(error) {
            if (error.status === 400) {
                this.form.password.value = '';
                this.form.password.error = 'incorrect';
            }
        }

    }
}
