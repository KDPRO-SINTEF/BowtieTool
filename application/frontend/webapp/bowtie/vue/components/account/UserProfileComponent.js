import { store } from "../../store.js";

export const UserProfileComponent = {
    template: `
        <div>
            <h2 class="mb-4">Profile</h2>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input id="username" class="form-control" v-bind:value="username" disabled>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input id="email" class="form-control" v-bind:value="email" disabled>
            </div>
            <div class="mb-3">
                <label for="role" class="form-label">Role</label>
                <input id="role" class="form-control" v-bind:value="role" disabled>
            </div>
        </div>
    `,
    computed: {
        username: function() {
            return store.state.user.username;
        },
        email: function() {
            return store.state.user.email;
        },
        role: function () {
            if (store.state.user.researcher) return 'Researcher';
            else return 'Basic user';
        }
    }

}
