Vue.component('UserProfileComponent', {
    template:'',
    data: function() {
        return {
            userName: '',
            userEmail: '',
            is2FAActivate: ''
        }
    },
    beforeCreate: function() {
        var user = {
            'token': localStorage.getItem('token'),
            'username': localStorage.getItem('username')
        };

    }
})