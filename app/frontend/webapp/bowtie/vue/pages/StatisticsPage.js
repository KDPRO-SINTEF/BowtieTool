import { store } from "../store.js";
import { StatisticsItemComponent } from "../components/stats/StatisticsItemComponent.js";
import { BaseToastComponent } from "../components/BaseToastComponent.js";

export const StatisticsPage = {
    template: `
        <div id="statistics" class="container">
            <h1>Diagrams statistics</h1>
            <div class="row gx-5 mb-5">
                <div class="col">
                    <statistics-item :label="statistics.totalTimeSpent.label"
                                     :number="statistics.totalTimeSpent.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-clock.png'"></statistics-item>
                </div>
                <div class="col">
                    <statistics-item :label="statistics.threats.label"
                                     :number="statistics.threats.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-threats.png'"></statistics-item>
                </div>
            </div>
            <div class="row gx-5 mb-5">
                <div class="col">
                    <statistics-item :label="statistics.causes.label"
                                     :number="statistics.causes.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-causes.png'"></statistics-item>
                </div>
                <div class="col">
                    <statistics-item :label="statistics.consequences.label"
                                     :number="statistics.consequences.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-consequences.png'"></statistics-item>
                </div>
            </div>
            <div class="row gx-5 mb-5">
                <div class="col">
                    <statistics-item :label="statistics.assets.label"
                                     :number="statistics.assets.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-asset.png'"></statistics-item>
                </div>
                <div class="col">
                    <statistics-item :label="statistics.barriers.label"
                                     :number="statistics.barriers.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-barrier.png'"></statistics-item>
                </div>
            </div>
            <div class="row gx-5 mb-5">
                <div class="col">
                    <statistics-item :label="statistics.barriersPerConsequences.label"
                                     :number="statistics.barriersPerConsequences.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-barrier.png'"></statistics-item>
                </div>
                <div class="col">
                    <statistics-item :label="statistics.barriersPerThreats.label"
                                     :number="statistics.barriersPerThreats.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-barrier.png'"></statistics-item>
                </div>
            </div>
            <div class="row gx-5 mb-5">
                <div class="col">
                    <statistics-item :label="statistics.count.label"
                                     :number="statistics.count.number"
                                     v-on:value-copied="showToastMessage($event)"
                                     v-bind:image-src="'../images/statistics/statistics-count.png'"></statistics-item>
                </div>
                <div class="col"></div>
            </div>
            <div class="row gx-5 mb-5">
                <div class="col">
                    <div class="alert alert-secondary" role="alert">
                        Data marked with * are computed as an average per diagram.
                    </div>
                </div>
                <div class="col">
                    <div class="alert alert-danger" role="alert">
                        Both public and private diagrams are used for statistical purposes!
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" id="btn-download-csv" v-on:click="downloadCSVFile">Download data as CSV</button>
            <toast v-bind:show="toast.show" v-bind:message="toast.message"></toast>
        </div>
    `,
    components: {
        'statistics-item': StatisticsItemComponent,
        'toast': BaseToastComponent
    },
    data: function() {
        return {
            statistics: {
                totalTimeSpent : {
                    label: 'Total time spent (in minutes)',
                    number: 0
                },
                threats: {
                    label: 'Threats *',
                    number: 0
                },
                causes: {
                    label: 'Causes *',
                    number: 0
                },
                consequences: {
                    label: 'Consequences *',
                    number: 0
                },
                assets: {
                    label: 'Assets *',
                    number: 0
                },
                barriers: {
                    label: 'Barriers *',
                    number: 0
                },
                barriersPerConsequences: {
                    label: 'Barriers/consequences *',
                    number: 0
                },
                barriersPerThreats: {
                    label: 'Security controls/threats *',
                    number: 0
                },
                count: {
                    label: 'Number of diagrams',
                    number: 0
                }
            },
            toast: {
                message: '',
                show: false
            }
        }
    },
    methods: {
        fetchStatisticsData: function() {
            axios.get(window.API_STATISTICS, {
                headers: {
                    Authorization: 'Token ' + store.state.user.sessionToken
                }
            })
                .then (res => {
                    this.fillStatisticsData(res.data);
                })
                .catch(err => {
                    this.$router.push('/401');
                })
        },
        fillStatisticsData: function(data) {
            this.statistics.count.number = Number(data.count);
            if (data.threats__avg !== null) {
                this.statistics.threats.number = Number(data.threats__avg.toFixed(2));
            }
            if (data.consequences__avg !== null) {
                this.statistics.consequences.number = Number(data.consequences__avg.toFixed(2));
            }
            if (data.barriers__avg !== null) {
                this.statistics.barriers.number = Number(data.barriers__avg.toFixed(2));
            }
            if (data.causes__avg !== null) {
                this.statistics.causes.number = Number(data.causes__avg.toFixed(2));
            }
            if (data.totalTimeSpent__avg !== null) {
                this.statistics.totalTimeSpent.number = Number(data.totalTimeSpent__avg.toFixed(2));
            }
            if (data.barriers_per_consequences__avg !== null) {
                this.statistics.barriersPerConsequences.number = Number(data.barriers_per_consequences__avg.toFixed(2));
            }
            if (data.barriers_per_threats__avg !== null) {
                this.statistics.barriersPerThreats.number = Number(data.barriers_per_threats__avg.toFixed(2));
            }
            if (data.assets__avg !== null) {
                this.statistics.assets.number = Number(data.assets__avg.toFixed(2));
            }
        },
        createCSVFile: function() {
            let csvData = '';
            Object.values(this.statistics).forEach(stat => {
                csvData += stat.label + ',';
            })
            csvData = csvData.substring(0, csvData.length-1);
            csvData += '\n';
            Object.values(this.statistics).forEach(stat => {
                csvData += stat.number + ',';
            })
            csvData = csvData.substring(0, csvData.length-1);
            return csvData;
        },
        downloadCSVFile: function() {
            const data = this.createCSVFile();
            const blob = new Blob([data], { type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);
            const  a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', 'bowtie-statistics.csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        showToastMessage: function(message) {
            this.toast.message = message;
            this.toast.show = true;
            window.setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        }
    },
    created() {
        if (store.getters.isUserAuthenticated) {
            if (store.state.user.researcher) {
                this.fetchStatisticsData();
            } else {
                this.$router.push('/401');
            }
        } else {
            this.$router.push('/login');
        }
    }
}
