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
                data:params,
                headers: {
                    'Authorization': 'Token ' + this.token
                }
            })
                .then((res) => {
                    this.$emit("remove-reader", email)
                    console.log(res)
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
                    console.log(res)
                })
                .catch((error) => {
                    console.log(error)
                })

        },

    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        // beforeMount is launched at the creation of the component

    },


}