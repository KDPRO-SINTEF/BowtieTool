import { store } from "../store.js";

export const AccountSettingsPage = {
    template: `
        <div id="settings">
            <div id="user-account">
                <div>
                    <div id="account-menu">
                        <div class="list-group">
                            <li class="list-group-item"><strong>Account settings</strong></li>
                            <button type="button" v-bind:class="['list-group-item', 'list-group-item-action', { 'active': onMenu('profile') }]" aria-current="true" v-on:click="toMenu('profile')">Profile</button>
                            <button type="button" v-bind:class="['list-group-item', 'list-group-item-action', { 'active': onMenu('security') }]" v-on:click="toMenu('security')">Security</button>
                            <button type="button" v-bind:class="['list-group-item', 'list-group-item-action', { 'active': onMenu('danger-zone') }]" v-on:click="toMenu('danger-zone')">Danger Zone</button>
                        </div>
                    </div>
                </div>
                <div>
                    <div id="account-settings">
                        <img src="../../images/bowtie-user.svg" class="mb-5" width="120px">
                        <router-view></router-view>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        toMenu: function(menu) {
            this.$router.push('/settings/' + menu);
        },
        onMenu: function(menu) {
            return this.$router.currentRoute.path === '/settings/' + menu;
        },
    },
    created() {
        if (!store.getters.isUserAuthenticated) {
            this.$router.push('/login');
        }
    }
}
