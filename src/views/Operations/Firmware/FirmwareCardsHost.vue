<template>
  <page-section :section-title="$t('pageFirmware.sectionTitleHostCards')">
    <b-card-group deck>
      <!-- Running image -->
      <b-card>
        <template #header>
          <p class="font-weight-bold m-0">
            {{ $t('pageFirmware.cardTitleRunning') }}
          </p>
        </template>
        <dl class="mb-0">
          <dt>{{ $t('pageFirmware.biosVersion') }}</dt>
          <dd class="mb-0">{{ runningVersion }}</dd>
          <dt>{{ $t('pageFirmware.hmcodeVersion') }}</dt>
          <dd class="mb-0">{{ hmcodeVersion }}</dd>
          <dt>{{ $t('pageFirmware.sromVersion') }}</dt>
          <dd class="mb-0">{{ sromVersion }}</dd>
        </dl>
      </b-card>

      <!-- Backup image -->
      <b-card>
        <template #header>
          <p class="font-weight-bold m-0">
            {{ $t('pageFirmware.cardTitleBackup') }}
          </p>
        </template>
        <dl class="mb-0">
          <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
          <dd class="mb-0">
            <status-icon v-if="showBackupImageStatus" status="danger" />
            <span v-if="showBackupImageStatus" class="sr-only">
              {{ backupStatus }}
            </span>
            {{ backupVersion }}
          </dd>
        </dl>
      </b-card>
    </b-card-group>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';

export default {
  components: { PageSection },
  computed: {
    running() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    backup() {
      return this.$store.getters['firmware/backupHostFirmware'];
    },
    runningVersion() {
      return this.$store.getters['firmware/activeHostFirmwareVersion'];
    },
    hmcodeVersion() {
      return this.$store.getters['firmware/hmcodeVersion'];
    },
    sromVersion() {
      return this.$store.getters['firmware/sromVersion'];
    },
    backupVersion() {
      return this.backup?.version || '--';
    },
    backupStatus() {
      return this.backup?.status || null;
    },
    showBackupImageStatus() {
      return (
        this.backupStatus === 'Critical' || this.backupStatus === 'Warning'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.page-section {
  margin-top: -$spacer * 1.5;
}
</style>
