import {validField} from "../../../js/modules/validators.js";

export const AddUserToShareWithComponent = {

    template: '#add-user-to-share-with-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")

    },
    data: function () {
        return {
            email_input:"",
            risk_input:false,
            role:'writer',
            token:"",
            graphid:"",
        }
    },
    methods: {
        onEmailInput(event) {
            this.email_input=event.target.value
        }, onKey(e) {
            if(e.key === "Enter"){

            }
        },
        inputRisk(){
            this.risk_input = !this.risk_input
        },
        roleChange(value){
          if(value===0){
              this.role = 'reader'
          }
          else{
              this.role = 'writer'
          }
        },
        shareWith(userEmail){
            if (userEmail !== null) {
                const params = {"email": userEmail, "role": this.role}
                axios.post(window.API_SHARE_DIAGRAM + this.graphid, params, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                })
                    .then(response => {
                        console.log(response);
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        }
    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        // beforeMount is launched at the creation of the component
        isValidEmail: function (){
            return !validField("email",this.email_input)
        }
    },
    mounted(){
        this.token = localStorage.getItem('sessionToken');
        this.graphid = window.parent.currentUI.editor.getGraphId();
    }

}