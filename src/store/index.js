import Vue from "vue"
import Vuex from "vuex"

import VuexElectronPlugin from "@/plugins/electron-vuex"

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {},
    plugins: [VuexElectronPlugin],
})
