import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegistrationPage } from "./pages/auth/RegistrationPage.js";
import { EmailConfirmationPage } from "./pages/auth/EmailConfirmationPage.js";
import { HttpError404Page } from "./pages/HttpError404Page.js";
import { PasswordResetPage } from "./pages/auth/PasswordResetPage.js";

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
        path: '/register/email_confirm',
        name: 'EmailConfirm',
        component: EmailConfirmationPage
    },
    {
        path: '/password_reset',
        name: 'PasswordReset',
        component: PasswordResetPage
    },
    {
        path: '/404',
        name: 'NotFound',
        component: HttpError404Page
    },
    {
        path: '*',
        component: HttpError404Page
    }
];

export const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes
})
