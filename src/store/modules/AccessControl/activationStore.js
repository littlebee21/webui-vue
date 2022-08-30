import api from '@/store/api';

const activationStore = {
  namespaced: true,
  state: {
    activateState: 'unpass',
    activateCode: '****',
  },
  getters: {
    activateState: (state) => state.activateState,
    activateCode: (state) => state.activateCode,
  },
  mutations: {
    setActivateState: (state, activateState) => {
      state.activateState = activateState;
    },
    setActivateCode: (state, activateCode) => {
      state.activateCode = activateCode;
    },
  },
  actions: {
    //get activate code
    getActivateState({ commit }) {
      console.log(123);
      return api
        .get('/redfish/v1/Managers/License/')
        .then((response) => {
          commit('setActivateState', response.data.checklicres);
          commit('setActivateCode', response.data.geetvalueres);
        })
        .catch((error) => console.log(error))
        .finally();
    },
    //post activate code
    postActivateCode(context, code) {
      const data = {};
      data.checksum = code;
      return api
        .post('/redfish/v1/Managers/LicenseCheck/', data)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error))
        .finally();
    },
  },
};

export default activationStore;
