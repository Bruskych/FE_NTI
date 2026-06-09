import { createI18n } from 'vue-i18n'
import { getCookie } from '@/utils/cookies'

import skHeader from './sk/header.json'
import enHeader from './en/header.json'

import skFooter from './sk/footer.json'
import enFooter from './en/footer.json'

import skLogin from './sk/login.json'
import enLogin from './en/login.json'

import skRegister from './sk/registration.json'
import enRegister from './en/registration.json'

import skRole from './sk/roles.json'
import enRole from './en/roles.json'

import skUserPanel from './sk/user_panel.json'
import enUserPanel from './en/user_panel.json'

import skAdminPanel from './sk/admin_panel.json'
import enAdminPanel from './en/admin_panel.json'

import skSettingsPanel from './sk/settings_panel.json'
import enSettingsPanel from './en/settings_panel.json'

import skError from './sk/error.json'
import enError from './en/error.json'

import skActions from './sk/actions.json'
import enActions from './en/actions.json'

import skAdminTable from './sk/admin_table.json'
import enAdminTable from './en/admin_table.json'

import skHome from './sk/home.json'
import enHome from './en/home.json'

import skNotification from './sk/notification.json'
import enNotification from './en/notification.json'

import skDashboard from './sk/dashboard.json'
import enDashboard from './en/dashboard.json'

import skCalls from './sk/calls.json'
import enCalls from './en/calls.json'

import skTeam from './sk/team.json'
import enTeam from './en/team.json'

import skApplications from './sk/applications.json'
import enApplications from './en/applications.json'

import skProjects from './sk/projects.json'
import enProjects from './en/projects.json'

import skCookie from './sk/cookie.json'
import enCookie from './en/cookie.json'

import skChallenges from './sk/challenges.json'
import enChallenges from './en/challenges.json'

import skOrganizations from './sk/organizations.json'
import enOrganizations from './en/organizations.json'

import skMentorships from './sk/mentorships.json'
import enMentorships from './en/mentorships.json'

import skDocuments from './sk/documents.json'
import enDocuments from './en/documents.json'

const messages = {
    sk: {
        header: skHeader,
        footer: skFooter,
        login: skLogin,
        register: skRegister,
        role: skRole,
        userPanel: skUserPanel,
        adminPanel: skAdminPanel,
        settingsPanel: skSettingsPanel,
        error: skError,
        actions: skActions,
        adminTable: skAdminTable,
        home: skHome,
        notification: skNotification,
        dashboard: skDashboard,
        calls: skCalls,
        team: skTeam,
        applications: skApplications,
        projects: skProjects,
        cookie: skCookie,
        challenges: skChallenges,
        organizations: skOrganizations,
        mentorships: skMentorships,
        documents: skDocuments,
    },
    en: {
        header: enHeader,
        footer: enFooter,
        login: enLogin,
        register: enRegister,
        role: enRole,
        userPanel: enUserPanel,
        adminPanel: enAdminPanel,
        settingsPanel: enSettingsPanel,
        error: enError,
        actions: enActions,
        adminTable: enAdminTable,
        home: enHome,
        notification: enNotification,
        dashboard: enDashboard,
        calls: enCalls,
        team: enTeam,
        applications: enApplications,
        projects: enProjects,
        cookie: enCookie,
        challenges: enChallenges,
        organizations: enOrganizations,
        mentorships: enMentorships,
        documents: enDocuments,
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: getCookie('lang') || 'sk',
    fallbackLocale: 'en', // Если перевода нет на SK, покажет EN
    messages
})