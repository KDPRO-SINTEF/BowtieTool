let VisualizerComponent = {

    template: '#visualizer-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        isPublic:Number,
        nameInput:String,
        all_diagrams:Array,
        tags_selected:Array,
        show_all_tags: Boolean,
    },
    data: function () {
        return {

        }
    },
    methods: {
        //My functions
        openDiagram: function (diagram_name){
            chosen_diag = this.all_diagrams.find(d => d.name === diagram_name)
            var doc = mxUtils.parseXml(chosen_diag.diagram);
            window.parent.currentUI.editor.setGraphXml(doc.documentElement);
            window.parent.currentUI.editor.setGraphId(chosen_diag.id)
            if(chosen_diag.is_public){
                localStorage.setItem('is_public','true')
            }else{
                localStorage.setItem('is_public','false')
            }
            window.parent.currentUI.editor.setModified(false);
            window.parent.currentUI.editor.undoManager.clear();

            if (diagram_name !== "") {
                window.parent.currentUI.editor.setFilename(diagram_name);
                //window.parent.currentUI.editor.updateDocumentTitle();
                // this.updateDocumentTitle();
            }
            window.parent.currentUI.hideDialog()
            //window.parent.close()

        },
    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        // beforeMount is launched at the creation of the component
        diagram_to_show: function () {
            return this.all_diagrams.filter(diag =>{
                let areTagsOk = this.show_all_tags
                diagram_tags = JSON.parse(diag.tags)
                for(const tag of diagram_tags){
                    for(const tag_s of this.tags_selected){
                        if(tag === tag_s){
                            areTagsOk = true
                        }
                    }
                }
                // let nameOk = (diag.name.indexOf(this.nameInput) > -1) || (this.nameInput==="")
                let nameOk = (diag.name.toLowerCase().includes(this.nameInput.toLowerCase())) || (this.nameInput==="")
                const inDesc = diag.description.toLowerCase().includes(this.nameInput.toLowerCase());
                if(this.isPublic===2){
                    return diag.isSharedWithMe && areTagsOk && (nameOk || inDesc);
                }else{
                    return diag.is_public == this.isPublic && areTagsOk && (nameOk || inDesc);
                }
            })
        },
    },


}