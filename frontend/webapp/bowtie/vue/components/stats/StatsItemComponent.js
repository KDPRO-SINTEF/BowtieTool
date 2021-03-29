/**
 * StatsItemComponent
 * Handles the window to show the statistics analysis
 * Related template: common/statistics.html
 */

let StatsItemComponent = {
    template: '#statistics-item-template',
    props: {
        label : String,
        number : Number,
        imageSrc: String
    },
    methods: {
        copyValueToClipboard: function() {
            navigator.clipboard.writeText(this.number)
                .then(() => this.$emit('value-copied', 'Value has been copied to clipboard.'))
                .catch(err => {
                    alert('Error in copying text: ' + err);
                })
        }
    }
}