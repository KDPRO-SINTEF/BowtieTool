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
            consequences : window.parent.currentUI.editor.graph.getAllConsequences()
        }
    },
    methods: {
        processThreats: function(input) {
            this.threats = input;

            //Check if there are threats to process
            if (this.threats.length === 0){
                this.eventProbability = 'no_threats';
                return;
            }

            let inter_res = 1;
            for(let i = 0; i < this.threats.length; i++){

                //Check if parameters of the threat are defined
                if(!this.threats[i].allDefined()){
                    this.eventProbability = "missing_param";
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
                this.highestRiskValue = "no_consequences";
                this.accumulatedRiskValue = "no_consequences";
                return;
            }

            let maxProduct = 0;
            let accumul = 0;
            let indexMax = -1;
            let oneDefined = false;
            this.missingConsequence = false;

            for(let i = 0; i < this.consequences.length; i++){

                //Check if one consequence attributes are not defined
                if (!this.consequences[i].allDefined()){
                    this.missingConsequence = true;
                    continue;
                }
                oneDefined = true;
                let product =  this.consequences[i].getProduct();
                if(product > maxProduct){
                    maxProduct = product;
                    indexMax = i;
                }
                accumul += product;
            }
            // Set the highest consequence "highest" attribute to true and set the indicator
            for(let i = 0; i < this.consequences.length; i++){
                if(this.consequences[i].allDefined()){
                    if(indexMax == i){
                        this.consequences[i].isHighest = true;
                        this.consequences[i].indicator = 10.0;
                    }else{
                        this.consequences[i].isHighest = false;
                        this.consequences[i].indicator = (this.consequences[i].getProduct() * 10) / maxProduct;
                    }
                }
                else{
                    this.consequences[i].isHighest = false;
                    this.consequences[i].indicator = "";
                }
            }

            //Check if at least one consequence attributes are defined
            if(!oneDefined){
                this.highestRiskValue = 'none_defined';
                this.accumulatedRiskValue = 'none_defined';
                return;
            }

            this.highestRiskValue = this.eventProbability * maxProduct;
            this.accumulatedRiskValue = this.eventProbability * accumul;
        }
    }
})
