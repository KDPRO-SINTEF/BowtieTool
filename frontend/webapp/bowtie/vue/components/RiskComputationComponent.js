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
            threats : []
        }
    },
    methods: {
    },
    beforeMount: function() {
            const threatsID = window.parent.currentUI.editor.graph.getAllThreatsID();
            for(const arrayIndex in threatsID){
                this.threats.push(new Threat(threatsID[arrayIndex][0],new Matrix(threatsID[arrayIndex][1])));
            }
    }
})

let risk_vue = new Vue({
    el: '#risk_container',
    data: {
    },
    computed: {
        co
    }
})

