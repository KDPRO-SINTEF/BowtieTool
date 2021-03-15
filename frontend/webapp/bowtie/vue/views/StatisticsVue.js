let statistics_vue = new Vue({
    //Stocker les données ici
    el : "#statistics-vue",
    components: {
        'statistics-item' : StatsItemComponent
    },
    data: {
        totalTimeSpent : {
            label : 'Total time spent (in minutes)',
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
        },
        barriers : {
            label : 'Barriers',
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

            //Total time spent
            if (res.totalTimeSpent__avg == null)
                this.totalTimeSpent.number = 0;
            else
                this.totalTimeSpent.number = res.totalTimeSpent__avg;

            //Threats
            if (res.threats__avg == null)
                this.threats.number = 0;
            else
                this.threats.number = res.threats__avg;

            //Barriers
            if (res.barriers__avg == null)
                this.barriers.number = 0;
            else
                this.barriers.number = res.barriers__avg;

            //Consequences
            if (res.consequences__avg == null)
                this.consequences.number = 0;
            else
                this.consequences.number = res.consequences__avg;

            //Causes
            if (res.causes__avg == null)
                this.causes.number = 0;
            else
                this.causes.number = res.causes__avg;

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