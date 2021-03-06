<template>
  <div>
    <div class="container-fluid">
      <div class="row header-section">
        <div class="container">
          <a class="logo" href="https://agilemana.com" target="_blank">
            Pokre<span>x</span>
          </a>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>
    <div class="container sync">
      <div class="row">
        <div class="col-2">
          <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            <a class="nav-link" id="v-pills-home-tab" data-toggle="pill"
              href="/prepare.html" role="tab" aria-controls="v-pills-home"
              aria-selected="true">Prepare</a>
            <a class="nav-link" id="v-pills-profile-tab" data-toggle="pill"
              href="/rooms.html" role="tab" aria-controls="v-pills-profile"
              aria-selected="false">Rooms</a>
            <a class="nav-link active" id="v-pills-profile-tab" data-toggle="pill"
              href="/sync.html" role="tab" aria-controls="v-pills-profile"
              aria-selected="false">Sync</a>
          </div>
        </div>
        <div class="col-10">
          <div class="card">
            <div class="card-header">Sync to JIRA</div>
            <div class="card-body">
              <div class="form-row">
                <div class="form-group col-md-3">
                  <label for="username">Username</label>
                  <input type="email" class="form-control"
                                      v-model="config.username" id="username"
                                                           placeholder="Username">
                </div>
                <div class="form-group col-md-3">
                  <label for="password">Password</label>
                  <input type="password" class="form-control"
                                      v-model="config.password" id="password"
                                                           placeholder="Password">
                </div>
                <div class="form-group col-md-3">
                  <label for="field">Field</label>
                  <input type="email" class="form-control" v-model="config.field" id="field"
                                                           placeholder="JIRA field">
                </div>
                <div class="form-group col-md-2">
                  <label>&nbsp;</label>
                  <button type="submit" class="form-control btn btn-agilemana-blue"
                    @click="handleSynk">Sync
                    to JIRA</button>
                </div>
              </div>
              <p class="text-secondary font-italic">No credentials if you already signed in to JIRA</p>
              <hr />
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Points</th>
                    <th scope="col">Sync status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(story, link) in tickets">
                    <td>
                      <a v-if="isValidUrl(link)" :href="link" target="_blank">{{link}}</a>
                      <a v-else>{{link}}</a>
                    </td>
                    <td>{{story.point}}</td>
                    <td>{{story.status || ""}}</td>
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
import 'bootstrap/scss/bootstrap.scss'
import { GetBrowserStorage, SERVER_HOST } from '../utilities.js'
import * as Sentry from "@sentry/vue";

export default {
  name: "App",
  data: ( ) => {
    return {
      tickets: {},
      config: {
        username: "",
        password: "",
        field: "Story points"
      }
    }
  },
  methods: {
    issueLinkToApiUrl(issueLink) {
      // http://localhost:8080/browse/POK-4 => http://localhost:8080/rest/api/2/issue/POK-1
      const anchorTag = document.createElement('a')
      anchorTag.href = issueLink
      const matches = /\/browse\/(.*)/.exec(anchorTag.pathname)
      return matches && `${anchorTag.origin}/rest/api/2/issue/${matches[1]}`
    },
    jiraHostFromUrl(url) {
      const anchorTag = document.createElement("a")
      anchorTag.href = url
      return anchorTag.origin
    },
    isValidUrl(url) {
      const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/
      return !!regex.test(url)
    },
    setSyncStatus(link, statusText) {
      let linkItem = {}
      linkItem[link] = { ...this.tickets[link], status: statusText }
      this.tickets = {...this.tickets, ...linkItem }
    },
    handleSynk() {
      const auth = {
        username: this.config.username,
        password: this.config.password
      }
      const storage = GetBrowserStorage()
      storage.set({auth: auth}, () => {
        console.log("Auth info saved")
      })


      let tickets = this.tickets
      let jiraHost
      let that = this

      for(let [link, _] of Object.entries(tickets)) {
        if(this.isValidUrl(link)) {
          jiraHost = this.jiraHostFromUrl(link)
          break
        }
      }

      async function getJiraPointField() {
        const resp = await axios.request({
          url: `${jiraHost}/rest/api/2/field`,
          timeout: 5000,
          method: "get",
          headers: {
            "Content-Type": "application/json"
          },
          responseType: 'json',
          auth: auth
        }).then((response) => {
          return response.data
            .find(jiraField => jiraField.name.toLowerCase() === that.config.field.toLowerCase())
            .id
        }).catch((err) => {
          return undefined
        })

        return resp
      }

      getJiraPointField().then(
        function(jiraPointField) {
          if (typeof(jiraPointField) === 'undefined') {
            console.error("fail to fetch story point field.")
            return
          }

          for(let [link, story] of Object.entries(tickets)) {
            if(that.isValidUrl(link)) {
              const ticketPoint = isNaN(story.point) ? story.point : parseFloat(story.point)
              const jiraHost = that.jiraHostFromUrl(link)
              that.setSyncStatus(link, "In progress")
              console.log("===Start updating: ", link)

              let fieldsToUpdate = {}
              fieldsToUpdate[jiraPointField] = ticketPoint
              axios.request({
                url: that.issueLinkToApiUrl(link),
                method: "put",
                timeout: 5000,
                headers: {
                  "Content-Type": "application/json"
                },
                responseType: 'json',
                auth: auth,
                data: {
                  fields: fieldsToUpdate
                }
              }).then((response) => {
                console.log(`Updated: ${link}`)
                that.setSyncStatus(link, "✅")
              }).catch((error) => {
                const {
                  data: {errorMessages, errors},
                  status,
                } = error.response;

                that.setSyncStatus(link, `⛔️ ${JSON.stringify(errors)}`)
                Sentry.captureMessage(JSON.stringify(errors))
                console.log("==Status:", status)
                console.error("==Errors:", errors)
                console.log("==ErrorsMessages:", errorMessages)
              })
            } else {
              that.setSyncStatus(link, "skipped")
            }
          }
        }
      )
    }
  },
  mounted () {
    const storage = GetBrowserStorage()
    storage.get("auth", (result) => {
      const auth = result["auth"] || {}
      this.config = { ...this.config, username: auth.username, password: auth.password }
    })
    const roomId= location.hash.slice(1)
    if(roomId.length) {
      axios.request({
        baseURL: `${SERVER_HOST}/api/v1`,
        url: `/rooms/${roomId}`,
        timeout: 5000
      }).then((response) => {
        this.tickets = response["data"]["data"]
      }).catch((error) => {
        console.error(error)
      })
    }
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

.sync {
  margin-top: 30px;
}

.connectivity {
  float: right;
}

.btn-agilemana-blue {
  color: #fff;
  background-color: #5bc0de;
  border-color: #46b8da;
}
</style>
