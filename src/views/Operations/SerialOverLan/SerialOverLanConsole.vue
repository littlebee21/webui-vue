<template>
  <div :class="isFullWindow ? 'full-window-container' : 'terminal-container'">
    <b-row class="d-flex">
      <b-col sm="4" md="6">
        <alert
          v-if="serverStatus === 'on' ? false : true"
          variant="warning"
          :small="true"
          class="mt-4"
        >
          <p class="col-form-label">
            {{ $t('pageSerialOverLan.alert.disconnectedAlertMessage') }}
          </p>
        </alert>
      </b-col>
    </b-row>
    <b-row class="d-flex">
      <b-col class="d-flex flex-column justify-content-end">
        <dl class="mb-2" sm="6" md="6">
          <dt class="d-inline font-weight-bold mr-1">
            {{ $t('pageSerialOverLan.status') }}:
          </dt>
          <dd class="d-inline">
            <status-icon :status="serverStatusIcon" /> {{ connectionStatus }}
          </dd>
        </dl>
      </b-col>

      <!-- <b-col v-if="!isFullWindow" class="d-flex justify-content-end">
        <b-button variant="link" type="button" @click="openConsoleWindow()">
          <icon-launch />
          {{ $t('pageSerialOverLan.openNewTab') }}
        </b-button>
      </b-col> -->
    </b-row>
    <dl class="mb-2" sm="6" md="6">
      <dt class="d-inline font-weight-bold mr-1">
        {{ $t('pageSerialOverLan.pannel1') }}:
      </dt>
      <b-link @click="downloadOperateSystemSolFile">
        {{ $t('pageSerialOverLan.downloadOperateSystemSolFile') }}
      </b-link>
    </dl>
    <div id="terminal" ref="panel"></div>
    <dl class="mb-2" sm="6" md="6">
      <dt class="d-inline font-weight-bold mr-1">
        {{ $t('pageSerialOverLan.pannel2') }}:
      </dt>
      <b-link @click="downloadBiosSolFile">
        {{ $t('pageSerialOverLan.downloadBiosSolFile') }}
      </b-link>
    </dl>
    <div id="terminal" ref="panel1"></div>
  </div>
</template>

<script>
import Alert from '@/components/Global/Alert';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { throttle } from 'lodash';
import Axios from 'axios';
import fileSaver from 'file-saver';
// import IconLaunch from '@carbon/icons-vue/es/launch/20';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'SerialOverLanConsole',
  components: {
    Alert,
    // IconLaunch,
    StatusIcon,
  },
  props: {
    isFullWindow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      resizeConsoleWindow: null,
    };
  },
  computed: {
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    serverStatusIcon() {
      return this.serverStatus === 'on' ? 'success' : 'danger';
    },
    connectionStatus() {
      return this.serverStatus === 'on'
        ? this.$t('pageSerialOverLan.connected')
        : this.$t('pageSerialOverLan.disconnected');
    },
  },
  created() {
    this.$store.dispatch('global/getServerStatus');
  },
  mounted() {
    this.openTerminal();
    this.openTerminal1();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeConsoleWindow);
    this.closeTerminal();
  },
  methods: {
    // 下载操作系统的sol打印
    downloadOperateSystemSolFile() {
      return Axios({
        method: 'get',
        url: '/redfish/v1/downloadfile/systemSolLog',
        responseType: 'blob',
      })
        .then((response) => {
          const blob = new Blob([response.data]);
          const url = URL.createObjectURL(blob);
          fileSaver.saveAs(blob, 'operation-system-sol-log.txt');
          window.open(url);
        })
        .catch((error) => console.log(error));
    },
    // 下载bios的sol打印
    downloadBiosSolFile() {
      return Axios({
        method: 'get',
        url: '/redfish/v1/downloadfile/biosSolLog',
        responseType: 'blob',
      })
        .then((response) => {
          const blob = new Blob([response.data]);
          const url = URL.createObjectURL(blob);
          fileSaver.saveAs(blob, 'bios-sol-log.txt');
          window.open(url);
        })
        .catch((error) => console.log(error));
    },
    // 页面刷新填充旧的数据
    fillTermSystem() {
      Axios({
        method: 'get',
        url: '/redfish/v1/downloadfile/systemSolLog',
        responseType: 'blob',
      })
        .then((response) => {
          const reader = new FileReader();
          const blob = new Blob([response.data]);
          reader.readAsText(blob);

          reader.onload = () => {
            console.log('response.data.text()', reader.result);
            this.term.write(reader.result);
            this.term.write('over');
          };
        })
        .catch((error) => console.log(error));
    },
    // 页面刷新填充旧的数据
    fillTermAudit() {
      Axios({
        method: 'get',
        url: '/redfish/v1/downloadfile/biosSolLog',
        responseType: 'arraybuffer',
      })
        .then((response) => {
          const fileContent = String.fromCharCode.apply(
            null,
            new Uint8Array(response.data)
          );
          this.term1.write(fileContent);
        })
        .catch((error) => console.log(error));
    },
    openTerminal() {
      const token = this.$store.getters['authentication/token'];

      this.ws = new WebSocket(`wss://${window.location.host}/console0`, [
        token,
      ]);

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      this.term = new Terminal({
        fontSize: 15,
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      });
      this.fillTermSystem();

      const attachAddon = new AttachAddon(this.ws);
      this.term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      this.term.loadAddon(fitAddon);

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      this.term.setOption('theme', SOL_THEME);

      this.term.open(this.$refs.panel);
      fitAddon.fit();

      this.resizeConsoleWindow = throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);

      try {
        this.ws.onopen = function () {
          console.log('websocket console0/ opened');
        };
        this.ws.onclose = function (event) {
          console.log(
            'websocket console0/ closed. code: ' +
              event.code +
              ' reason: ' +
              event.reason
          );
        };
      } catch (error) {
        console.log(error);
      }
    },
    openTerminal1() {
      const token = this.$store.getters['authentication/token'];

      this.ws1 = new WebSocket(`wss://${window.location.host}/console1`, [
        token,
      ]);

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      this.term1 = new Terminal({
        fontSize: 15,
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      });

      this.fillTermAudit();

      const attachAddon = new AttachAddon(this.ws1);
      this.term1.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      this.term1.loadAddon(fitAddon);

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      this.term1.setOption('theme', SOL_THEME);

      this.term1.open(this.$refs.panel1);
      fitAddon.fit();

      this.resizeConsoleWindow = throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);

      try {
        this.ws1.onopen = function () {
          console.log('websocket console1/ opened');
        };
        this.ws1.onclose = function (event) {
          console.log(
            'websocket console1/ closed. code: ' +
              event.code +
              ' reason: ' +
              event.reason
          );
        };
      } catch (error) {
        console.log(error);
      }
    },
    closeTerminal() {
      console.log('closeTerminal');
      this.term.dispose();
      this.term = null;
      this.ws.close();
      this.ws = null;

      this.term1.dispose();
      this.term1 = null;
      this.ws1.close();
      this.ws1 = null;
    },
    openConsoleWindow() {
      window.open(
        '#/console/serial-over-lan-console',
        '_blank',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~xterm/css/xterm.css';

#terminal {
  overflow: auto;
}

.full-window-container {
  width: 97%;
  margin: 1.5%;
}
</style>
