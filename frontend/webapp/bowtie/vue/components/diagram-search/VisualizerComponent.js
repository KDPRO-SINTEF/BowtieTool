let VisualizerComponent = {

    template: '#visualizer-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        isPublic: Number,
        nameInput: String,
        all_diagrams: Array,
        tags_selected: Array,
        show_all_tags: Boolean,
    },
    data: function () {
        return {}
    },
    methods: {
        //My functions
        openDiagram: function (diagram_id) {
            chosen_diag = this.all_diagrams.find(d => d.id === diagram_id);
            let doc;
            let data = undefined;
            let clearMatrix = false;
            //check for <diagram> tag and that the user has access to the risk computation, then set risk values
            if (chosen_diag.diagram.slice(0, 9) === "<diagram>") {
                diag = chosen_diag.diagram.slice(9, -10);
                let splittedDiagram = diag.split(/(?<=<\/mxGraphModel>)/);
                doc = mxUtils.parseXml(splittedDiagram[0]);
                // !== false to avoid getting error when it's undefined
                if(chosen_diag.isRiskShared !== false) {
                    data = mxUtils.parseXml(splittedDiagram[1]);
                }else{
                    clearMatrix = true;
                }
            } else {
                doc = mxUtils.parseXml(chosen_diag.diagram);
            }
            window.parent.currentUI.editor.setGraphXml(doc.documentElement);
            window.parent.currentUI.editor.setGraphId(chosen_diag.id);

            if(clearMatrix){
                window.parent.currentUI.editor.graph.clearAllMatrix();
            }
            //set graph values if xml contains risk values
            if (data !== undefined) {
                window.parent.currentUI.editor.setGraphValues(data.documentElement);
            }
            window.parent.currentUI.editor.graph.updateAllThreats();
            window.parent.currentUI.editor.graph.updateAllConsequences();
            if (chosen_diag.is_public) {
                localStorage.setItem('is_public', 'true')
            } else {
                localStorage.setItem('is_public', 'false')
            }
            window.parent.currentUI.editor.setModified(false);
            window.parent.currentUI.editor.undoManager.clear();

            if (chosen_diag) {
                window.parent.currentUI.editor.setFilename(chosen_diag.name);
                //window.parent.currentUI.editor.updateDocumentTitle();
                // this.updateDocumentTitle();
            }
            window.parent.currentUI.hideDialog()
            //window.parent.close()
        },
        deleteDiagram(diagram_id){
            if(confirm("Are you sure you want to delete this diagram")){
                const token = localStorage.getItem('sessionToken');
                if (!token) {
                    mxUtils.alert(mxResources.get('notLoggedIn'));
                    return;
                }
                axios.delete(window.API_UPDATE_DIAGRAM + diagram_id,{
                    headers:{
                        'Authorization': 'Token ' + token
                    }
                })
                    .then((res)=>{
                        const current_graphId = window.parent.currentUI.editor.getGraphId()
                        if(current_graphId === diagram_id){
                            window.parent.currentUI.editor.setGraphId(undefined);
                        }
                        // console.log("diagram successfully deleted")
                        this.$emit("diagram-delete",diagram_id)
                    })
                    .catch((error)=>{
                        console.log(error)
                    })
            }
        }
    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        // beforeMount is launched at the creation of the component
        diagram_to_show: function () {
            return this.all_diagrams.filter(diag => {
                let areTagsOk = this.show_all_tags
                diagram_tags = JSON.parse(diag.tags)
                for (const tag of diagram_tags) {
                    for (const tag_s of this.tags_selected) {
                        if (tag === tag_s) {
                            areTagsOk = true
                        }
                    }
                }
                // let nameOk = (diag.name.indexOf(this.nameInput) > -1) || (this.nameInput==="")
                let nameOk = (diag.name.toLowerCase().includes(this.nameInput.toLowerCase())) || (this.nameInput === "")
                const inDesc = diag.description.toLowerCase().includes(this.nameInput.toLowerCase());
                if (this.isPublic === 2) {
                    return diag.isSharedWithMe && areTagsOk && (nameOk || inDesc);
                } else {
                    return diag.is_public == this.isPublic && areTagsOk && (nameOk || inDesc);
                }
            })
        },
    },


}
