class Threat {

    constructor(threatCell,mat){
        this._cell = threatCell.id;
        this._name = threatCell.value;
        this._matrix = mat;

    }

    get name(){
        return this._name;
    }
    set name(newName){
        this._name = newName;
    }
    get cell(){
        return this._cell;
    }
    get matrix(){
        return this._matrix;
    }
    set matrix(newMatrix){
        this._matrix = newMatrix;
    }
}
