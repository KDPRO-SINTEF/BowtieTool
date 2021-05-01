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
            this.refreshGraph();
            this.emitThreats();
        },
        emitThreats: function () {
            this.$emit("threats", this.threats);
        },
        refreshGraph: function () {
            window.parent.currentUI.editor.graph.refresh();
        },
    }
}

let ConsequencesComponent = {
    props: ['event-probability', 'highest-risk-value'],
    template: '#consequences',
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
        },
        isHighest: function (consequence) {
            if (!isNaN(this.eventProbability) && !isNaN(this.highestRiskValue)) {
                if ((consequence.impactValue * consequence.probability * this.eventProbability) >= this.highestRiskValue) {
                    return true;
                }
            }
            return false;

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
            showEventProbabilityFormula: false,
            showHighestRiskValueFormula: false,
            showAccumulatedRiskValueFormula: false
        }
    },
    methods: {
        getFormulaButtonText(button){
            switch (button){
                case "event":
                    if(this.showEventProbabilityFormula){return "Hide Formula";}
                    return "Show Formula";
                case "highest":
                    if(this.showHighestRiskValueFormula){return "Hide Formula"}
                    return "Show Formula";
                case "accumulated":
                    if(this.showAccumulatedRiskValueFormula){return "Hide Formula"}
                    return "Show Formula";
            }
        }
    }

}

