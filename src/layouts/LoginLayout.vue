<template>
  <main>
    <div class="login-container">
      <div class="login-laside"></div>
      <div class="login-main">
        <div>
          <img
            class="ml-5"
            width="250px"
            src="@/assets/images/yugu-big-logo.svg"
            :alt="altLogo"
          />
          <h1 class="head">域固威芯</h1>
          <div class="login-brand mb-5"></div>
          <router-view class="login=form form-background" />
        </div>
      </div>
      <div class="login-raside"></div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'LoginLayout',
};
</script>

<style lang="scss" scoped>
.login-container {
  background: gray('100');
  display: flex;
  flex-direction: column;
  min-width: 320px;
  min-height: 100vh;
  justify-content: space-around;

  @include media-breakpoint-up('md') {
    background: $white;
    flex-direction: row;
  }
}

.head {
  margin-top: 10px;
  margin-left: 84px;
}

.login-main {
  width: 400px;
  min-height: 50vh;
  height: 200px;
  padding: $spacer * 3;

  @include media-breakpoint-up('md') {
    background: gray('100');
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    justify-content: center;
    align-items: center;
  }
}

.login-laside {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: $spacer * 1.5;
  margin-bottom: $spacer;
  background-image: url('../assets/images/square-point.gif');
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.1;
  @include media-breakpoint-up('md') {
    min-height: 100vh;
    padding-bottom: $spacer;
    flex: 1 1 75%;
    margin-bottom: 0;
  }
}
.login-raside {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: $spacer * 1.5;
  margin-bottom: $spacer;
  background-image: url('../assets/images/square-point.gif');
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.1;
  @include media-breakpoint-up('md') {
    min-height: 100vh;
    padding-bottom: $spacer;
    flex: 1 1 25%;
    margin-bottom: 0;
  }
}
</style>
