export const BaseToastComponent = {
    props: {
        show: Boolean,
        message: String
    },
    template: `
        <div id="toast" v-if="show" class="position-fixed bottom-0 end-0 p-3">
            <div class="toast show" rol="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto text-success">Bowtie++ app -- successful operation !</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"
                                v-on:click="show = false"></button>
                </div>
                <div class="toast-body">
                        {{ message }}
                </div>
            </div>
        </div>
    `,
}
