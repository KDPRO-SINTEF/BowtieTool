class Consequence{
    constructor(cell){
        this._cell = cell.id;
        this._impactValue =  "";
        this._probability =  "";
        this._barriers = [];
        this._name = cell.value;
    }
    allDefined(){
        return (this._impactValue !== "") && (this._probability !== "");
    }

    getProduct(){
        if(this.allDefined()){
            let barriersFailureProbability = 1;
            this.barriers.forEach(barrier => {
                barriersFailureProbability *= barrier.failureProbability;
            })
            return (this.impactValue * this.probability * barriersFailureProbability);
        }
    }
    get cell() {
        return this._cell;
    }

    set cell(newCell) {
        this._cell = newCell;
    }

    get name() {
        return this._name;
    }

    set name(newName) {
        this._name = newName;
    }

    get impactValue() {
        return this._impactValue;
    }

    set impactValue(value) {
        if (isNaN(value) || value < 0){
            this._impactValue = "";
        }else{
            this._impactValue = value;
        }
    }

    get probability() {
        return this._probability;
    }

    set probability(value) {
        if (isNaN(value) || value < 0 || value > 1){
            this._probability = "";
        }else{
            this._probability = value;
        }
    }

    get barriers() {
        return this._barriers;
    }

    set barriers(value) {
        this._barriers = value;
    }
}
