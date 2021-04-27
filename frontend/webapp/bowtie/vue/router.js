const routes = [
    {
        path: '/',
        name: 'Home'
    }
];

export const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes
})
