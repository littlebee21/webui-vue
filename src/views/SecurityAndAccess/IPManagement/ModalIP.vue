<template>
  <b-modal id="modal-ip" ref="modal" @hidden="resetForm">
    <template #modal-title>
      {{ $t('pageIPManagement.addIP') }}
    </template>
    <b-form id="form-ip" novalidate @submit.prevent="handleSubmit">
      <b-container>
        <b-row>
          <b-col>
            <b-form-group label="ip/username" label-for="name">
              <b-form-input
                id="name"
                v-model="form.name"
                type="text"
                aria-describedby="name-help-block"
                data-test-id="ipManagement-input-name"
                :state="getValidationState($v.form.name)"
                @input="$v.form.name.$touch()"
              />
              <b-form-valid-feedback>
                <template v-if="usernamePattern">
                  {{ $t('pageIPManagement.usernamePattern') }}
                </template>
                <template v-else-if="addressPattern">
                  {{ $t('pageIPManagement.addressPattern') }}
                </template>
                <template v-else-if="!usernamePattern">
                  {{ $t('pageIPManagement.example') }}
                </template>
              </b-form-valid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button form="form-ip" type="submit" variant="primary" @click="onOk">
        {{ $t('pageIPManagement.addIP') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  mixins: [VuelidateMixin],
  props: {
    ip: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        status: true,
        name: '',
        privilege: null,
        password: '',
        passwordConfirmation: '',
        manualUnlock: false,
      },
    };
  },
  computed: {
    usernamePattern() {
      return /^([a-zA-Z_][a-zA-Z0-9_]*)/.test(this.form.name);
    },
    addressPattern() {
      var result1 = /^(?=.*[^.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}$/.test(
        this.form.name
      );
      let str = this.form.name.split('.');
      var result2 = str.length - 1 == 3 ? true : false;
      return result1 && result2;
    },
  },
  watch: {
    ip: function (value) {
      if (value === null) return;
      this.form.name = value.name;
    },
  },
  validations() {
    return {
      form: {
        name: {
          required,
          maxLength: maxLength(16),
        },
        manualUnlock: {},
      },
    };
  },
  methods: {
    handleSubmit() {
      let ipData = {};

      if (this.$v.$invalid) return;
      if (this.$v.form.name.$dirty) {
        ipData.name = this.form.name;
      }
      if (this.$v.form.manualUnlock.$dirty) {
        // If form manualUnlock control $dirty then
        // set ip Locked property to false
        ipData.locked = false;
      }
      console.log(ipData);
      this.$emit('ok', { ipData });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.originalIPname = '';
      this.form.name = '';
      this.$v.$reset();
      this.$emit('hidden');
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
