let versionningSearch_vue = new Vue({
    el: '#versionning-search-vue',
    components: {
    },
    data: {
        all_diagrams: [],
        editor: null
    },
    methods: {
        init: function() {
            var token = localStorage.getItem('sessionToken');
            this.editor = window.parent.currentUI.editor;
            var graphID = this.editor.getGraphId();
            if (!token) {
                mxUtils.alert(mxResources.get('notLoggedIn'));
                return;
            }
            console.log(window.VERSIONNING_DIAGRAMS_URL+graphID.toString());
            axios.get(window.VERSIONNING_DIAGRAMS_URL+graphID.toString(), {
                headers: {
                    'Authorization': 'Token ' + token
                }
            })
                .then(res => {
                    console.log(res)
                    for (const diag of res.data) {
                        diag.isSharedWithMe = false
                        this.all_diagrams.push(diag)
                    }

                })
                .catch(error => {
                    console.log(error)
                })
            console.log("Exemple id : ");
            console.log(this.all_diagrams[0])
        }
    },
    mounted() {
        this.init();
    }
})