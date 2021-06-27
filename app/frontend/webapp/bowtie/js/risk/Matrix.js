class Matrix{
    constructor(matrixCell){
        if(matrixCell != null) {
            this.matrixCell = matrixCell.id;
            this.actColor = this.getLaneColor(matrixCell.children[0]);
            this.oppColor = this.getLaneColor(matrixCell.children[1]);
            this.meaColor = this.getLaneColor(matrixCell.children[2]);
            this.mtvColor = this.getLaneColor(matrixCell.children[3]);
        }else{
            //Default Value, useful to avoid having errors in RiskComputationComponent component
            this.matrixCell = -1;
            this.actColor = '#cafefd';
            this.oppColor = '#cafefd';
            this.meaColor = '#cafefd';
            this.mtvColor = '#cafefd';
        }
    }

    getEllipseColor(ellipseCell){
        if(ellipseCell.style.split(";")[1].split("=")[1] === '1'){
            return '#cafefd';
        }
        return ellipseCell.style.split(";")[1].split("=")[1];
    }

    getLaneColor(laneCell){
        for(const ellipse in laneCell.children){
            if (this.getEllipseColor(laneCell.children[ellipse]) !== '#cafefd'){
                return this.getEllipseColor(laneCell.children[ellipse]);
            }
        }
        return '#cafefd';
    }

    convertValueToColor(value){
        if (value != ""){
            switch(true){
                case (value < 1.5):
                    return '#00ff06';

                case (value < 3.5):
                    return '#a7ec67';

                case (value < 5.5):
                    return '#fffe00'

                case (value < 7.5):
                    return '#fe773d';

                default:
                    return '#ff0000';
            }
        }
        return '#cafefd';

    }

    convertColorToIndex(color){
        switch (color){
            case '#00ff06':
                return 0;

            case '#a7ec67':
                return 1;

            case '#fffe00':
                return 2;

            case '#fe773d':
                return 3;

            case '#ff0000':
                return 4;

            default:
                return -1;
        }
    }

    clearLane(lane){
        lane.children.forEach(ellipse => {
            ellipse.setStyle("ellipse;fillColor=#cafefd");
        })
    }

    updateMatrixColors(){
        if(this.matrixCell == -1){return;}
        let matCell = window.currentUI.editor.graph.model.getCell(this.matrixCell);
        if (this.convertColorToIndex(this.actColor) == -1){
            this.clearLane(matCell.children[0]);
        }else{
            this.clearLane(matCell.children[0]);
            matCell.children[0].children[this.convertColorToIndex(this.actColor)].setStyle("ellipse;fillColor=" + this.actColor);
        }
        if (this.convertColorToIndex(this.oppColor) == -1){
            this.clearLane(matCell.children[1]);
        }else{
            this.clearLane(matCell.children[1]);
            matCell.children[1].children[this.convertColorToIndex(this.oppColor)].setStyle("ellipse;fillColor=" + this.oppColor);
        }
        if (this.convertColorToIndex(this.meaColor) == -1){
            this.clearLane(matCell.children[2]);
        }else{
            this.clearLane(matCell.children[2]);
            matCell.children[2].children[this.convertColorToIndex(this.meaColor)].setStyle("ellipse;fillColor=" + this.meaColor);
        }
        if (this.convertColorToIndex(this.mtvColor) == -1){
            this.clearLane(matCell.children[3]);
        }else{
            this.clearLane(matCell.children[3]);
            matCell.children[3].children[this.convertColorToIndex(this.mtvColor)].setStyle("ellipse;fillColor=" + this.mtvColor);
        }
    }

    getACT(){
        return this.actColor;
    }

    setACT(value){
        this.actColor = this.convertValueToColor(value);
        this.updateMatrixColors();
    }

    getOPP(){
        return this.oppColor;
    }

    setOPP(value){
        this.oppColor = this.convertValueToColor(value);
        this.updateMatrixColors();
    }

    getMEA(){
        return this.meaColor;
    }

    setMEA(value){
        this.meaColor = this.convertValueToColor(value);
        this.updateMatrixColors();
    }

    getMTV(){
        return this.mtvColor;
    }

    setMTV(value){
        this.mtvColor = this.convertValueToColor(value);
        this.updateMatrixColors();
    }

    getMatrixCell(){
        return this.matrixCell;
    }
}


