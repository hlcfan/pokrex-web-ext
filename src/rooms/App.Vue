<template>
  <div>
    <div class="container-fluid">
      <div class="row header-section">
        <div class="container">
          <a class="logo" href="https://pokrex.com" target="_blank">
            Pokre<span>x</span>
          </a>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>
    <div class="container rooms">
      <div class="row">
        <div class="col-2">
          <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            <a class="nav-link" id="v-pills-home-tab" data-toggle="pill"
              href="/prepare.html" role="tab" aria-controls="v-pills-home"
              aria-selected="true">Prepare</a>
            <a class="nav-link active" id="v-pills-profile-tab" data-toggle="pill"
              href="/rooms.html" role="tab" aria-controls="v-pills-profile"
              aria-selected="false">Rooms</a>
            <a class="nav-link" id="v-pills-profile-tab" data-toggle="pill"
              href="/sync.html" role="tab" aria-controls="v-pills-profile"
              aria-selected="false">Sync</a>
          </div>
        </div>
        <div class="col-10">
          <div class="card">
            <div class="card-header">Rooms</div>
            <div class="card-body">
              <table class="table" id="rooms-table">
                <thead>
                  <tr>
                    <td scope="col">Name</td>
                    <td scope="col">Date</td>
                    <td scope="col">Sync</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in rooms">
                    <td><a :href="item.link" target="_blank">{{item.name}}</a></td>
                    <td>{{item.create_date}}</td>
                    <td>
                      <a :href="`/sync.html#${item.id}`" class="item__add">Update to JIRA</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const POKREX_HOST="https://pokrex.com"
export default {
  name: "App",
  data: ( ) => {
    return {
      rooms: []
    }
  },
  methods: {
  },
  mounted () {
    axios.request({
      baseURL: `${POKREX_HOST}/api/v1`,
      url: "/rooms.json",
      timeout: 5000
    }).then((response) => {
      this.rooms = response["data"]["data"]
    }).catch((error) => {
      console.error(error)
    })
  }
};
</script>

<style scoped>
.header-section {
  background: #fff;
  border-bottom: 1px solid #d0d4d9;
  -webkit-box-shadow: 0px 1px 1px #d0d4d9;
  box-shadow: 0px 1px 1px #d0d4d9;
}

.header-section .container {
  text-align: center;
}
.header-section .container a.logo {
  text-decoration: none;
  color: #25272b;
  font-size: 2.5rem;
  line-height: 60px;
  font-weight: 500;
}

.header-section .container a.logo span {
  color: #46b8da;
}

.rooms {
  margin-top: 30px;
}

.connectivity {
  float: right;
}
</style>
