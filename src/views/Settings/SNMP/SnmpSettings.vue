<template>
  <b-container fluid="xl">
    <page-title />
    <page-section>
      <b-row class="ml-1">
        <dd>
          {{ $t('pageSnmpSettings.description') }}
        </dd>
      </b-row>
    </page-section>
    <b-row>
      <b-col md="3">
        <dl>
          <dt>SNMP function switch</dt>
          <dd>
            <b-form-checkbox
              v-model="snmpOpen"
              switch
              @change="changeSNMPState"
            >
              <span v-if="snmpOpen">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
    </b-row>
    <page-section :section-title="$t('pageSnmpSettings.administrators')">
      <template v-for="item in adminData">
        <b-row :key="item.id">
          <b-col lg="4">
            <b-form-group :label="$t('pageSnmpSettings.ipaddress')">
              <b-form-input id="input-snmp-ip" v-model="item.ip" />
            </b-form-group>
          </b-col>
          <b-col lg="3">
            <b-form-group :label="$t('pageSnmpSettings.port')">
              <b-form-input id="input-snmp-port" v-model="item.port" />
            </b-form-group>
          </b-col>
          <b-col lg="2">
            <b-button
              class="ml-2 mt-4"
              variant="info"
              @click="deleteItem(item)"
              >{{ $t('pageSnmpSettings.delete') }}</b-button
            >
          </b-col>
        </b-row>
      </template>
      <b-row>
        <b-col>
          <b-button variant="outline-info" @click="addAdminCount">{{
            $t('pageSnmpSettings.addadmincount')
          }}</b-button>
        </b-col>
      </b-row>
    </page-section>
    <b-row>
      <b-col>
        <b-button-group>
          <b-button variant="info" @click="abort">{{
            $t('pageSnmpSettings.abort')
          }}</b-button>
          <b-button class="ml-2" variant="info" @click="save">{{
            $t('pageSnmpSettings.save')
          }}</b-button>
        </b-button-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';

export default {
  name: 'SnmpSettings',
  components: { PageTitle, PageSection },

  data() {
    return {
      adminData: this.$store.getters['snmpSetting/snmpStatus'],
      snmpOpen: this.$store.getters['snmpSetting/SNMPSwitch'],
    };
  },
  created() {
    this.abort();
    this.$store
      .dispatch('snmpSetting/getSNMPSwitchStatus')
      .then(
        () => (this.snmpOpen = this.$store.getters['snmpSetting/SNMPSwitch'])
      );
  },
  methods: {
    changeSNMPState() {
      if (this.snmpOpen == true) {
        this.$store.dispatch('snmpSetting/postChangeSNMPSwitch', 'enable');
      } else {
        this.$store.dispatch('snmpSetting/postChangeSNMPSwitch', 'disable');
      }
      this.$store
        .dispatch('snmpSetting/getSNMPSwitchStatus')
        .then(
          () => (this.snmpOpen = this.$store.getters['snmpSetting/SNMPSwitch'])
        );
    },
    // add input
    addAdminCount() {
      this.adminData.push({ routerId: '', ip: '', port: '' });
    },
    // abort snmp data
    async abort() {
      console.log('abort1');
      await this.$store.dispatch('snmpSetting/getSnmpStatus');
      console.log('abort2');
      this.adminData = this.$store.getters['snmpSetting/snmpStatus'];
      console.log('abort3');
    },
    // delete data index
    async deleteItem(item) {
      await this.$store.dispatch(
        'snmpSetting/deleteSnmpSetting',
        item.routerId
      );
      this.adminData.splice(
        this.adminData.findIndex((it) => it === item),
        1
      );
    },
    // insert and modify data
    async save() {
      //modify old
      var i;
      for (i = 0; i < this.$store.getters['snmpSetting/snmpStatusCount']; i++) {
        this.$store.dispatch(
          'snmpSetting/modifySnmpSetting',
          this.adminData[i]
        );
      }
      //add new
      const oneSnmpSettingTwo = {};
      for (; i < this.adminData.length; i++) {
        oneSnmpSettingTwo.port = parseInt(this.adminData[i].port);
        oneSnmpSettingTwo.ipaddr = this.adminData[i].ip;
        this.$store.dispatch('snmpSetting/postSnmpSetting', oneSnmpSettingTwo);
      }
      this.abort();
    },
  },
};
</script>
