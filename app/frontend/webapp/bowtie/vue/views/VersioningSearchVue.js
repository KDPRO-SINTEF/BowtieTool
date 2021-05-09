let versioningSearch_vue = new Vue({
    el: '#versioning-search-vue',
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
            axios.get(window.API_VERSIONING_DIAGRAMS+this.graphID.toString(), {
                headers: {
                    'Authorization': 'Token ' + this.token
                }
            })
                .then(res => {
                    for (const diag of res.data) {
                        this.all_diagrams.push(diag)
                    }

                })
                .catch(error => {
                    //console.log(error)
                })
        },
        openOldVersion: function (id_version, diagram){
            let doc;
            let data = undefined;
            let clearMatrix = false;
            //check for <diagram> tag and that the user has access to the risk computation, then set risk values
            if (diagram.slice(0, 9) === "<diagram>") {
                diag = diagram.slice(9, -10);
                let splittedDiagram = diag.split(/(?<=<\/mxGraphModel>)/);
                doc = mxUtils.parseXml(splittedDiagram[0]);
                // !== false to avoid getting error when it's undefined
                if(diagram.isRiskShared !== false) {
                    data = mxUtils.parseXml(splittedDiagram[1]);
                }else{
                    clearMatrix = true;
                }
            } else {
                doc = mxUtils.parseXml(diagram);
            }
            window.parent.currentUI.editor.setGraphXml(doc.documentElement);
            //clear Matrix if needed
            if(clearMatrix){
                window.parent.currentUI.editor.graph.clearAllMatrix();
            }
            //set graph values if xml contains risk values
            if (data !== undefined) {
                window.parent.currentUI.editor.setGraphValues(data.documentElement);
            }
            window.parent.currentUI.editor.graph.updateAllThreats();
            window.parent.currentUI.editor.graph.updateAllConsequences();
            window.parent.currentUI.hideDialog();
        }
    },
    mounted() {
        this.init();
    },
})
