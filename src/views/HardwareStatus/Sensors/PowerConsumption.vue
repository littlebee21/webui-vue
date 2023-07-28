<template>
  <b-container fluid="xl">
    <dt>{{ $t('pageSensors.powerConsumptionHistory') }}</dt>
    <div class="PowerConsumption">
      <!-- 
        参数说明：
        1.options:要传入的setOption配置数据
        2.autoresize:图表在组件根元素尺寸变化时是否需要自动进行重绘(自动缩放图表)
       -->
      <VChart :options="sensorDatas" :autoresize="true" />
    </div>
  </b-container>
</template>
<script>
export default {
  name: 'PowerConsumption',
  data() {
    return {};
  },
  computed: {
    sensorDatas() {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          data: ['Total_power2', 'Total_power1', 'Total_power_sum'],
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.HistorySensors.time,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: 'Total_power2',
            type: 'line',
            color: '#00a5df',
            data: this.HistorySensors.Total_power2,
          },
          {
            name: 'Total_power1',
            type: 'line',
            color: '#ee6ea5',
            data: this.HistorySensors.Total_power1,
          },
          {
            name: 'Total_power_sum',
            type: 'line',
            color: '#00b526',
            data: this.HistorySensors.Total_power_sum,
          },
        ],
      };
    },
    HistorySensors() {
      return this.$store.getters['sensors/HistorySensors'];
    },
  },
};
</script>

<style scoped>
.echarts {
  margin: 0 auto;
  width: 100%;
}
</style>
