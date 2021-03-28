
let diagramSearch_vue = new Vue({
    el: '#diagram-search-vue',
    components: {
        'search-bar': SearchBarComponent,
        'visualizer': VisualizerComponent,
        'tag-manager': TagManagerComponent,
    },
    data: {
        isPublic: false,
        nameInput: "",
        all_diagrams: [],
        tags_selected:[],
        show_all_tags: true,

    },
    methods: {
        init: function () {
            var token = localStorage.getItem('token');
            if (!token) {
                mxUtils.alert(mxResources.get('notLoggedIn'));
                return;
            }
            // Getting all private diags
            axios.get(window.PRIVATE_DIAGS_URL, {
                headers: {
                    'Authorization': 'Token ' + token
                }
            })
                .then(res => {
                    console.log(res)
                    for (const diag of res.data) {
                        this.all_diagrams.push(diag)
                    }

                })
                .catch(error => {
                    console.log(error)
                })
            // Getting all the public diags
            axios.get(window.PUBLIC_DIAGS_URL, {
                headers: {
                    'Authorization': 'Token ' + token
                }
            })
                .then(res => {
                    console.log(res)
                    for (const diag of res.data) {
                        this.all_diagrams.push(diag)
                    }

                })
                .catch(error => {
                    console.log(error)
                })
        },
        onUpdateFromSearchBar: function (datas) {
            this.nameInput = datas[0]
            this.isPublic = datas[1]
        },
        onTagsChange:function (selected_tags){
            console.log("Change of tags!")
            this.show_all_tags = false
            this.tags_selected = selected_tags
        },
        onTagsEmpty:function (){
            this.show_all_tags = true
        }
    },
    mounted() {
        this.init()
    }
})