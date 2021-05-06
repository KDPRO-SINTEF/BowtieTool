let versionningSearch_vue = new Vue({
    el: '#versionning-search-vue',
    components: {
    },
    data: {
        all_diagrams: [],
        editor: undefined,
        graphID: undefined,
        token: undefined
    },
    methods: {
        init: function() {
            this.token = localStorage.getItem('sessionToken');
            this.editor = window.parent.currentUI.editor;
            this.graphID = this.editor.getGraphId();
            if (!this.token) {
                mxUtils.alert(mxResources.get('notLoggedIn'));
                return;
            }
            console.log(window.API_VERSIONNING_DIAGRAMS+this.graphID.toString());
            axios.get(window.API_VERSIONNING_DIAGRAMS+this.graphID.toString(), {
                headers: {
                    'Authorization': 'Token ' + this.token
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
        },
        openOldVersion: function (id_version, diagram){
            axios.post(window.API_SWITCH_VERSION+this.graphID.toString(),{id: id_version},{
                headers: {
                    'Authorization': 'Token ' + this.token
                }
            })
                .then(res => {
                    console.log(res)
                    this.editor.setGraphId(this.graphID);
                    console.log('Posted new diagram with id', this.graphID, 'and', this.graphID);
                    var doc = mxUtils.parseXml(diagram);
                    window.parent.currentUI.editor.setGraphXml(doc.documentElement);
                    window.parent.currentUI.hideDialog();
                })
                .catch(error => {

                    console.log(error)

                })
        }
    },
    mounted() {
        this.init();
    }
})