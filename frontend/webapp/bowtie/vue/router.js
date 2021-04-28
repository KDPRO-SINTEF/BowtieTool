import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegistrationPage } from "./pages/auth/RegistrationPage.js";

const routes = [
    {
        path: '/',
        name: 'Home',
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/register',
        name: 'Register',
        component: RegistrationPage
    },
    {
        path: '*',
        component: HomePage
    }
];

export const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes
})
