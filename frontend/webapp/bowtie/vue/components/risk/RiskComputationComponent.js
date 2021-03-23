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
        }
    },
    methods: {
    },
    beforeMount: function() {
            //Initialize threats array
            const threatsID = window.parent.currentUI.editor.graph.getAllThreatsID();
            threatsID.forEach(elem => this.threats.push(new Threat(elem[0], new Matrix(elem[1]))));
            this.threats.sort(function(a,b){return b.getName().toString() < a.getName().toString()});
    },
    mounted() {
        this.$emit("threats", this.threats);
    }
}

let ConsequencesComponent = {
    props: ['event-probability'],
    template: '#consequences',
    data: function() {
        return {
            consequences : [],
        }
    },
    beforeMount: function () {
        //Initialize consequences array
        const consID = window.parent.currentUI.editor.graph.getAllConsequences();
        consID.forEach(elem => this.consequences.push(new Consequence(elem.value)));
        this.consequences.sort(function(a,b){return b.name.toString() < a.name.toString()});
    },
    methods: {
        updateImpactValue: function(consequence, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value === ""){
                console.log("Invalid impact value");
                consequence.impactValue = -1;
                this.emitConsequences();
                return;
            }

            consequence.impactValue = parseFloat(event.target.value);
            this.emitConsequences();
        },
        updateProbability: function(consequence, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value > 1 || event.target.value === ""){
                console.log("Invalid probability value");
                consequence.probability = -1;
                this.emitConsequences();
                return;
            }

            consequence.probability = parseFloat(event.target.value);
            this.emitConsequences();
        },
        emitConsequences: function() {
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
                    break;
                case "highest":
                    if(this.showHighestRiskValueFormula){return "Hide Formula"}
                    return "Show Formula";
                    break;
                case "accumulated":
                    if(this.showAccumulatedRiskValueFormula){return "Hide Formula"}
                    return "Show Formula";
                    break;
            };

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
                if(!this.threats[i].getMatrix().allDefined()){
                    this.eventProbability = "missing_param";
                    console.log("Missing parameter(s) on " + this.threats[i].getName());
                    return;
                }

                inter_res *= (1.0 - this.threats[i].getMatrix().getProbability());
            }
            this.eventProbability = 1 - inter_res;
        },

        processConsequences: function(input){
            this.consequences = input;

            //Check if there are consequences to process
            if(this.consequences.length == 0){
                console.log("No consequences on diagram");
                this.highestRiskValue = "no_consequences";
                this.accumulatedRiskValue = "no_consequences";
                return;
            }

            let maxIv = 0;
            let maxProb = 0;
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
                let product =  this.consequences[i].impactValue * this.consequences[i].probability;
                if(product > maxIv * maxProb){
                    maxIv = this.consequences[i].impactValue;
                    maxProb = this.consequences[i].probability;
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

            this.highestRiskValue = this.eventProbability * maxIv * maxProb;
            this.accumulatedRiskValue = this.eventProbability * accumul;
        }
    }
})

