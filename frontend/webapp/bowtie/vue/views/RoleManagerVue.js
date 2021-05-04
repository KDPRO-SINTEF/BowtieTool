import{AddUserToShareWithComponent} from "../components/role-manager/AddUserToShareWithComponent.js";
import {UserVisualizerComponent} from "../components/role-manager/UserVisualizerComponent.js";

export let RoleManagerVue = new Vue({
    el: '#role-manager-vue',
    components: {
        'add-user': AddUserToShareWithComponent,
        'user-visualizer': UserVisualizerComponent
    },
    data: {

    },
    methods: {
        init: function () {
        }
    },
    mounted() {
        this.init()
    }
})
