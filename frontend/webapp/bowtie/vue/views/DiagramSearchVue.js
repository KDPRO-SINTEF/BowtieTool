let diagramSearch_vue = new Vue({
    el: '#diagram-search-vue',
    components: {
        'search-bar': SearchBarComponent,
        'visualizer': VisualizerComponent,
        'tag-manager': TagManagerComponent,
    },
    data: {
        isPublic: 0,
        nameInput: "",
        all_diagrams: [],
        tags_selected: [],
        show_all_tags: true,
        loaded: {
            public: false,
            private: false,
            sharedWithMe: false
        }
    },
    computed: {
        allDiagramsLoaded: function() {
            return this.loaded.public && this.loaded.private && this.loaded.sharedWithMe;
        }
    },
    methods: {
        init: function () {
            var token = localStorage.getItem('sessionToken');
            if (!token) {
                mxUtils.alert(mxResources.get('notLoggedIn'));
                return;
            }
            // Getting all private diags
            axios.get(window.API_PRIVATE_DIAGRAMS, {
                headers: {
                    'Authorization': 'Token ' + token
                }
            })
                .then(res => {
                    // console.log(res)
                    this.loaded.private = true;
                    for (const diag of res.data) {
                        diag.isSharedWithMe = false
                        this.all_diagrams.push(diag)
                    }

                })
                .catch(error => {
                    console.log(error)
                })
            // Getting all the public diags
            axios.get(window.API_PUBLIC_DIAGRAMS, {
                headers: {
                    'Authorization': 'Token ' + token
                }
            })
                .then(res => {
                    // console.log(res)
                    this.loaded.sharedWithMe = true;
                    this.loaded.public = true;
                    for (const diag of res.data) {
                        diag.isSharedWithMe = false
                        this.all_diagrams.push(diag)
                    }

                })
                .catch(error => {
                    console.log(error)
                })
            // Getting all the diagrams shared with me
            axios.get(window.API_DIAGRAMS_SHARED_WITH_ME,{
                headers: {
                    'Authorization': 'Token ' + token
                }
            }).then(
                res => {
                    // console.log(res)
                    for (const diag of res.data) {
                        diag.isSharedWithMe = true
                        this.all_diagrams.push(diag)
                    }
                }
            ).catch(
                error => {
                    console.log(error)
                }
            )
        },
        onUpdateFromSearchBar: function (datas) {
            if (datas[0] !== "") {
                this.nameInput = datas[0]
            }
            this.isPublic = datas[1]
        },
        onTagsChange: function (selected_tags) {
            this.show_all_tags = false
            this.tags_selected = selected_tags
        },
        onTagsEmpty: function () {
            this.show_all_tags = true
        }
    },
    created() {
        this.init()
    }
})
