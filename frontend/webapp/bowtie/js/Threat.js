class Threat {

    constructor(threatCell,mat){
        if(mat === ''){
            constructorNoMat(threatCell);
        }else{
            this.threat = threatCell;
            this.matrix = mat;
        }
    }
    constructorNoMat(threatCell){
        this.threat = threatCell;
        this.matrix = null;
    }

    getName(){
        return this.threat.value;
    }

    getCell(){
        return this.threat;
    }
    getMatrix(){
        return this.matrix;
    }
}
