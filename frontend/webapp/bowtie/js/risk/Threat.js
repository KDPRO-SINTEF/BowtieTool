class Threat {

    constructor(threatCell,mat){
        this._cell = threatCell.id;
        this._name = threatCell.value;
        this._matrix = mat;
        this._threatActors = "";
        this._opportunity = "";
        this._means = "";
        this._motivation = "";
        this._barriers = [];
        this.setParameters();
    }

    setParameters(){
        this._threatActors == "" ? this._threatActors = this.convertColorToValue(this._matrix.getACT()) : this._matrix.setACT(this._threatActors);
        this._opportunity == "" ? this._opportunity = this.convertColorToValue(this._matrix.getOPP()) : this._matrix.setOPP(this._opportunity);
        this._means == "" ? this._means = this.convertColorToValue(this._matrix.getMEA()) : this._matrix.setMEA(this._means);
        this._motivation == "" ? this._motivation = this.convertColorToValue(this._matrix.getMTV()) : this._matrix.setMTV(this._motivation);
        this.updateThreatCellColor();
    }

    updateThreatCellColor(){
        let threatCell = window.currentUI.editor.graph.model.getCell(this._cell);
        if (this.allDefined()) {
            switch (this.getColorIndicator()) {
                case '#00ff06':
                    threatCell.setStyle('shape=mxgraph.bowtie.verylowthreat;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed');
                    break;
                case '#a7ec67':
                    threatCell.setStyle('shape=mxgraph.bowtie.lowthreat;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed');
                    break;
                case '#fffe00':
                    threatCell.setStyle('shape=mxgraph.bowtie.mediumthreat;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed');
                    break;
                case '#fe773d':
                    threatCell.setStyle('shape=mxgraph.bowtie.highthreat;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed');
                    break;
                case '#ff0000':
                    threatCell.setStyle('shape=mxgraph.bowtie.veryhighthreat;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed');
                    break;
                default:
                    break;
            }
        }else{
            threatCell.setStyle('shape=mxgraph.bowtie.threat;whiteSpace=wrap;html=1;fontSize=16;aspect=fixed');
        }
        window.currentUI.editor.graph.refresh();
    }

    convertColorToValue(color){
        switch (color){
            case '#00ff06':
                return 0.5;

            case '#a7ec67':
                return 2.5;

            case '#fffe00':
                return 4.5;

            case '#fe773d':
                return 6.5;

            case '#ff0000':
                return 9.0;

            default:
                return "";
        }
    }
    getProbability(){
        if (!this.allDefined()){
            return ('Missing parameters');
        }else{
            let barriersFailureProbability = 1;
            this.barriers.forEach(barrier => {
                barriersFailureProbability *= barrier.failureProbability;
            })
            return ((this.getMeanValue()/10) * barriersFailureProbability);
        }
    }

    getMeanValue(){
        if (!this.allDefined()){
            return ('Missing parameters');
        }else{
            return (this.threatActors+this.opportunity+this.means+this.motivation)/4;
        }
    }

    getColorIndicator(){
        const mean = this.getMeanValue();
        switch(true){
            case mean < 1.0:
                return '#00ff06';

            case mean < 3.0:
                return '#a7ec67';

            case mean < 5.0:
                return '#fffe00'

            case mean < 7.0:
                return '#fe773d';

            default:
                return '#ff0000';
        }
    }

    allDefined(){
        return ((this._threatActors !== "") && (this._opportunity !== "") && (this._means !== "") && (this._motivation !== ""));
    }

    //Getters and Setters

    get name(){
        return this._name;
    }

    set name(newName){
        this._name = newName;
        //useful to clear style when opening a diagram
        this.updateThreatCellColor();
    }

    get cell(){
        return this._cell;
    }

    get matrix(){
        return this._matrix;
    }

    set matrix(newMatrix){
        this._matrix = newMatrix;
        this.setParameters();
    }

    get threatActors() {
        return this._threatActors;
    }

    set threatActors(value) {
        //Check input validity
        if (isNaN(value) || value < 0 || value > 10 || value == ""){
            this._threatActors = "";
        }else{
            this._threatActors = parseFloat(value);
        }
        this._matrix.setACT(this._threatActors);
    }

    get opportunity() {
        return this._opportunity;
    }

    set opportunity(value) {
        //Check input validity
        if (isNaN(value) || value < 0 || value > 10 || value == ""){
            this._opportunity = "";
        }else{
            this._opportunity = parseFloat(value);
        }
        this._matrix.setOPP(this._opportunity);
    }

    get means() {
        return this._means;
    }

    set means(value) {
        //Check input validity
        if (isNaN(value) || value < 0 || value > 10 || value == ""){
            this._means = "";
        }else{
            this._means = parseFloat(value);
        }
        this._matrix.setMEA(this._means);
    }

    get motivation() {
        return this._motivation;
    }

    set motivation(value) {
        //Check input validity
        if (isNaN(value) || value < 0 || value > 10 || value == ""){
            this._motivation = "";
        }else{
            this._motivation = parseFloat(value);
        }
        this._matrix.setMTV(this._motivation);
    }

    get barriers() {
        return this._barriers;
    }

    set barriers(value) {
        this._barriers = value;
    }
}
