<template>
  <b-container fluid="xl">
    <page-title />
    <dd>{{ $t('activation.serverInformation') }}</dd>
    <b-row class="row mt-3">
      <b-card style="width: 40rem; height: 20rem">
        <dl>
          <dd>
            {{ $t('activation.activeStatus') }}
            {{ activationStatus }}
          </dd>
          <dd>
            {{ $t('activation.activationCode') }}
            {{ activationCode }}
          </dd>
        </dl>
      </b-card>
    </b-row>
    <b-row class="row mt-5">
      <b-col>
        <dd>{{ $t('activation.Information') }}</dd>
        <b-input-group class="mt-3 text-right">
          <b-form-input
            v-model="activationCodeInput"
            class="mr-1"
            placeholder="Activation code"
          ></b-form-input>
          <b-input-group-append>
            <b-button variant="primary" @click="postActiveCode">
              <icon-add />
              {{ $t('activation.send') }}
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
      <b-col cols="6"></b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'Activation',
  components: {
    PageTitle,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      activationCodeInput: null,
    };
  },
  computed: {
    activationCode() {
      return this.$store.getters['activation/activateCode'];
    },
    activationStatus() {
      return this.$store.getters['activation/activateState'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('activation/getActivateState')
      .finally(() => this.endLoader());
  },
  methods: {
    postActiveCode() {
      this.$store.dispatch(
        'activation/postActivateCode',
        this.activationCodeInput
      );
      this.$store.dispatch('activation/getActivateState');
    },
  },
};
</script>

<style lang="scss" scoped></style>
