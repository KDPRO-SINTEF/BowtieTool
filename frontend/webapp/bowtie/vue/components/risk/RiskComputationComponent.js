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
                return "Hide Details";
            }else{
                return "Show Details";
            }
        },
        updateThreatActors: function (threat, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value > 10 || event.target.value === "") {
                console.log("Invalid threat actors value");
                threat.threatActors = "";
                threat.updateThreatCellColor();
                this.refreshGraph();
                this.emitThreats();
                return;
            }

            threat.threatActors = parseFloat(event.target.value);
            threat.updateThreatCellColor();
            this.refreshGraph();
            this.emitThreats();
        },
        updateOpportunity: function (threat, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value > 10 || event.target.value === "") {
                console.log("Invalid opportunity value");
                threat.opportunity = "";
                threat.updateThreatCellColor();
                this.refreshGraph();
                this.emitThreats();
                return;
            }

            threat.opportunity = parseFloat(event.target.value);
            threat.updateThreatCellColor();
            this.refreshGraph();
            this.emitThreats();
        },
        updateMeans: function (threat, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value > 10 || event.target.value === "") {
                console.log("Invalid means value");
                threat.means = "";
                threat.updateThreatCellColor();
                this.refreshGraph();
                this.emitThreats();
                return;
            }

            threat.means = parseFloat(event.target.value);
            threat.updateThreatCellColor();
            this.refreshGraph();
            this.emitThreats();
        },
        updateMotivation: function (threat, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value > 10 || event.target.value === "") {
                console.log("Invalid threat actors value");
                threat.motivation = "";
                threat.updateThreatCellColor();
                this.refreshGraph();
                this.emitThreats();
                return;
            }

            threat.motivation = parseFloat(event.target.value);
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
        updateImpactValue: function (consequence, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value === "") {
                console.log("Invalid impact value");
                consequence.impactValue = "";
                this.emitConsequences();
                return;
            }

            consequence.impactValue = parseFloat(event.target.value);
            this.emitConsequences();
        },
        updateProbability: function (consequence, event) {
            //Check input validity
            if (isNaN(event.target.value) || event.target.value < 0 || event.target.value > 1 || event.target.value === "") {
                console.log("Invalid probability value");
                consequence.probability = "";
                this.emitConsequences();
                return;
            }

            consequence.probability = parseFloat(event.target.value);
            this.emitConsequences();
        },
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
        /* Code used to transform objects into xml string
        getTestXml(){
            var encoder = new mxCodec(mxUtils.createXmlDocument());
            let objVer = new Array();
            window.parent.currentUI.editor.graph.getAllConsequences().forEach(elem => {
                objVer.push({...elem});
            });
            var result = encoder.encode(objVer);
            var xml = mxUtils.getXml(result);
            return xml;
        },
        getTestDecode(xml){
            var doc = mxUtils.parseXml(xml);
            var codec = new mxCodec(doc);
            let testObject = new Array();
            codec.decode(doc.documentElement, testObject);
            return testObject;
        }
        */
    }

}

