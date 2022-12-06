<template>
  <overview-card
    :title="$t('pageOverview.powerInformation')"
    :to="`/resource-management/power`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.powerConsumption') }}</dt>
          <dd v-if="powerConsumptionValue == null">
            {{ $t('global.status.notAvailable') }}
          </dd>
          <dd v-else>{{ powerConsumptionValue }} W</dd>
          <dt>{{ $t('pageOverview.powerCap') }}</dt>
          <dd v-if="powerCapValue == null">
            {{ $t('global.status.disabled') }}
          </dd>
          <dd v-else>{{ powerCapValue }} W</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';

function getPowerProperty(state, property) {
  var powerConsumption = 0;
  var powerCap = 0;
  state.sensors.sensors.forEach((item) => {
    if (item.name.search('Total_power') != -1) {
      powerConsumption += item.currentValue;
      powerCap += item.upperCritical;
    }
  });
  if (property == 'powerConsumption') return powerConsumption;
  if (property == 'powerCap') return powerCap;
}

export default {
  name: 'Power',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    ...mapState({
      // powerCapValue: 'powerControl/powerCapValue',
      powerCapValue: (state) => getPowerProperty(state, 'powerCap'),
      // powerConsumptionValue: 'powerControl/powerConsumptionValue',
      powerConsumptionValue: (state) =>
        getPowerProperty(state, 'powerConsumption'),
    }),
  },
  created() {
    this.$store.dispatch('sensors/oldGetEnumSensors');
    this.$store.dispatch('powerControl/getPowerControl').finally(() => {
      this.$root.$emit('overview-power-complete');
    });
  },
};
</script>
