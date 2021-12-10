<template>
<div class="ui container">
    <Alert ref="alert" />
    <div class="ui center aligned basic segment">
        <h1 class="ui header">User Database Search</h1>
        <form class="ui form">
            <div class="fields">
                <div class="three wide field">
                    <select v-model="queryField">
                        <option value="ID">ID</option>
                        <option value="FirstName">First Name</option>
                        <option value="Gender">Gender</option>
                    </select>
                </div>
                <div class="eleven wide field">
                    <input type="text" v-model="queryValue">
                </div>
                <div class="two wide field">
                    <button type="submit" :class="'ui large primary button' + searchDisabledClass" @click.prevent="getUsers">
                        Search
                    </button>
                </div>
            </div>
        </form>
    </div>
    <div class="ui divider"></div>
    <LoadingSegment v-if="users" :isLoading="usersQueryLoading">
        <TabMenu :tabs="tabs" @selected-tab-changed="selectedTabChanged" />
        <div v-if="selectedTab === 'Raw'" class="ui padded raw text segment">
            <pre>{{ usersRaw }}</pre>
        </div>
        <div v-else-if="selectedTab === 'Parsed'" class="ui stackable two column grid">
            <div v-for="user in usersParsed" :key="user.ID" class="column">
                <div class="ui fluid parsed text card">
                    <div class="content">
                        <div class="header">{{user.FirstName}} {{user.LastName}}</div>
                        <div class="meta">{{user.Email}}</div>
                        <div class="description">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LoadingSegment>
</div>
</template>

<script>
import gql from 'graphql-tag'

import Alert from './components/Alert.vue'
import TabMenu from './components/TabMenu.vue'
import LoadingSegment from './components/LoadingSegment.vue'

export default {
    data() {
        return {
            tabs: ['Raw', 'Parsed'],
            selectedTab: '',
            usersQueryLoading: false,
            users: null,
            queryField: 'ID',
            queryValue: '1000'
        }
    },
    components: {
        Alert, TabMenu, LoadingSegment
    },
    computed: {
        usersRaw() {
            return JSON.stringify(this.users, null, 4)
        },
        usersParsed() {
            return this.users.map(user => {
                let parsedUser = {}
                for (const [key, val] of Object.entries(user)) {
                    parsedUser[key] = val.substring(val.indexOf('*') + 1)
                }
                return parsedUser
            })
        },
        canSearch() {
            return !this.usersQueryLoading && this.queryValue !== ''
        },
        searchDisabledClass() {
            return this.canSearch ? '' : ' disabled'
        }
    },
    methods: {
        setAlert(text) {
            this.$refs.alert.setAlert({
                type: 'negative',
                text: text
            })
        },
        clearAlert() {
            this.$refs.alert.clearAlert()
        },
        selectedTabChanged(tab) {
            this.selectedTab = tab
        },
        getUsers() {
            if (!this.canSearch) {
                return
            }

            this.usersQueryLoading = true
            this.$apollo.query({
                query: gql`query GetUser($val: String!) {
                    users: usersBy${this.queryField}(val: $val) {
                        ID
                        FirstName
                        LastName
                        Email
                        Street
                        City
                        Province
                        PostalCode
                        DateOfBirth
                        Gender
                        PhoneNumber
                        SIN
                        CreditCard
                    }
                }`,
                variables: {
                    val: this.queryValue
                }
            })
            .then(res => {
                this.users = res.data.users
            })
            .catch(err => {
                this.setAlert(err)
            })
            .then(() => {
                this.usersQueryLoading = false
            })
        }
    }
}
</script>

<style>
body {
    padding-top: 5rem;
}
</style>

<style scoped>
.ui.header {
    margin-bottom: 2rem;
}

.ui.raw.text.segment {
    font-weight: bolder;
    font-size: 20px;
    line-height: 30px;
}

.ui.parsed.text.card {
    font-size: larger;
}
</style>
