/**
 * RiskComputationComponent
 * Description: uses to handle the risk computation
 */

Vue.component('RiskComputationComponent',  {
    props: {
    },
    template: '#risk_computation',
    data: function() {
        return {
            editorUI: window.parent.currentUI,
            threats : [],
            consequences : []
        }
    },
    methods: {
    },
    beforeMount: function() {
            //Initialize threats array
            const threatsID = window.parent.currentUI.editor.graph.getAllThreatsID();
            threatsID.forEach(elem => this.threats.push(new Threat(elem[0], new Matrix(elem[1]))));

            //Initialize consequences array
            const consID = window.parent.currentUI.editor.graph.getAllConsequences();
            consID.forEach(elem => this.consequences.push(elem.value));
    }
})

let risk_vue = new Vue({
    el: '#risk_container',
    data: {
    },
    computed: {

    }
})

