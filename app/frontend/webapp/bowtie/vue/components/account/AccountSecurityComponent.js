import { PasswordUpdateComponent } from "./PasswordUpdateComponent.js";
import { BaseToastComponent } from "../BaseToastComponent.js";
import { Account2FAComponent } from "./Account2FAComponent.js";

export const AccountSecurityComponent = {
    template:  `
        <div>
            <h2 class="mb-4"> Security</h2>
            <password-update class="mb-4" v-on:show-toast="showToastMessage($event)" v-if="!show2faActivationDialog"></password-update>
            <two-factor-auth v-on:activate-2fa="show2faActivationDialog=true" v-on:hide-2fa-dialog="show2faActivationDialog=false" v-on:show-toast="showToastMessage($event[0], $event[1])" v-bind:showActivationDialog="show2faActivationDialog"></two-factor-auth>
            <toast v-bind:message="toast.message" v-bind:show="toast.show" v-bind:eventType="toast.type"></toast>
        </div>
    `,
    data: function() {
        return {
            toast: {
                message: '',
                show: false,
                type: ''
            },
            show2faActivationDialog: false
        }
    },
    components: {
        'password-update': PasswordUpdateComponent,
        'two-factor-auth': Account2FAComponent,
        'toast': BaseToastComponent
    },
    methods: {
        showToastMessage: function(message, eventType) {
            this.toast.message = message;
            this.toast.show = true;
            this.toast.type = eventType;
            window.setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        }
    }
}
