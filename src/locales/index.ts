import { createI18n } from 'vue-i18n'

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
        home: skHome
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
        home: enHome
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || 'sk', // Берем язык из памяти или ставим SK
    fallbackLocale: 'en', // Если перевода нет на SK, покажет EN
    messages
})