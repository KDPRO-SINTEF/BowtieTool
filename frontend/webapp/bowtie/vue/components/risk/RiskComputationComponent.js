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

let risk_vue = new Vue({
    el: '#risk_container',
    components : {
        'threats-component': ThreatsComponent,
        'consequences-component': ConsequencesComponent,
        'result-component': ResultComponent
    },
    data: function(){
        return {
            currentTab: 'Threats',
            tabs: ['Threats', 'Consequences'],
            threats: [],
            highestRiskValue: 'none_defined',
            accumulatedRiskValue: 'none_defined',
            missingConsequence: false,
            eventProbability: 'no_threats',
            consequences : []
        }
    },
    methods: {
        processThreats: function(input) {
            this.threats = input;

            //Check if there are threats to process
            if (this.threats.length === 0){
                this.eventProbability = 'no_threats';
                console.log("No threat linked to a likelihood matrix were found on the diagram");
                return;
            }

            let inter_res = 1;
            for(let i = 0; i < this.threats.length; i++){

                //Check if parameters of the threat are defined
                if(!this.threats[i].allDefined()){
                    this.eventProbability = "missing_param";
                    console.log("Missing parameter(s) on " + this.threats[i].name);
                    return;
                }

                inter_res *= (1.0 - this.threats[i].getProbability());
            }
            this.eventProbability = 1 - inter_res;
            this.processConsequences(this.consequences);
        },

        processConsequences: function(input){
            this.consequences = input;

            //Check if there are consequences to process
            if(this.consequences.length === 0){
                console.log("No consequences on diagram");
                this.highestRiskValue = "no_consequences";
                this.accumulatedRiskValue = "no_consequences";
                return;
            }

            let maxProduct = 0;
            let accumul = 0;
            let oneDefined = false;
            this.missingConsequence = false;

            for(let i = 0; i < this.consequences.length; i++){

                //Check if one consequence attributes are not defined
                if (!this.consequences[i].allDefined()){
                    console.log(this.consequences[i].name + " : Missing consequence parameters")
                    this.missingConsequence = true;
                    continue;
                }
                oneDefined = true;
                let product =  this.consequences[i].getProduct();
                if(product > maxProduct){
                    maxProduct = product;
                }
                accumul += product;
            }

            //Check if at least one consequence attributes are defined
            if(!oneDefined){
                this.highestRiskValue = 'none_defined';
                this.accumulatedRiskValue = 'none_defined';
                console.log("No consequence parameters are defined");
                return;
            }

            this.highestRiskValue = this.eventProbability * maxProduct;
            this.accumulatedRiskValue = this.eventProbability * accumul;
        }
    }
})

