/**
 * StatisticsItemComponent
 * Handles the window to show the statistics analysis
 */

export const StatisticsItemComponent = {
    template: `
        <div id="statistics-item">
            <div class="card shadow p-2 bg-white rounded">
                <div class="row">
                    <div class="col-8">
                        <div class="card-body">
                            <div class="card-title text-uppercase text-muted">{{ label }}</div>
                            <div class="card-content">
                                <div class="input-group">
                                    <input v-model="number" type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" disabled>
                                    <span class="input-group-text dark" id="basic-addon2"><button type="button" class="btn"
                                                                                              data-bs-container="body" data-bs-toggle="popover" data-bs-placement="right" data-bs-content="Right popover"
                                                                                              v-on:click="copyValueToClipboard"><img src="../images/copy.png" class="copy-logo"></button></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-4">
                        <img v-bind:src="imageSrc" class="stats-item-logo">
                    </div>
                </div>
            </div>
        </div>
    `,
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
