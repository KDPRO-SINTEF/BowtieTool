let SearchBarComponent = {

    template: '#search-bar-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        nameInput:String,
    },
    data: function () {
        return {
            is_public: false,
        }
    },
    methods: {
        //My functions
        publicChange: function (value) {
            this.is_public = value
            this.$emit('update_diagrams',["",this.is_public])
        }

    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        // beforeMount is launched at the creation of the component
        beforeMount() {

        }
    }

}