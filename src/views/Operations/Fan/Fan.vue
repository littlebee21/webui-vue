<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section>
          <b-row>
            <dl>
              <dt>{{ $t('pageFan.informations.userManual') }}</dt>
              <dd>{{ $t('pageFan.informations.AutoControlInformation') }}</dd>
              <dd>{{ $t('pageFan.informations.ManualControlInformaiton') }}</dd>
            </dl>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <b-row>
      <dl>
        <dt>{{ $t('pageFan.policies.policiesTitle') }}</dt>
        <dd>{{ $t('pageFan.policies.CurrentPatten') }} {{ currentPattern }}</dd>
        <dd>{{ $t('pageFan.policies.FanSpeed') }} {{ currentFanSpeed }}</dd>
        <dd>{{ $t('pageFan.policies.message') }}: {{ message }}</dd>
      </dl>
    </b-row>
    <b-row class="d-block mt-5">
      <dl>
        <dt>{{ $t('pageFan.AutoControlTitle') }}</dt>
      </dl>
    </b-row>
    <b-button variant="primary" @click="AutoConfirmOnClick">
      {{ $t('pageFan.controllers.confirmPattern') }}
    </b-button>
    <b-row class="d-block mt-5">
      <dl>
        <dt>{{ $t('pageFan.ManualControlTitle') }}</dt>
        <b-col cols="4">
          <b-form-input
            v-model="fanSpeedWanted"
            :placeholder="$t('pageFan.fanSpeedWantDes')"
          >
          </b-form-input>
        </b-col>
      </dl>
    </b-row>
    <b-button variant="primary" @click="manualConfirmOnClick">
      {{ $t('pageFan.controllers.confirmPattern') }}
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

// control button click time， 防抖
// function debounce(fn, duration = 100) {
//   let timer = null;
//   return (...arg) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       fn(...arg);
//     }, duration);
//   };
// }

export default {
  name: 'Fan',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    clearInterval(this.timer);
    this.hideLoader();
    next();
  },
  data() {
    return {
      fanSpeedWanted: null,
      fanLock: null,
    };
  },
  computed: {
    currentPattern() {
      return this.$store.getters['fanControl/currentFanPattern'];
    },
    currentFanSpeed() {
      return this.$store.getters['fanControl/currentFanSpeed'];
    },
    message() {
      return this.$store.getters['fanControl/message'];
    },
  },
  created() {
    this.startLoader();
    this.timer = setInterval(() => {
      this.$store.dispatch('fanControl/getFanModal'); //风扇当前模式
      this.$store.dispatch('fanControl/getFanSpeed'); //风扇当前速度
    }, 5000);
  },
  methods: {
    // auto control command
    AutoConfirmOnClick() {
      if (this.fanLock == 'lock') {
        return;
      }
      this.fanLock = 'lock';
      this.$store
        .dispatch('fanControl/postAutoControlFanSpeed')
        .catch((error) => console.log(error))
        .finally();
      console.log('auto control running');
      this.fanLock = null;
    },
    // manual control command
    manualConfirmOnClick() {
      this.$store.commit('fanControl/setFanSpeedWanted', this.fanSpeedWanted);
      if (this.fanLock == 'lock') {
        return;
      }
      this.fanLock = 'lock';
      this.$store
        .dispatch('fanControl/postManualControlFanSpeed')
        .catch((error) => console.log(error))
        .finally();
      console.log('manual control running');
      this.fanLock = null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
