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
    async getActivateState({ commit }) {
      console.log(123);
      return await api
        .get('/redfish/v1/Managers/License/')
        .then((response) => {
          commit('setActivateState', response.data.status);
          commit('setActivateCode', response.data.machine_id);
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
