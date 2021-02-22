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
            threats: window.parent.currentUI.editor.graph.getAllThreatsInfo(),
        }
    },
    methods: {
        /*getIndicatorColor: function(probability){
            switch (true){
                case (probability < 0.2):
                    return
                    break;
                ...
            }
        }*/
    }
})

let risk_vue = new Vue({
    el: '#risk_container',
    data: {
    }
})

