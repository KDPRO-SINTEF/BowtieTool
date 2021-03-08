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
        test: function() {
            console.log(this.consequences);
        },
        updateImpactValue: function(consequence, event) {
            consequence.impactValue = parseInt(event.target.value);
        },
        updateProbability: function(consequence, event) {
            consequence.probability = parseInt(event.target.value);
        }
    }
}

let risk_vue = new Vue({
    el: '#risk_container',
    components : {
        'threats-component': ThreatsComponent,
        'consequences-component': ConsequencesComponent
    },
    data: {
        currentTab: 'Threats',
        tabs: ['Threats','Consequences']
    },
    computed: {

    }
})

