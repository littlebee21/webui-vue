import Vue from 'vue';
import Vuex from 'vuex';

import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticanStore';
import LdapStore from './modules/AccessControl/LdapStore';
import LocalUserManagementStore from './modules/AccessControl/LocalUserMangementStore';
import SslCertificatesStore from './modules/AccessControl/SslCertificatesStore';
import FirmwareStore from './modules/Configuration/FirmwareStore';
import BootSettingsStore from './modules/Control/BootSettingsStore';
import ControlStore from './modules/Control/ControlStore';
import PowerControlStore from './modules/Control/PowerControlStore';
import NetworkSettingStore from './modules/Configuration/NetworkSettingsStore';
import EventLogStore from './modules/Health/EventLogStore';
import SensorsStore from './modules/Health/SensorsStore';
import ServerLedStore from './modules/Control/ServerLedStore';
import SystemStore from './modules/Health/SystemStore';
import PowerSupplyStore from './modules/Health/PowerSupplyStore';
import MemoryStore from './modules/Health/MemoryStore';
import FanStore from './modules/Health/FanStore';
import ChassisStore from './modules/Health/ChassisStore';
import BmcStore from './modules/Health/BmcStore';
import ProcessorStore from './modules/Health/ProcessorStore';
import FactoryResetStore from './modules/Control/FactoryResetStore';

import WebSocketPlugin from './plugins/WebSocketPlugin';
import DateTimeStore from './modules/Configuration/DateTimeSettingsStore';
import VirtualMediaStore from './modules/Control/VirtualMediaStore';
import FanControlStore from './modules/Control/FanControlStore';
import IPManagementStore from './modules/AccessControl/IPManagementStore';
import SnmpSettingStore from './modules/Configuration/SnmpSettingStore';
import activationStore from './modules/AccessControl/activationStore';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    global: GlobalStore,
    authentication: AuthenticationStore,
    dateTime: DateTimeStore,
    ldap: LdapStore,
    localUsers: LocalUserManagementStore,
    ipManagement: IPManagementStore,
    firmware: FirmwareStore,
    hostBootSettings: BootSettingsStore,
    controls: ControlStore,
    powerControl: PowerControlStore,
    powerSupply: PowerSupplyStore,
    networkSettings: NetworkSettingStore,
    eventLog: EventLogStore,
    sensors: SensorsStore,
    sslCertificates: SslCertificatesStore,
    serverLed: ServerLedStore,
    system: SystemStore,
    memory: MemoryStore,
    fan: FanStore,
    chassis: ChassisStore,
    bmc: BmcStore,
    processors: ProcessorStore,
    factoryReset: FactoryResetStore,
    virtualMedia: VirtualMediaStore,
    fanControl: FanControlStore,
    snmpSetting: SnmpSettingStore,
    activation: activationStore,
  },
  plugins: [WebSocketPlugin],
});
