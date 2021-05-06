import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegistrationPage } from "./pages/auth/RegistrationPage.js";
import { EmailConfirmationPage } from "./pages/auth/EmailConfirmationPage.js";
import { HttpError404Page } from "./pages/http-errors/HttpError404Page.js";
import { PasswordResetPage } from "./pages/auth/PasswordResetPage.js";
import { StatisticsPage } from "./pages/StatisticsPage.js";
import { HttpError401Page } from "./pages/http-errors/HttpError401Page.js";
import { AccountSettingsPage } from "./pages/AccountSettingsPage.js";
import { UserProfileComponent } from "./components/account/UserProfileComponent.js";
import { AccountSecurityComponent } from "./components/account/AccountSecurityComponent.js";
import { AccountDangerZoneComponent } from "./components/account/AccountDangerZoneComponent.js";

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
        path: '/register/email-confirm',
        name: 'EmailConfirm',
        component: EmailConfirmationPage
    },
    {
        path: '/password-reset',
        name: 'PasswordReset',
        component: PasswordResetPage
    },
    {
        path: '/statistics',
        name: 'Statistics',
        component: StatisticsPage
    },
    {
        path: '/settings',
        component: AccountSettingsPage,
        children: [
            {
                path: '',
                redirect: 'profile'
            },
            {
                path: 'profile',
                component: UserProfileComponent
            },
            {
                path: 'security',
                component: AccountSecurityComponent
            },
            {
                path: 'danger-zone',
                component: AccountDangerZoneComponent
            }

        ]
    },
    {
        path: '/404',
        name: 'NotFound',
        component: HttpError404Page
    },
    {
        path: '/401',
        name: 'Unauthorized',
        component: HttpError401Page
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
