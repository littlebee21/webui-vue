import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const getHealthStatus = (events, loadedEvents) => {
  let status = loadedEvents ? 'OK' : '';
  for (const event of events) {
    if (event.severity === 'Warning') {
      status = 'Warning';
    }
    if (event.severity === 'Critical') {
      status = 'Critical';
      break;
    }
  }
  return status;
};

// process log message format
function MessageProcess(Message, content) {
  // replace thing in brackets
  var MessageResult = Message.replace(/\(.*\)/g, '');
  MessageResult = MessageResult.replace(/\[.*\]/g, '');
  MessageResult = MessageResult.replace(/AUDIT_MANUAL/g, '');
  MessageResult = MessageResult.replace(/SYSTEM_MANUAL/g, '');
  MessageResult = content + ' ' + MessageResult;
  console.log(MessageResult);
  return MessageResult;
}

// TODO: High priority events should also check if Log
// is resolved when the property is available in Redfish
const getHighPriorityEvents = (events) =>
  events.filter(({ severity }) => severity === 'Critical');

const EventLogStore = {
  namespaced: true,
  state: {
    allEvents: [],
    loadedEvents: false,
    allEventsNumber: '',
  },
  getters: {
    allEvents: (state) => state.allEvents,
    allEventsNumber: (state) => state.allEventsNumber,
    highPriorityEvents: (state) => getHighPriorityEvents(state.allEvents),
    healthStatus: (state) =>
      getHealthStatus(state.allEvents, state.loadedEvents),
  },
  mutations: {
    setAllEvents: (state, allEvents) => (
      (state.allEvents = allEvents), (state.loadedEvents = true)
    ),
    setAllEventsNumber: (state, allEventsNumber) => {
      state.allEventsNumber = allEventsNumber;
    },
    appendEvents: (state, Events) => {
      state.allEvents = state.allEvents.concat(Events);
      state.loadedEvents = true;
    },
  },
  actions: {
    //redfish/v1/Managers/bmc/LogServices/Search/Entries/<str>/
    async getAndAppendMyEventLogData({ commit }, content) {
      return await api
        .get(
          '/redfish/v1/Systems/system/LogServices/rsyslog/EventLog/Entries/' +
            content +
            '/'
        )
        .then(({ data: { Members = [] } = {} }) => {
          var index = 0;
          const eventLogs = Members.map((log) => {
            index += 1;
            const {
              // Id,
              Severity,
              Created,
              EntryType,
              Message,
              Name,
              Modified,
              Resolved,
              AdditionalDataURI,
            } = log;
            return {
              id: index,
              severity: Severity,
              date: new Date(Created),
              type: EntryType,
              description: MessageProcess(Message, content),
              name: Name,
              modifiedDate: new Date(Modified),
              uri: log['@odata.id'],
              filterByStatus: Resolved ? 'Resolved' : 'Unresolved',
              status: Resolved, //true or false
              additionalDataUri: AdditionalDataURI,
            };
          });
          if (eventLogs == {}) {
            console.log('eventLog is empty, error');
          }
          console.log('eventlog is not emmpty', eventLogs);
          commit('appendEvents', eventLogs);
        })
        .catch((error) => {
          console.log('get and Append Event Log Data error:', error);
        });
    },
    async getEventLogData({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/EventLog/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const eventLogs = Members.map((log) => {
            const { Id, Severity, Created, EntryType, Message } = log;
            return {
              id: Id,
              severity: Severity,
              date: new Date(Created),
              type: EntryType,
              description: Message,
              uri: log['@odata.id'],
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
          '/redfish/v1/Systems/system/LogServices/EventLog/Actions/LogService.ClearLog'
        )
        .then(() => dispatch('getEventLogData'))
        .then(() => i18n.tc('pageEventLogs.toast.successDelete', data))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.tc('pageEventLogs.toast.errorDelete', data));
        });
    },
    async deleteEventLogs({ dispatch }, uris = []) {
      const promises = uris.map((uri) =>
        api.delete(uri).catch((error) => {
          console.log(error);
          return error;
        })
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getEventLogData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageEventLogs.toast.successDelete',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageEventLogs.toast.errorDelete',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          })
        );
    },
  },
};

export default EventLogStore;
