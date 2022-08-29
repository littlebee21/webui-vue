import api from '@/store/api';
import { uniqBy } from 'lodash';

function color(item) {
  console.log(item);
  if (item.Value >= item.CriticalHigh) return 'danger';
  else if (item.Value >= item.WarningHigh) return 'warning';
  else if (item.Value >= item.WarningLow) return 'success';
  else if (item.Value >= item.CriticalLow) return 'warning';
  else if (item.Value < item.CriticalLow) return 'danger';
  else return 'light';
}

const SensorsStore = {
  namespaced: true,
  state: {
    sensors: [],
  },
  getters: {
    sensors: (state) => state.sensors,
  },
  mutations: {
    setSensors: (state, sensors) => {
      state.sensors = uniqBy([...state.sensors, ...sensors], 'name');
    },
  },
  actions: {
    async oldGetEnumSensors({ commit }) {
      return await api
        .get('/xyz/openbmc_project/sensors/enumerate')
        .then(({ data: { data } }) => {
          const sensorData = [];
          Object.keys(data).forEach((key) => {
            if (key.includes('utilization') == true) {
              return false;
            }
            sensorData.push({
              name: key.split('/').pop(),
              status: data[key].Functional,
              currentValue: data[key].Value,
              upperCaution: data[key].WarningHigh,
              lowerCaution: data[key].WarningLow,
              upperCritical: data[key].CriticalHigh,
              lowerCritical: data[key].CriticalLow,
              _rowVariant: color(data[key]),
            });
            console.log(data[key].Value);
          });
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
    //old interface get fan
    async oldGetFanSensor({ commit }) {
      return await api
        .get('xyz/openbmc_project/sensors/fan_tach/fan1')
        .then(({ data: { data } }) => {
          const sensorData = [];
          Object.keys(data).forEach((key) => {
            sensorData.push({
              name: key,
              status: data[key].Functional,
              currentValue: data[key].Value,
              upperCaution: data[key].WarningHigh,
              lowerCaution: data[key].WarningLow,
              upperCritical: data[key].CriticalHigh,
              lowerCritical: data[key].CriticalLow,
            });
            console.log(data[key].Value);
          });
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
    //old interface get VDD
    async oldGetVDDSensor({ commit }) {
      return await api
        .get('xyz/openbmc_project/sensors/voltage/VDD12V')
        .then(({ data: { data } }) => {
          const sensorData = [];
          Object.keys(data).forEach((key) => {
            sensorData.push({
              name: key,
              status: data[key].Functional,
              currentValue: data[key].Value,
              upperCaution: data[key].WarningHigh,
              lowerCaution: data[key].WarningLow,
              upperCritical: data[key].CriticalHigh,
              lowerCritical: data[key].CriticalLow,
            });
            console.log(data[key].Value);
          });
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
    async getAllSensors({ dispatch }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection) return;
      const promises = collection.reduce((acc, id) => {
        acc.push(dispatch('getSensors', id));
        acc.push(dispatch('getThermalSensors', id));
        acc.push(dispatch('getPowerSensors', id));
        return acc;
      }, []);
      return await api.all(promises);
    },
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getSensors({ commit }, id) {
      const sensors = await api
        .get(`${id}/Sensors`)
        .then((response) => response.data.Members)
        .catch((error) => console.log(error));
      if (!sensors) return;
      const promises = sensors.map((sensor) => {
        return api.get(sensor['@odata.id']).catch((error) => {
          console.log(error);
          return error;
        });
      });
      return await api.all(promises).then(
        api.spread((...responses) => {
          const sensorData = responses.map(({ data }) => {
            return {
              name: data.Name,
              status: data.Status.Health,
              currentValue: data.Reading,
              lowerCaution: data.Thresholds?.LowerCaution?.Reading,
              upperCaution: data.Thresholds?.UpperCaution?.Reading,
              lowerCritical: data.Thresholds?.LowerCritical?.Reading,
              upperCritical: data.Thresholds?.UpperCritical?.Reading,
              units: data.ReadingUnits,
            };
          });
          commit('setSensors', sensorData);
        })
      );
    },
    async getThermalSensors({ commit }, id) {
      return await api
        .get(`${id}/Thermal`)
        .then(({ data: { Fans = [], Temperatures = [] } }) => {
          const sensorData = [];
          Fans.forEach((sensor) => {
            sensorData.push({
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.Reading,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: sensor.ReadingUnits,
            });
          });
          Temperatures.forEach((sensor) => {
            sensorData.push({
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.ReadingCelsius,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: '℃',
            });
          });
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
    async getPowerSensors({ commit }, id) {
      return await api
        .get(`${id}/Power`)
        .then(({ data: { Voltages = [] } }) => {
          const sensorData = Voltages.map((sensor) => {
            return {
              name: sensor.Name,
              status: sensor.Status.Health,
              currentValue: sensor.ReadingVolts,
              lowerCaution: sensor.LowerThresholdNonCritical,
              upperCaution: sensor.UpperThresholdNonCritical,
              lowerCritical: sensor.LowerThresholdCritical,
              upperCritical: sensor.UpperThresholdCritical,
              units: 'Volts',
            };
          });
          commit('setSensors', sensorData);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default SensorsStore;
