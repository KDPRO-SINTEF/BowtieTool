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

    },
    mounted() {
        this.$emit("threats", this.threats);
    }
}

let ConsequencesComponent = {
    props: {
    },
    template: '#consequences',
    data: function() {
        return {
            consequences : [],
        }
    },
    beforeMount: function () {
        //Initialize consequences array
        const consID = window.parent.currentUI.editor.graph.getAllConsequences();
        consID.forEach(elem => this.consequences.push(new Consequence(elem.value,0,0)));
    },
    methods: {
        updateImpactValue: function(consequence, event) {
            consequence.impactValue = parseFloat(event.target.value);
            this.emitConsequences();
        },
        updateProbability: function(consequence, event) {
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

let risk_vue = new Vue({
    el: '#risk_container',
    components : {
        'threats-component': ThreatsComponent,
        'consequences-component': ConsequencesComponent
    },
    data: function(){
        return {
            currentTab: 'Threats',
            tabs: ['Threats', 'Consequences'],
            threats: [],
            resultMax: '',
            result2: '',
            result3: '',
            event_probability: 1,
            consequences : []
        }
    },
    methods: {
        processThreats: function(input) {

            this.threats = input;

            let inter_res = 1;
            for(let i = 0; i < this.threats.length; i++){
                inter_res *= (1.0 - this.threats[i].getMatrix().getMeanValue()/10);
            }

            this.event_probability = 1 - inter_res;
        },

        processConsequences: function(input){
            this.consequences = input;
            this.computeAllResults();
        },

        computeAllResults: function (){
            this.computeMax();
            //this.compute2();
            //this.compute3();
        },

        computeMax: function (){
            let max_iv = 0;
            let max_prob = 0;
            for(let i = 0; i < this.consequences.length; i++){
                if(this.consequences[i].impactValue > max_iv){
                    max_iv = this.consequences[i].impactValue;
                    max_prob = this.consequences[i].probability;
                }
            }
            this.resultMax = this.event_probability * max_iv * max_prob;
        }
    }
})

