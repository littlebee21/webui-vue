import api from '@/store/api';

const FanControlStore = {
  namespaced: true,
  state: {
    currentFanSpeed: '****',
    fanSpeedWanted: null,
    currentFanPattern: 'auto',
    message: '****',
  },
  getters: {
    currentFanSpeed: (state) => state.currentFanSpeed,
    currentFanPattern: (state) => state.currentFanPattern,
    fanSpeedWanted: (state) => state.fanSpeedWanted,
    message: (state) => state.message,
  },
  mutations: {
    setCurrentFanSpeed: (state, currentFanSpeed) => {
      state.currentFanSpeed = currentFanSpeed;
    },
    setFanSpeedWanted: (state, fanSpeedWanted) => {
      state.fanSpeedWanted = fanSpeedWanted;
      console.log('current fanSpeedWanted is', fanSpeedWanted);
    },
    setMessage: (state, message) => {
      state.message = message;
    },
    setCurrentFanPattern: (state, currentFanPattern) =>
      (state.currentFanPattern = currentFanPattern),
  },
  actions: {
    // old interface
    async oldGetCurrentPatten({ fauto, fmanual, fvalue }) {
      const data = {};
      data['fanauto'] = fauto;
      data['fanmanual'] = fmanual;
      data['fanvalue'] = fvalue;
      console.log(data);
      return await api
        .post('/redfish/v1/Managers/fan', data)
        .then((response) => {
          console.log(response.data);
          return response.data;
        })
        .then.catch((error) => console.log(error));
    },
    //get fan speed
    getFanSpeed({ commit }) {
      console.log('watch get fan speed time');
      return api
        .get('/redfish/v1/Managers/fan')
        .then((response) => {
          commit('setCurrentFanSpeed', response.data);
        })
        .catch((error) => console.log(error))
        .finally();
    },
    //auto control
    //auto control fan speed change is slow, cant read right now
    postAutoControlFanSpeed({ commit, dispatch }) {
      return api
        .post('/redfish/v1/Managers/fan', {
          fanvalue: '',
          fanModel: 'auto',
        })
        .then((response) => {
          if (response.data.status == 'ok') {
            commit('setCurrentFanPattern', 'auto');
            commit('setMessage', response.data.message);
          }
        })
        .then(setTimeout(() => dispatch('getFanSpeed'), 2000)) //5s read auto control
        .catch((error) => console.log(error))
        .finally();
    },
    //new interfaceq
    // manual control get fan speed is quick
    postManualControlFanSpeed({ state, commit, dispatch }) {
      return api
        .post('/redfish/v1/Managers/fan', {
          fanvalue: state.fanSpeedWanted,
          fanModel: 'manual',
        })
        .then((response) => {
          if (response.data.status == 'ok') {
            commit('setCurrentFanPattern', 'manual');
            commit('setMessage', response.data.message);
          }
        })
        .then(dispatch('getFanSpeed'))
        .catch((error) => console.log(error))
        .finally();
    },
  },
};

export default FanControlStore;
