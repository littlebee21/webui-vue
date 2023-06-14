<template>
  <b-container fluid="xl">
    <page-title />
    <page-section>
      <b-row>
        <b-col
          v-for="image in images"
          :key="image.id"
          cols="6"
          class="mb-3 border"
        >
          <img
            :src="image.src"
            :large="image.src"
            preview="1"
            width="100%"
            height="100%"
          />
          <dt class="font-weight-bold">{{ image.name }}</dt>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import Axios from 'axios';

function blobToBase64(blob, i, callback) {
  var reader = new FileReader();
  reader.onload = function () {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    callback(base64, i);
  };
  reader.readAsDataURL(blob);
}

export default {
  name: 'Lastscreen',
  components: { PageTitle, PageSection },
  data() {
    return {
      images: [],
    };
  },
  created() {
    this.getKVMLastImages();
  },
  methods: {
    // 获取KVM图片名字
    async getKVMLastImagesName() {
      return await Axios({
        method: 'get',
        url: '/redfish/v1/filename/pic',
      })
        .then((response) => {
          let tmpImages = [];
          Object.keys(response.data).forEach((key) => {
            tmpImages.push({
              name: response.data[key].substring(
                response.data[key].lastIndexOf('/') + 1
              ),
              src: 'data:image/png;base64,',
            });
          });
          this.images = tmpImages;
          this.images = this.images.filter((item) => item.name !== 'kvm.jpg');
          this.images.sort((a, b) => {
            const atime = a.name.split('.')[0];
            const btime = b.name.split('.')[0];
            return parseInt(atime) - parseInt(btime);
          });
        })
        .catch((error) => console.log(error));
    },
    // 获取KVM图片的内容
    async getKVMLastImagesContent() {
      for (let i = 0; i < this.images.length; i++) {
        const response = await Axios({
          method: 'post',
          url: '/redfish/v1/downloadfile/pic',
          responseType: 'blob',
          data: {
            name: this.images[i].name,
          },
        });
        const blob = new Blob([response.data], { type: 'image/jpeg' });
        blobToBase64(blob, i, (base64, i) => {
          console.log(i);
          this.images[i].src = 'data:image/png;base64,' + base64;
          this.$previewRefresh();
        });
      }
    },
    async getKVMLastImages() {
      await this.getKVMLastImagesName();
      this.getKVMLastImagesContent();
    },
  },
};
</script>
