export const BaseToastComponent = {
    props: {
        show: Boolean,
        message: String,
        eventType: {
            type: String,
            default: 'success'
        }
    },
    template: `
        <transition name="fade">
            <div id="toast" v-if="show" class="position-fixed bottom-0 end-0 p-3">
                <div class="toast show" rol="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong v-if="eventType === 'success'" class="me-auto text-success">Successful operation !</strong>
                        <strong v-else class="me-auto text-danger">Bowtie++ error</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"
                                v-on:click="show = false"></button>
                    </div>
                    <div class="toast-body">
                            {{ message }}
                    </div>
                </div>
            </div>
        </transition>
    `,
}
