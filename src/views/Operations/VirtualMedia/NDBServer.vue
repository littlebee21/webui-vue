<template>
  <div>
    <b-form @submit="onSubmit" @reset="onReset">
      <b-form-group
        id="input-group-1"
        label="NDB Server IPaddress:"
        label-for="input-1"
        description="add the NDB Server you want to connect"
      >
        <b-form-input
          id="input-1"
          v-model="form.ipaddress"
          required
          placeholder="Enter IP"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="input-group-2"
        label="NDB Server Port:"
        label-for="input-2"
      >
        <b-form-input
          id="input-2"
          v-model="form.port"
          required
          placeholder="Enter port"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="input-group-2"
        label="NDB Server anhzuangbao"
        label-for="input-2"
      >
        <b-link
          class="d-block mb-1"
          href="https://raw.githubusercontent.com/jeffbryner/NBDServer/master/NBDServer.exe"
          >NBDServer.exe(win) download</b-link
        >
      </b-form-group>

      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset">Reset</b-button>
      <b-button type="reset" variant="danger">Stop</b-button>
    </b-form>
  </div>
</template>

<script>
import Axios from 'axios';

export default {
  name: 'NdbServer',
  data() {
    return {
      form: {
        ipaddress: '',
        port: '',
      },
    };
  },
  methods: {
    // client mount Server
    NDBmount() {
      return Axios({
        method: 'post',
        url: '/redfish/v1/ndbMount',
        data: this.form,
      })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.log(error));
    },
    onSubmit(evt) {
      evt.preventDefault();
      alert(JSON.stringify(this.form));
    },
    onReset(evt) {
      evt.preventDefault();
      // Reset our form values
      this.form.ipaddress = '';
      this.form.port = '';
    },
  },
};
</script>
