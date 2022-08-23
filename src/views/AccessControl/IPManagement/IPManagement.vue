<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="11" class="text-right">
        <b-button
          variant="primary"
          data-test-id="ipManagement-button-addIP"
          @click="initModalIP(null)"
        >
          <icon-add />
          {{ $t('pageIPManagement.addIP') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="11">
        <b-table
          ref="table"
          responsive="md"
          selectable
          show-empty
          no-select-on-click
          hover
          :busy="isBusy"
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- table actions column -->
          <template #cell(actions)="{ item }">
            <table-row-action
              v-for="(action, index) in item.actions"
              :key="index"
              :value="action.value"
              :enabled="action.enabled"
              :title="action.title"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-trashcan v-if="action.value === 'delete'" />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <modalip
      :ip="activeIP"
      :password-requirements="passwordRequirements"
      @ok="saveIP"
      @hidden="activeIP = null"
    />
  </b-container>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';

import modalip from './ModalIP';
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';

import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'IPManagement',
  components: {
    IconAdd,
    IconTrashcan,
    modalip,
    PageTitle,
    TableRowAction,
  },
  mixins: [BVTableSelectableMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      isBusy: true,
      activeIP: null,
      fields: [
        {
          key: 'number',
          label: 'number',
        },
        {
          key: 'ipname',
          label: this.$t('pageIPManagement.table.ipname') + '/UserName',
        },
        {
          key: 'actions',
          label: 'delete',
          tdClass: 'text-right text-nowrap',
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    allIPs() {
      return this.$store.getters['ipManagement/allIPs'];
    },
    tableItems() {
      //transform ip data to table data
      return this.allIPs.map((ip) => {
        return {
          ipname: ip.IPName,
          actions: [
            {
              value: 'delete',
              enabled: ip.IPName === 'root' ? false : true,
              title: this.$tc('pageIPManagement.deleteIP'),
            },
          ],
          ...ip,
        };
      });
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('ipManagement/getIPs').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
  },
  methods: {
    initModalIP(ip) {
      this.activeIP = ip;
      this.$bvModal.show('modal-ip');
    },
    initModalDelete(ip) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageIPManagement.modal.deleteConfirmMessage', {
            ip: ip.ipname,
          }),
          {
            title: this.$tc('pageIPManagement.deleteIP'),
            okTitle: this.$tc('pageIPManagement.deleteIP'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteIP(ip);
          }
        });
    },
    saveIP({ ipData }) {
      this.startLoader();
      this.$store
        .dispatch('ipManagement/updateIP', ipData)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    deleteIP({ ipname }) {
      this.startLoader();
      this.$store
        .dispatch('ipManagement/deleteIP', ipname)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'delete':
          this.initModalDelete(row);
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.btn.collapsed {
  svg {
    transform: rotate(180deg);
  }
}
</style>
