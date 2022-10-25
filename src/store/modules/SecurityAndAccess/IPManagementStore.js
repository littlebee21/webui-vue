import api from '@/store/api';
import i18n from '@/i18n';

const IPManagementStore = {
  namespaced: true,
  state: {
    allIPs: [],
  },
  getters: {
    allIPs(state) {
      return state.allIPs;
    },
  },
  mutations: {
    setIPs(state, allIPs) {
      state.allIPs = allIPs;
    },
  },
  actions: {
    async getIPs({ commit }) {
      return await api
        .get('/redfish/v1/blacklist')
        .then(({ data: { blacklistIP } }) => {
          const blacklistdata = [];
          var index = 1;
          Object.keys(blacklistIP).forEach((key) => {
            if (blacklistIP[key] != '') {
              blacklistdata.push({
                ipname: blacklistIP[key],
                number: index,
              });
              index++;
              console.log(blacklistIP[key].Value);
            }
          });
          commit('setIPs', blacklistdata);
        })
        .catch((error) => console.log(error));
    },
    async updateIP({ dispatch }, { name }) {
      const data = {};
      if (name) data.IPName = name;
      data.method = 'insert';
      return await api
        .post(`/redfish/v1/blacklist`, data)
        .then(() => dispatch('getIPs'))
        .then(() =>
          i18n.t('pageIPManagement.toast.successUpdateIP', {
            ipname: name,
          })
        )
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageIPManagement.toast.errorUpdateIP', {
            ipname: name,
          });
          throw new Error(message);
        });
    },
    async deleteIP({ dispatch }, ipname) {
      const data = {};
      if (ipname) data.IPName = ipname;
      data.method = 'delete';
      return await api
        .post(`/redfish/v1/blacklist`, data)
        .then(() => dispatch('getIPs'))
        .then(() =>
          i18n.t('pageIPManagement.toast.successDeleteIP', {
            ipname,
          })
        )
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageIPManagement.toast.errorDeleteIP', {
            ipname,
          });
          throw new Error(message);
        });
    },
  },
};

export default IPManagementStore;
