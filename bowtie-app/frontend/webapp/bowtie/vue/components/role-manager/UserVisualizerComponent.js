export const UserVisualizerComponent = {

    template: '#user-visualizer-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        readers: Array,
        writers: Array,
        graphid: Number,
        token: String,
    },
    data: function () {
        return {}
    },
    methods: {
        removeReader(email) {

            const params = {role: "reader", email: email}
            axios.delete(window.API_SHARE_DIAGRAM + this.graphid, {
                data: params,
                headers: {
                    'Authorization': 'Token ' + this.token
                }
            })
                .then((res) => {
                    this.$emit("remove-reader", email)
                    // console.log(res)
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        removeWriter(email) {
            const params = {role: "writer", email: email}
            axios.delete(window.API_SHARE_DIAGRAM + this.graphid, {
                data: params,
                headers: {
                    'Authorization': 'Token ' + this.token
                }
            })
                .then((res) => {
                    this.$emit("remove-writer", email)
                    // console.log(res)
                })
                .catch((error) => {
                    console.log(error)
                })

        },
        startDrag: function(evt, email, column){
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('email', email)
            evt.dataTransfer.setData('from', column)
            // column: 0 == reader, 1 == writer

        },
        onDropEvent: function (evt, to){
            // evt.preventDefault();
            const email = evt.dataTransfer.getData('email')
            const from = evt.dataTransfer.getData("from")
            if (to !== from) {
                if(from === '0'){
                    this.removeReader(email)
                    this.$emit("new-share", [email, "writer"])
                }
                else{
                    this.removeWriter(email)
                    this.$emit("new-share", [email, "reader"])
                }
            }
        },
        dragover_handler: (ev) => {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "move";
        },

    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        // beforeMount is launched at the creation of the component

    },


}