/**
 * StatsItemComponent
 * Handles the window to show the statistics analysis
 */

let StatsItemComponent = {
    template :
        `<p class="text-center">Number of {{label}} : {{number}}</p>`,
    props: {
        label : String,
        number : Number
    },
    data : function() { return{} },

}