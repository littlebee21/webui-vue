import api from '@/store/api';

const VncSettingStore = {
  namespaced: true,
  state: {
    VncSwitch: false,
  },
  getters: {
    VncSwitch: (state) => state.VncSwitch,
  },
  mutations: {
    setVncSwitch(state, VncSwitch) {
      state.VncSwitch = VncSwitch;
    },
  },
  actions: {
    postChangeVncSwitch(context, switchStatus) {
      return api
        .post(`/redfish/v1/Managers/network/vnc_switch`, {
          data: switchStatus,
        })
        .catch((error) => console.log(error))
        .finally();
    },
    // get Vnc Switch status
    getVncSwitchStatus({ commit }) {
      return api
        .get(`/redfish/v1/Managers/network/vnc_switch`)
        .then(({ data: { data } }) => {
          if (data == 'enable') {
            commit('setVncSwitch', true);
          } else {
            commit('setVncSwitch', false);
          }
        })
        .catch((error) => console.log(error))
        .finally();
    },
  },
};

export default VncSettingStore;
