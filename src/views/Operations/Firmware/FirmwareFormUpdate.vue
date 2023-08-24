<template>
  <div>
    <div class="form-background p-3">
      <b-form @submit.prevent="onSubmitUpload">
        <b-form-group
          v-if="isTftpUploadAvailable"
          :label="$t('pageFirmware.form.updateFirmware.fileSource')"
          :disabled="isPageDisabled"
        >
          <b-form-radio v-model="isWorkstationSelected" :value="true">
            {{ $t('pageFirmware.form.updateFirmware.workstation') }}
          </b-form-radio>
          <b-form-radio v-model="isWorkstationSelected" :value="false">
            {{ $t('pageFirmware.form.updateFirmware.tftpServer') }}
          </b-form-radio>
        </b-form-group>

        <!-- Workstation Upload -->
        <template v-if="isWorkstationSelected">
          <b-form-group
            :label="$t('pageFirmware.form.updateFirmware.imageFile')"
            label-for="image-file"
          >
            <form-file
              id="image-file"
              :disabled="isPageDisabled"
              :state="getValidationState($v.file)"
              aria-describedby="image-file-help-block"
              @input="onFileUpload($event)"
            >
              <template #invalid>
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.required') }}
                </b-form-invalid-feedback>
              </template>
            </form-file>
          </b-form-group>
        </template>

        <!-- TFTP Server Upload -->
        <template v-else>
          <b-form-group
            :label="$t('pageFirmware.form.updateFirmware.fileAddress')"
            label-for="tftp-address"
          >
            <b-form-input
              id="tftp-address"
              v-model="tftpFileAddress"
              type="text"
              :state="getValidationState($v.tftpFileAddress)"
              :disabled="isPageDisabled"
              @input="$v.tftpFileAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              {{ $t('global.form.fieldRequired') }}
            </b-form-invalid-feedback>
          </b-form-group>
        </template>
        <b-form-radio-group v-model="firmwareContent" stacked>
          <b-form-radio class="mb-1" value="hmcode">
            {{ $t('pageFirmware.hmcode') }}
          </b-form-radio>
          <b-form-radio class="mb-1" value="srom">
            {{ $t('pageFirmware.srom') }}
          </b-form-radio>
          <b-form-radio class="mb-1" value="3m_bios">
            {{ $t('pageFirmware.3m_bios') }}
          </b-form-radio>
          <b-form-radio class="mb-1" value="8m_bios">
            {{ $t('pageFirmware.8m_bios') }}
          </b-form-radio>
          <b-form-radio class="mb-1" value="bmcImageMtd">
            {{ $t('pageFirmware.bmc_image_mtd') }}
          </b-form-radio>
          <b-form-radio class="mb-3" value="bmc_image">
            {{ $t('pageFirmware.bmc_image') }}
          </b-form-radio>
        </b-form-radio-group>
        <b-btn
          data-test-id="firmware-button-startUpdate"
          type="submit"
          variant="primary"
          :disabled="isPageDisabled"
        >
          {{ $t('pageFirmware.form.updateFirmware.startUpdate') }}
        </b-btn>
      </b-form>
    </div>

    <!-- Modals -->
    <modal-update-firmware @ok="updateFirmware" />
  </div>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

import FormFile from '@/components/Global/FormFile';
import ModalUpdateFirmware from './FirmwareModalUpdateFirmware';

export default {
  components: { FormFile, ModalUpdateFirmware },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
    isServerOff: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      loading,
      firmwareContent: '8m_bios',
      isWorkstationSelected: true,
      file: null,
      tftpFileAddress: null,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
    };
  },
  computed: {
    isTftpUploadAvailable() {
      return this.$store.getters['firmware/isTftpUploadAvailable'];
    },
  },
  watch: {
    isWorkstationSelected: function () {
      this.$v.$reset();
      this.file = null;
      this.tftpFileAddress = null;
    },
  },
  validations() {
    return {
      file: {
        required: requiredIf(function () {
          return this.isWorkstationSelected;
        }),
      },
      tftpFileAddress: {
        required: requiredIf(function () {
          return !this.isWorkstationSelected;
        }),
      },
    };
  },
  created() {
    this.$store.dispatch('firmware/getUpdateServiceSettings');
  },
  methods: {
    updateFirmware() {
      this.startLoader();
      const timerId = setTimeout(() => {
        this.endLoader();
        this.infoToast(this.$t('pageFirmware.toast.verifyUpdateMessage'), {
          title: this.$t('pageFirmware.toast.verifyUpdate'),
          refreshAction: true,
        });
      }, 360000);
      this.infoToast(this.$t('pageFirmware.toast.updateStartedMessage'), {
        title: this.$t('pageFirmware.toast.updateStarted'),
        timestamp: true,
      });
      if (this.isWorkstationSelected) {
        this.dispatchWorkstationUpload(timerId);
      } else {
        this.dispatchTftpUpload(timerId);
      }
    },
    // bmc update achieve 2023-0824-14
    async newUpdateBMCImage() {
      // begin
      await this.$store.dispatch('firmware/uploadFile', {
        file: null,
        firmwareContent: 'bmcImageMtdBegin',
      });

      // send content
      const chunkSize = 20 * 1024 * 1024;
      let offset = 0;
      while (offset < this.file.size) {
        const fileChunk = this.file.slice(offset, offset + chunkSize);
        await this.$store
          .dispatch('firmware/uploadFile', {
            file: fileChunk,
            firmwareContent: 'bmcImageMtdContent',
          })
          .then((message) => {
            offset += chunkSize;
            console.log(message, 'update result');
          });
      }
      // check and update
      await this.$store
        .dispatch('firmware/uploadFile', {
          file: null,
          firmwareContent: 'bmcImageMtdCheckUpdate',
        })
        .then((message) => {
          this.infoToast(message, 'update result');
        });
    },
    dispatchWorkstationUpload(timerId) {
      if (this.firmwareContent == 'bmc_image') {
        this.$store.dispatch('firmware/uploadFirmware', this.file).catch(() => {
          this.endLoader();
          // this.errorToast(message);
          clearTimeout(timerId);
        });
      } else if (this.firmwareContent == 'bmcImageMtd') {
        this.newUpdateBMCImage();
      } else {
        this.$store
          .dispatch('firmware/uploadFile', {
            file: this.file,
            firmwareContent: this.firmwareContent,
          })
          .then((message) => this.infoToast(message, 'update result'));
      }
    },
    dispatchTftpUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmwareTFTP', this.tftpFileAddress)
        .catch(() => {
          this.endLoader();
          // this.errorToast(message);
          clearTimeout(timerId);
        });
    },
    onSubmitUpload() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$bvModal.show('modal-update-firmware');
    },
    onFileUpload(file) {
      this.file = file;
      this.$v.file.$touch();
    },
  },
};
</script>
