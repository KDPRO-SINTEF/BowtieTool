class Consequence{
    constructor(name, impactValue, probability){
        this._impactValue = (impactValue != null) ? impactValue : -1;
        this._probability = (probability != null) ? probability : -1;
        this._name = name;
    }
    allDefined(){
        return (this._impactValue !== -1) && (this._probability !== -1);
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
