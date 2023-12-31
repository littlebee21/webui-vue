<template>
  <page-section :section-title="$t('pageNetwork.ipv4')">
    <b-row>
      <b-col>
        <h3 class="h5">
          {{ $t('pageNetwork.ipv4Addresses') }}
        </h3>
      </b-col>
      <b-col class="text-right">
        <b-button variant="primary" @click="initAddIpv4Address()">
          <icon-add />
          {{ $t('pageNetwork.table.addIpv4Address') }}
        </b-button>
      </b-col>
    </b-row>
    <b-table
      responsive="md"
      hover
      :fields="ipv4TableFields"
      :items="form.ipv4TableItems"
      :empty-text="$t('global.table.emptyMessage')"
      class="mb-0"
      show-empty
    >
      <template #cell(actions)="{ item, index }">
        <table-row-action
          v-for="(action, actionIndex) in item.actions"
          :key="actionIndex"
          :value="action.value"
          :title="action.title"
          :enabled="action.enabled"
          @click-table-action="onIpv4TableAction(action, $event, index)"
        >
          <template #icon>
            <icon-edit v-if="action.value === 'edit'" />
            <icon-trashcan v-if="action.value === 'delete'" />
          </template>
        </table-row-action>
      </template>
    </b-table>
  </page-section>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';

export default {
  name: 'Ipv4Table',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    PageSection,
    TableRowAction,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        ipv4TableItems: [],
      },
      actions: [
        {
          value: 'edit',
          title: this.$t('global.action.edit'),
        },
        {
          value: 'delete',
          title: this.$t('global.action.delete'),
        },
      ],
      ipv4TableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetwork.table.ipAddress'),
        },
        {
          key: 'Gateway',
          label: this.$t('pageNetwork.table.gateway'),
        },
        {
          key: 'SubnetMask',
          label: this.$t('pageNetwork.table.subnet'),
        },
        {
          key: 'AddressOrigin',
          label: this.$t('pageNetwork.table.addressOrigin'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getIpv4TableItems();
    },
    ethernetData() {
      this.getIpv4TableItems();
    },
  },
  created() {
    this.getIpv4TableItems();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-table-ipv4-complete');
    });
  },
  methods: {
    getIpv4TableItems() {
      const index = this.tabIndex;
      const addresses = this.ethernetData[index].IPv4Addresses || [];
      this.form.ipv4TableItems = addresses.map((ipv4) => {
        return {
          Address: ipv4.Address,
          SubnetMask: ipv4.SubnetMask,
          Gateway: ipv4.Gateway,
          AddressOrigin: ipv4.AddressOrigin,
          actions: [
            {
              value: 'delete',
              title: this.$t('pageNetwork.table.deleteIpv4'),
            },
          ],
        };
      });
    },
    onIpv4TableAction(action, $event, index) {
      if ($event === 'delete') {
        this.deleteIpv4TableRow(index);
      }
    },
    deleteIpv4TableRow(index) {
      if (this.form.ipv4TableItems.length <= 1) {
        this.errorToast(this.$t('pageNetwork.cantDeleteLast'));
        return;
      }
      // 判断当前操作的地址是当前正在使用的地址
      if (
        window.location.host.includes(this.form.ipv4TableItems[index].Address)
      ) {
        this.errorToast(this.$t('pageNetwork.IPusedRemoving'));
        return;
      }
      if (this.form.ipv4TableItems.length == 2) {
        this.form.ipv4TableItems.splice(index, 1);
        const newIpv4Array = this.form.ipv4TableItems.map((ipv4) => {
          const { Address, SubnetMask, Gateway } = ipv4;
          return {
            Address,
            SubnetMask,
            Gateway,
          };
        });
        this.$store
          .dispatch('network/editIpv4Address', newIpv4Array)
          .then(() =>
            this.errorToast(
              this.$t('pageNetwork.toast.errorSaveNetworkSettings', {
                setting: this.$t('pageNetwork.ipv4'),
              })
            )
          )
          .catch(() =>
            this.successToast(
              this.$t('pageNetwork.toast.successSaveNetworkSettings', {
                setting: this.$t('pageNetwork.ipv4'),
              })
            )
          );
        return;
      }

      this.form.ipv4TableItems.splice(index, 1);
      const newIpv4Array = this.form.ipv4TableItems.map((ipv4) => {
        const { Address, SubnetMask, Gateway } = ipv4;
        return {
          Address,
          SubnetMask,
          Gateway,
        };
      });
      this.$store
        .dispatch('network/editIpv4Address', newIpv4Array)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    initAddIpv4Address() {
      this.$bvModal.show('modal-add-ipv4');
    },
  },
};
</script>
