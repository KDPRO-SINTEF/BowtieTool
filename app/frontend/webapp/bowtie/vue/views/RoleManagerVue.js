import {AddUserToShareWithComponent} from "../components/role-manager/AddUserToShareWithComponent.js";
import {UserVisualizerComponent} from "../components/role-manager/UserVisualizerComponent.js";

export const RoleManagerVue = new Vue({
    el: '#role-manager-vue',
    components: {
        'add-user': AddUserToShareWithComponent,
        'user-visualizer': UserVisualizerComponent,

    },
    data: {
        graphid:undefined,
        readers:[],
        writers:[],
        token:"",
        userToAdd:[],
    },
    methods: {
        init: function () {
            this.graphid = window.parent.currentUI.editor.getGraphId();
            this.token = localStorage.getItem('sessionToken')

            if (!this.token) {
                alert("You are not logged in")
                return
            }
            axios.get(window.API_SHARE_DIAGRAM + String(this.graphid), {
                headers: {
                    'Authorization': 'Token ' + this.token
                }
            })
                .then((res)=>{
                    // console.log(res)
                    this.readers = JSON.parse(res.data['readers'])
                    this.writers = JSON.parse(res.data['writers'])
                })
                .catch((error)=>{
                    //console.log(error)
                })
        },
        removeReader(email){
            this.readers = this.readers.filter(e => {
                return e !== email
            })
        },
        removeWriter(email){
            this.writers = this.writers.filter(e => {
                return e !== email
            })
        },
        addReader(email){
          this.readers.push(email)
        },
        addWriter(email){
            this.writers.push(email)
        },
        onNewShareEventParent: function (evt){
            this.userToAdd = evt
        }
    },
    mounted() {
        this.init()
    }
})
