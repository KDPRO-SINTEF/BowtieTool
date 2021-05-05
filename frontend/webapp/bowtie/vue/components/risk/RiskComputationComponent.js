/**
 * RiskComputationComponent
 * Description: uses to handle the risk computation
 */

let ThreatsComponent = {
    props: {
    },
    template: '#threats',
    data: function() {
        return {
            threats : [],
            display_threat : []
        }
    },
    beforeMount: function() {
            //Initialize threats array
            this.threats = window.parent.currentUI.editor.graph.getAllThreats();
    },
    mounted() {
        this.$emit("threats", this.threats);
    },
    methods: {
        display_detail : function(threat){
            const index = this.display_threat.indexOf(threat);
            if (index >= 0){
                this.display_threat.splice(index,1);
            } else {
                this.display_threat.push(threat);
            }
        },
        getDetailsButtonText(threat){
            if (this.display_threat.includes(threat)){
                return "Hide Parameters";
            }else{
                return "Edit Parameters";
            }
        },
        updateThreat: function (threat) {
            threat.updateThreatCellColor();
            this.emitThreats();
        },
        emitThreats: function () {
            this.$emit("threats", this.threats);
        }
    }
}

let ConsequencesComponent = {
    template: '#consequences',
    props:
        ['event-probability'],
    data: function() {
        return {
            consequences : [],
        }
    },
    beforeMount: function () {
        //Initialize consequences array
        this.consequences = window.parent.currentUI.editor.graph.getAllConsequences();
    },
    methods: {
        emitConsequences: function () {
            this.$emit("consequences", this.consequences);
        }
    },
    mounted() {
        this.$emit("consequences", this.consequences);
    }
}

let ResultComponent = {
    props:
        ['highest-risk-value', 'accumulated-risk-value', 'event-probability', 'missing-consequence'],
    template: '#result',
    data: function (){
        return{
            showFormulasDialog: false,
        }
    }

}

