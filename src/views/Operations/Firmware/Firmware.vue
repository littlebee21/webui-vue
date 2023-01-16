<template>
  <b-container fluid="xl">
    <page-title />
    <alerts-server-power
      v-if="isServerPowerOffRequired"
      :is-server-off="isServerOff"
    />

    <!-- Firmware cards -->
    <b-row>
      <b-col xl="10">
        <!-- BMC Firmware -->
        <bmc-cards :is-page-disabled="isPageDisabled" />

        <!-- Host Firmware -->
        <host-cards />
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="10">
        <dl>
          <dd>{{ $t('pageFirmware.firmwareVersionGetAttention') }}</dd>
        </dl>
        <b-button
          :disabled="disabled"
          size="sm"
          class="d-block mb-5"
          variant="primary"
          @click="firmwareVersionGet"
        >
          {{ btnText }}
        </b-button>
      </b-col>
    </b-row>

    <!-- Update firmware-->
    <page-section
      :section-title="$t('pageFirmware.sectionTitleUpdateFirmware')"
    >
      <b-row>
        <b-col sm="8" md="6" xl="4">
          <!-- Update form -->
          <form-update
            :is-server-off="isServerOff"
            :is-page-disabled="isPageDisabled"
          />
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import AlertsServerPower from './FirmwareAlertServerPower';
import BmcCards from './FirmwareCardsBmc';
import FormUpdate from './FirmwareFormUpdate';
import HostCards from './FirmwareCardsHost';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';

import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'FirmwareSingleImage',
  components: {
    AlertsServerPower,
    BmcCards,
    FormUpdate,
    HostCards,
    PageSection,
    PageTitle,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      totalCount: 0,
      disabled: false,
      interval: undefined,
      loading,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
    };
  },
  computed: {
    btnText() {
      return this.totalCount !== 0
        ? `${this.totalCount}秒再次获取`
        : '获取版本号';
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isServerOff() {
      return this.serverStatus === 'off' ? true : false;
    },
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
    isPageDisabled() {
      if (this.isServerPowerOffRequired) {
        return !this.isServerOff || this.loading || this.isOperationInProgress;
      }
      return this.loading || this.isOperationInProgress;
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('firmware/getFirmwareInformation')
      .finally(() => this.endLoader());
  },
  methods: {
    // auto control command
    async firmwareVersionGet() {
      this.totalCount = 10;
      this.disabled = true;
      await this.$store
        .dispatch('firmware/firmwareVersionGet')
        .catch((error) => console.log(error))
        .finally();
      this.interval = setInterval(() => {
        this.totalCount--;
        console.log('this.totalCount', this.totalCount);
        if (this.totalCount <= 0) {
          clearInterval(this.interval);
          this.disabled = false;
        }
      }, 1000);
      await this.$store.dispatch('firmware/getFirmwareInformation');
    },
  },
};
</script>
