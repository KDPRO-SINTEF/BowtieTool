import { PasswordUpdateComponent } from "./PasswordUpdateComponent.js";
import { BaseToastComponent } from "../BaseToastComponent.js";

export const AccountSecurityComponent = {
    template:  `
        <div>
            <h2 class="mb-4"> Security</h2>
            <password-update v-on:password-updated="showToastMessage($event)"></password-update>
            <transition name="fade">
                <toast v-bind:message="toast.message" v-bind:show="toast.show"></toast>
            </transition>
        </div>
    `,
    data: function() {
        return {
            toast: {
                message: '',
                show: false
            }
        }
    },
    components: {
        'password-update': PasswordUpdateComponent,
        'toast': BaseToastComponent
    },
    methods: {
        showToastMessage: function(message) {
            this.toast.message = message;
            this.toast.show = true;
            window.setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        }
    }
}
