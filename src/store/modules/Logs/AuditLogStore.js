import api from '@/store/api';
import i18n from '@/i18n';

function MessageProcess(Message) {
  // replace thing in brackets
  var MessageResult = Message.replace(/\(.*\)/g, '');
  MessageResult = MessageResult.replace(/\[.*\]/g, '');
  MessageResult = MessageResult.replace(/AUDIT_MANUAL/g, '');
  MessageResult = MessageResult.replace(/SYSTEM_MANUAL/g, '');
  return MessageResult;
}

const AuditLogStore = {
  namespaced: true,
  state: {
    allEvents: [],
    loadedEvents: false,
  },
  getters: {
    allEvents: (state) => state.allEvents,
  },
  mutations: {
    setAllEvents: (state, allEvents) => (
      (state.allEvents = allEvents), (state.loadedEvents = true)
    ),
  },
  actions: {
    async getEventLogData({ commit }) {
      return await api
        .get(
          '/redfish/v1/Systems/system/LogServices/rsyslog/EventLog/Entries/audit/'
        )
        .then(({ data: { Members = [] } = {} }) => {
          var id = 0;
          const eventLogs = Members.map((log) => {
            const { Created, Message } = log;
            return {
              id: id++,
              date: new Date(Created),
              description: MessageProcess(Message),
              uri: log['@odata.id'],
              type: 'audit log',
              name: 'audit',
              modifiedDate: new Date(Created),
            };
          });
          commit('setAllEvents', eventLogs);
        })
        .catch((error) => {
          console.log('Event Log Data:', error);
        });
    },
    async deleteAllEventLogs({ dispatch }, data) {
      return await api
        .post(
          '/redfish/v1/Managers/bmc/LogServices/AuditLog/Actions/LogService.ClearLog',
          {},
          undefined
        )
        .then(() => dispatch('getEventLogData'))
        .then(() =>
          i18n.tc('pageOperatingLogs.toast.successDelete', data.length)
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.tc('pageOperatingLogs.toast.errorDelete', data.length)
          );
        });
    },
    async download() {
      return await api
        .get('/download/audit')
        .then(() => {
          return 'Success';
        })
        .catch(() => {
          throw new Error('Failed');
        });
    },
  },
};

export default AuditLogStore;
