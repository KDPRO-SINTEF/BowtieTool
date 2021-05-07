import {validField} from "../../../js/modules/validators.js";

export const AddUserToShareWithComponent = {

    template: '#add-user-to-share-with-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        token: String,
        graphid: Number,
        userToAdd: Array,
    },
    data: function () {
        return {
            email_input: "",
            risk_input: true,
            role: 'writer',

        }
    },
    methods: {
        onEmailInput(event) {
            this.email_input = event.target.value
        }, onKey(e) {
            if (e.key === "Enter") {
                this.email_input = e.target.value
                this.shareWith(this.email_input)
            }
        },
        click() {
            this.shareWith(this.email_input)
        },
        inputRisk() {
            this.risk_input = !this.risk_input
        },
        roleChange(value) {
            if (value === 0) {
                this.role = 'reader'
            } else {
                this.role = 'writer'
            }
        },
        onNewShareEvent(datas) {
            const email = datas[0]
            const role = datas[1]
            this.shareWith(email, role)
        },
        shareWith(userEmail, role = this.role, risk = this.risk_input) {
            if (userEmail !== undefined) {
                const params = {email: userEmail, role: role, isRiskShared: risk}
                axios.post(window.API_SHARE_DIAGRAM + this.graphid, params, {
                    headers: {
                        Authorization: 'Token ' + this.token
                    }
                })
                    .then(response => {
                        if (role === 'reader') {
                            this.$emit("added-reader", userEmail)
                        } else {
                            this.$emit("added-writer", userEmail)
                        }
                        // console.log(response);
                    })
                    .catch(error => {
                        alert("An unexpected error happened when you tried to share this diagram. Maybe the user you shared it with doesn't exist?")
                        console.log(error);
                    })
            }
        }
    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        // beforeMount is launched at the creation of the component
        isValidEmail: function () {
            return !validField("email", this.email_input)
        }
    },
    watch: {
        userToAdd: function () {
            // console.log("Child is adding user")
            const email = this.userToAdd[0]
            const role = this.userToAdd[1]
            this.shareWith(email, role)
        }
    },
    mounted() {

    }

}