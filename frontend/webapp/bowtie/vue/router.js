import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/auth/LoginPage.js";

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
        path: '*',
        component: HomePage
    }
];

export const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes
})
