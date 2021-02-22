Vue.component('TheNavbarComponent', {
    template: `
    <div class="navbar">
        <img id="logo" src="../images/logo.png" onclick="window.location.assign(window.ROOT_PAGE)">
        <nav>
            <ul class="nav-links">
                <li><a :href="home_url">Home</a></li>
                <li><a :href="login_url">Log in</a></li>
                <li><a :href="register_url">Register</a></li>
            </ul>
        </nav>
    </div>`,
    data: function() {
        return {
            home_url: window.ROOT_PAGE,
            login_url: window.LOGIN_PAGE,
            register_url: window.REGISTER_PAGE
        }
    },
})