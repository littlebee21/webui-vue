import api from '@/store/api';

// const HOST_STATE = {
//   on: 'xyz.openbmc_project.State.Host.HostState.Running',
//   off: 'xyz.openbmc_project.State.Host.HostState.Off',
//   error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
//   diagnosticMode: 'xyz.openbmc_project.State.Host.HostState.DiagnosticMode',
// };

const CLASSIS_STATE = {
  on: 'xyz.openbmc_project.State.Chassis.PowerState.On',
  off: 'xyz.openbmc_project.State.Chassis.PowerState.Off',
  warmReboot: 'xyz.openbmc_project.State.Host.Transition.ForceWarmReboot',
};

// const serverStateMapper = (hostState) => {
//   switch (hostState) {
//     case HOST_STATE.on:
//     case 'On': // Redfish PowerState
//       return 'on';
//     case HOST_STATE.off:
//     case 'Off': // Redfish PowerState
//       return 'off';
//     case HOST_STATE.error:
//     case 'Quiesced': // Redfish Status
//       return 'error';
//     case HOST_STATE.diagnosticMode:
//     case 'InTest': // Redfish Status
//       return 'diagnosticMode';
//     default:
//       return 'unreachable';
//   }
// };

const classisStateMapper = (classisState) => {
  switch (classisState) {
    case CLASSIS_STATE.on:
    case 'On': // Redfish PowerState
      return 'on';
    case CLASSIS_STATE.off:
    case 'Off': // Redfish PowerState
      return 'off';
    case CLASSIS_STATE.warmReboot:
      return 'on';
    default:
      return 'unreachable';
  }
};

const GlobalStore = {
  namespaced: true,
  state: {
    assetTag: null,
    bmcTime: null,
    modelType: null,
    serialNumber: null,
    serverStatus: 'unreachable',
    languagePreference: localStorage.getItem('storedLanguage') || 'en-US',
    isUtcDisplay: localStorage.getItem('storedUtcDisplay')
      ? JSON.parse(localStorage.getItem('storedUtcDisplay'))
      : true,
    username: localStorage.getItem('storedUsername'),
    isAuthorized: true,
  },
  getters: {
    assetTag: (state) => state.assetTag,
    modelType: (state) => state.modelType,
    serialNumber: (state) => state.serialNumber,
    serverStatus: (state) => state.serverStatus,
    bmcTime: (state) => state.bmcTime,
    languagePreference: (state) => state.languagePreference,
    isUtcDisplay: (state) => state.isUtcDisplay,
    username: (state) => state.username,
    isAuthorized: (state) => state.isAuthorized,
  },
  mutations: {
    setAssetTag: (state, assetTag) => (state.assetTag = assetTag),
    setModelType: (state, modelType) => (state.modelType = modelType),
    setSerialNumber: (state, serialNumber) =>
      (state.serialNumber = serialNumber),
    setBmcTime: (state, bmcTime) => (state.bmcTime = bmcTime),
    setServerStatus: (state, serverState) =>
      (state.serverStatus = classisStateMapper(serverState)),
    setServerStatusDirect: (state, serverState) =>
      (state.serverStatus = serverState),
    setLanguagePreference: (state, language) =>
      (state.languagePreference = language),
    setUsername: (state, username) => (state.username = username),
    setUtcTime: (state, isUtcDisplay) => (state.isUtcDisplay = isUtcDisplay),
    setUnauthorized: (state) => {
      state.isAuthorized = false;
      window.setTimeout(() => {
        state.isAuthorized = true;
      }, 100);
    },
  },
  actions: {
    async getBmcTime({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          const bmcDateTime = response.data.DateTime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
        })
        .catch((error) => console.log(error));
    },
    getSystemInfo({ commit, dispatch }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(
          ({
            data: {
              AssetTag,
              Model,
              // PowerState,
              SerialNumber,
              Status: { State } = {},
            },
          } = {}) => {
            commit('setAssetTag', AssetTag);
            commit('setSerialNumber', SerialNumber);
            commit('setModelType', Model);
            if (State === 'Quiesced' || State === 'InTest') {
              // OpenBMC's host state interface is mapped to 2 Redfish
              // properties "Status""State" and "PowerState". Look first
              // at State for certain cases.
              // commit('setServerStatus', State);
            } else {
              // commit('setServerStatus', PowerState);
            }
          }
        )
        .then(dispatch('getPowerState'))
        .catch((error) => console.log(error));
    },
    async getPowerState({ commit, getters }) {
      var powerStateHost;
      var powerStateChassis;
      var powerState;
      await api
        .get('/xyz/openbmc_project/state/host0')
        .then(({ data: { data } }) => {
          powerStateHost = data.RequestedHostTransition;
          console.log('powerState is ', data.RequestedPowerTransition);
        })
        .catch((error) => console.log(error));
      await api
        .get('/xyz/openbmc_project/state/chassis0')
        .then(({ data: { data } }) => {
          powerStateChassis = data.CurrentPowerState;
          console.log('powerState is ', data.CurrentPowerState);
        })
        .catch((error) => console.log(error));
      if (
        classisStateMapper(powerStateHost) === 'on' ||
        classisStateMapper(powerStateChassis) === 'on'
      ) {
        powerState = 'on';
      } else {
        powerState = 'off';
      }
      commit('setServerStatusDirect', powerState);
      return console.log('serve state is ', getters.serverStatus);
    },
  },
};

export default GlobalStore;
