import { HomePage } from "./pages/HomePage.js";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage
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
