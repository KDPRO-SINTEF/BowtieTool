class Consequence{
    constructor(name, impactValue, probability){
        this._impactValue = (impactValue != null) ? impactValue : 0;
        this._probability = (probability != null) ? probability : 0;
        this._name = name;
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
