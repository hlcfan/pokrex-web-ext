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
    <div class="container prepare">
      <nav class="row">
        <div class="col-2">
          <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            <a class="nav-link active" id="v-pills-home-tab" data-toggle="pill"
              href="/prepare.html" role="tab" aria-controls="v-pills-home"
              aria-selected="true">Prepare</a>
            <a class="nav-link" id="v-pills-profile-tab" data-toggle="pill"
              href="/rooms.html" role="tab" aria-controls="v-pills-profile"
              aria-selected="false">Rooms</a>
            <a class="nav-link" id="v-pills-profile-tab" data-toggle="pill"
              href="/sync.html" role="tab" aria-controls="v-pills-profile"
              aria-selected="false">Sync</a>
          </div>
        </div>
        <div class="col-10">
          <div class="card">
            <div class="card-header">
              Sync to JIRA
              <span v-if="signed_in" class="connectivity">
                ✅ Signed in
              </span>
              <span v-else class="connectivity">🔴 <a href="https://agilemana.com/users/sign_in">Sign in required</a></span>
            </div>
            <div class="card-body">
              <div class="row">
                <!-- Left side -->
                <div class="col">
                  <table class="table table-bordered">
                    <thead>
                      <tr>
                        <td>Ticket link</td>
                        <td>Description</td>
                        <td>Remove</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in groom_items">
                        <td><a :href="item.link" target="_blank">{{trimIssueLink(item.link)}}</a></td>
                        <td>{{item.desc}}</td>
                        <td>
                          <a href="#" class="item__remove"
                                      v-on:click="removeFromPrep(item.link)">Remove</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <hr />
              <div class="row">
                <div class="col">
                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label for="room-name">Name</label>
                      <input type="text" v-model="name" class="form-control" id="room-name"
                      placeholder="Room name">
                    </div>
                    <div class="form-group col-md-2">
                      <label for="room-timer">Timer</label>
                      <select v-model="timer" class="custom-select mr-sm-2" id="room-timer">
                        <option value="">No timer</option>
                        <option value="1">1 min</option>
                        <option value="2">2 min</option>
                        <option value="3">3 min</option>
                        <option value="4">4 min</option>
                        <option value="5">5 min</option>
                        <option value="10">10 min</option>
                        <option value="15">15 min</option>
                      </select>
                    </div>
                    <div class="form-group col-md-2">
                      <label for="room-mode">Mode</label>
                      <select v-model="mode" class="custom-select mr-sm-2" id="room-mode">
                        <option value="">Normal</option>
                        <option value="1">Free style</option>
                        <option value="2">Async mode</option>
                      </select>
                    </div>
                    <div class="form-group col-md-2">
                      <label for="room-scheme">Scheme</label>
                      <select v-model="scheme" class="custom-select mr-sm-2"
                                               id="room-scheme">
                        <option v-for="(name, id) in schemes" :value="name">
                          {{id}}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="room-moderators">Moderator</label>
                    <input type="text" class="form-control" id="room-moderators"
                    placeholder="Type to add moderators">
                  </div>
                  <button type="button" class="btn btn-agilemana-blue" @click="createRoom">Create room</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Tagify from '@yaireo/tagify'
import 'bootstrap/scss/bootstrap.scss'
import './index.scss'
import '@yaireo/tagify/src/tagify.scss'
import { GetBrowserStorage, SERVER_HOST } from '../utilities.js'

export default {
  name: "App",
  data: function () {
    return {
      groom_items: [],
      name:        "",
      timer:       "",
      mode:        "",
      // todo: save to preference
      scheme:      "fibonacci",
      schemes:     [],
      moderators:  [],
      signed_in: false
    }
  },
  methods: {
    trimIssueLink(link) {
      const issueIdRegex = /(http|https):\/\/.*\/(browse|issues)\/(\w+-\d+)/i
      return issueIdRegex.exec(link)[3]
    },
    removeFromPrep: function(link) {
      this.groom_items = this.groom_items.filter((item, index, arr) => {
        return item.link !== link
      })
      const storage = GetBrowserStorage()
      storage.set({prepItems: this.groom_items}, () => {
        console.dir(this.groom_items)
      })
    },
    createRoom: function() {
      let groomItemsIndex = 0
      let groomItemsAttributes = {}
      this.groom_items.forEach((item) => {
        groomItemsIndex += 1
        groomItemsAttributes[groomItemsIndex] = item
      })

      axios.request({
        url: `${SERVER_HOST}/rooms.json`,
        timeout: 5000,
        method: "post",
        headers: { 'content-type': 'application/json' },
        responseType: 'json',
        data: {
          room: {
            name: this.name,
            stories_attributes: groomItemsAttributes,
            moderator_ids: this.moderators.join(","),
            timer: this.timer,
            style: this.mode,
            scheme: this.scheme
          }
        }
      })
      .then(response => {
        const storage = GetBrowserStorage()
        if (storage) {
          storage.remove("prepItems", () => {
            console.log("stashed tickets removed")
          })
        }
        location.href = encodeURI(response.data.url)
      })
      .catch(function (error) {
        console.error(error);
      })
    }
  },
  mounted() {
    const storage = GetBrowserStorage()

    storage.get("prepItems", (data) => {
      if ( typeof data !== "undefined" ) {
        this.groom_items = data["prepItems"] || []
      }
    })

    storage.get("signedIn", (status) => {
      this.signed_in = status["signedIn"]
    })

    axios.request({
      url: `${SERVER_HOST}/api/v1/schemes.json`,
      timeout: 5000,
      method: "get",
      headers: { 'content-type': 'application/json' },
      responseType: 'json',
    }).then((response) => {
      this.schemes = response["data"]["data"]
      if (!this.signed_in) {
      this.signed_in = true
      storage.set({"signedIn": true}, () => {})
      }
    }).catch(error => {
      this.signed_in = false
      console.error(error)
    })

    let input = document.querySelector('#room-moderators')
    let controller
    let tagify = new Tagify(input, {
      whitelist : [],
      enforceWhitelist: true,
      dropdown : {
        classname : "color-blue",
        enabled   : 3,
        maxItems  : 5
      },
      callbacks: {
        add: (e) => {
          this.moderators.push( e.detail.data.id )
        }
      }
    })
    tagify.on("input", (e) => {
      let value = e.detail.value
      tagify.settings.whitelist.length = 0; // reset the whitelist

      // https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
      controller && controller.abort();
      controller = new AbortController(); 

      fetch(`${SERVER_HOST}/users/autocomplete.json?term=` + value, {signal:controller.signal})
        .then(RES => RES.json())
        .then((whitelist) => {
          tagify.settings.whitelist = whitelist;
          tagify.dropdown.show.call(tagify, value); // render the suggestions dropdown
        })
    })
  },
  beforeCreate () {
  }
};
</script>


