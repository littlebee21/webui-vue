import api from '@/store/api';

const SnmpSettingStore = {
  namespaced: true,
  state: {
    snmpStatus: [],
    snmpStatusCount: 0,
    SNMPSwitch: false,
  },
  getters: {
    snmpStatus: (state) => state.snmpStatus,
    snmpStatusCount: (state) => state.snmpStatusCount,
    SNMPSwitch: (state) => state.SNMPSwitch,
  },
  mutations: {
    setSNMPSwitch(state, SNMPSwitch) {
      state.SNMPSwitch = SNMPSwitch;
    },
    setsnmpStatus(state, snmpStatus) {
      state.snmpStatus = snmpStatus;
    },
    setSnmpStatusCount(state, snmpStatusCount) {
      state.snmpStatusCount = snmpStatusCount;
    },
  },
  actions: {
    postChangeSNMPSwitch(context, switchStatus) {
      return api
        .post(`/redfish/v1/Managers/network/snmp_switch`, {
          data: switchStatus,
        })
        .catch((error) => console.log(error))
        .finally();
    },
    // get snmp Switch status
    getSNMPSwitchStatus({ commit }) {
      return api
        .get(`/redfish/v1/Managers/network/snmp_switch`)
        .then(({ data: { data } }) => {
          if (data == 'enable') {
            commit('setSNMPSwitch', true);
          } else {
            commit('setSNMPSwitch', false);
          }
        })
        .catch((error) => console.log(error))
        .finally();
    },
    //get all snmp status
    async getSnmpStatus({ state, commit }) {
      var count = 0;
      return await api
        .get('/xyz/openbmc_project/network/snmp/manager/enumerate')
        .then(({ data: { data } }) => {
          const snmpSettingData = [];
          Object.keys(data).forEach((key) => {
            snmpSettingData.push({
              routerId: key.split('/').pop(),
              ip: data[key].Address,
              port: data[key].Port,
            });
            count++;
          });
          commit('setsnmpStatus', snmpSettingData);
          console.log(snmpSettingData);
          console.log(state.snmpStatus);
          commit('setSnmpStatusCount', count);
          console.log(state.snmpStatusCount);
        })
        .catch((error) => console.log(error));
    },
    // //get all snmp status
    // async syncGetSnmpStatus({ state, commit }) {
    //   var count = 0;
    //   return await api
    //     .get('/xyz/openbmc_project/network/snmp/manager/enumerate')
    //     .then(({ data: { data } }) => {
    //       const snmpSettingData = [];
    //       Object.keys(data).forEach((key) => {
    //         snmpSettingData.push({
    //           routerId: key.split('/').pop(),
    //           ip: data[key].Address,
    //           port: data[key].Port,
    //         });
    //         count++;
    //       });
    //       commit('setsnmpStatus', snmpSettingData);
    //       console.log(snmpSettingData);
    //       console.log(state.snmpStatus);
    //       commit('setSnmpStatusCount', count);
    //       console.log('count is ', state.snmpStatusCount);
    //     })
    //     .catch((error) => console.log(error));
    // },
    // post one snmp setting
    async postSnmpSetting(context, oneSnmpSetting) {
      return await api
        .post(
          '/redfish/v1/Managers/bmc/EthernetInterfaces/custom/snmp',
          oneSnmpSetting
        )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error));
    },

    // deletate snmp by key
    async deleteSnmpSetting(context, routerId) {
      return await api
        .delete(
          '/redfish/v1/Managers/bmc/EthernetInterfaces/custom/snmp/' +
            routerId +
            '/'
        )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error));
    },

    //modify snmpSetting
    async modifySnmpSetting(state, oneSnmpSetting) {
      const data = {};
      data.data = parseInt(oneSnmpSetting.port);
      //modift port
      await api
        .put(
          '/xyz/openbmc_project/network/snmp/manager/' +
            oneSnmpSetting.routerId +
            '/attr/Port',
          data
        )
        .then((response) => console.log(response))
        .catch((error) => console.log(error));

      //modify address
      data.data = oneSnmpSetting.ip;
      await api
        .put(
          '/xyz/openbmc_project/network/snmp/manager/' +
            oneSnmpSetting.routerId +
            '/attr/Address',
          data
        )
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
    },
  },
};

export default SnmpSettingStore;
