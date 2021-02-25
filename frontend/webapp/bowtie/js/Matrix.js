class Matrix{
    constructor(matrixCell){
        this.threatActors = this.getLaneValue(matrixCell.children[0]);
        this.opportunity = this.getLaneValue(matrixCell.children[1]);
        this.means = this.getLaneValue(matrixCell.children[2]);
        this.motivation = this.getLaneValue(matrixCell.children[3]);
    }

    getEllipseColor(ellipseCell){
        return ellipseCell.style.split(";")[1].split("=")[1];
    }

    getLaneValue(laneCell){
        for(const ellipse in laneCell.children){
            if (this.getEllipseColor(laneCell.children[ellipse]) != '#cafefd'){
                return this.convertColorToValue(this.getEllipseColor(laneCell.children[ellipse]));
            }
        }
        return null;
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
        }
    }
    getMeanValue(){
        return (this.getACT()+this.getOPP()+this.getMEA()+this.getMTV())/4;
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
                return "#ff0000";
        }
    }
    isAllDefined(){
        return ((this.threatActors != null) && (this.opportunity != null) && (this.means != null) && (this.motivation != null));
    }

    getACT(){
        return this.threatActors;
    }

    getOPP(){
        return this.opportunity;
    }

    getMEA(){
        return this.means;
    }

    getMTV(){
        return this.motivation;
    }
}


