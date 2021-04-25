class Consequence{
    constructor(cell){
        this._cell = cell.id;
        this._impactValue =  "";
        this._probability =  "";
        this._name = cell.value;
    }
    allDefined(){
        return (this._impactValue !== "") && (this._probability !== "");
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
        this._impactValue = value;
    }

    get probability() {
        return this._probability;
    }

    set probability(value) {
        this._probability = value;
    }

}
