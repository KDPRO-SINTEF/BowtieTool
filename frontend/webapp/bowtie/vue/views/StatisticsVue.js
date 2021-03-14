let statistics_vue = new Vue({
    //Stocker les données ici
    el : "#statistics-vue",
    components: {
        'statistics-item' : StatsItemComponent
    },
    data: {
        bowtie : {
            label : 'Bowtie diagrams',
            number : Number
        },
        threats : {
            label : 'Threats',
            number: Number
        },
        causes : {
            label : 'Causes',
            number : Number
        },
        consequences : {
            label : 'Consequences',
            number : Number
        }
    },
    beforeMount() {
        axios.get(window.STATISTICS, {
            headers: {
                'Content-type': 'application/json', //Si param contient un json
                //'Authorization': 'Token ' + token //Si authorization nécessaire avec le token d'auth
            }
        }).then(res => {
            console.log(res.data);
            this.bowtie.number = res.bowtie;
            this.threats.number = res.threats;
            this.causes.number = res.causes;
            this.consequences.number = res.consequences;
        }).catch(error => {
            if(error.response) console.log(error);
        })

    }
})

/*
param JSON.stringify(JSONObject json)
Erreur 500 : erreur du back
axios.get(URL, param, {
    headers: {
    'Content-type': 'application/json' //Si param contient un json
    'Authorization': 'Token ' + token //Si authorization nécessaire avec le token d'auth
    }
}
  .then(res => {
    console.log(res.data):
  }
  .catch(error => {
    if (error.response) fonctionPourTraiterLesDifférentesErreurs(error.response);
  }
 */