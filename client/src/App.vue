<template>
<div class="ui container">
    <h1 class="ui center aligned header">
        User Database Search
        <div class="sub header">Privacy by Design Demo</div>
    </h1>
    <LoadingSegment :isLoading="privacyLevelLoading">
        <form class="ui large form">
            <div class="field">
                <label>Privacy Clearance Level</label>
                <select @change="updatePrivacyLevel" v-model="privacyLevel">
                    <option v-for="index in 6" :key="index" :value="index-1">Level {{index-1}}</option>
                </select>
            </div>
        </form>
    </LoadingSegment>
    <div class="ui basic segment">
        <form class="ui large form">
            <div class="fields">
                <div class="four wide field">
                    <label>Field</label>
                    <select v-model="queryField">
                        <option value="ID">ID</option>
                        <option value="FirstName">First Name</option>
                        <option value="LastName">Last Name</option>
                        <option value="Email">Email</option>
                        <option value="Street">Street</option>
                        <option value="City">City</option>
                        <option value="Province">Province</option>
                        <option value="PostalCode">Postal Code</option>
                        <option value="DateOfBirth">Date of Birth</option>
                        <option value="Gender">Gender</option>
                        <option value="PhoneNumber">Phone Number</option>
                        <option value="SIN">SIN</option>
                        <option value="CreditCard">Credit Card</option>
                    </select>
                </div>
                <div class="twelve wide field">
                    <label>Value</label>
                    <input type="text" v-model="queryValue">
                </div>
            </div>
            <button type="submit" :class="'ui primary button' + searchDisabledClass" @click.prevent="getUsers">
                Search
            </button>
        </form>
    </div>
    <Alert ref="alert" />
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
            privacyLevelLoading: false,
            privacyLevel: 0,
            usersQueryLoading: false,
            users: null,
            queryField: 'ID',
            queryValue: '1000'
        }
    },
    components: {
        Alert, TabMenu, LoadingSegment
    },
    mounted() {
        this.getPrivacyLevel()
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
        getPrivacyLevel() {
            this.privacyLevelLoading = true
            this.$apollo.query({
                query: gql`
                    query GetPrivacyLevel {
                        level: getPrivacyLevel
                    }
                `
            })
            .then(res => {
                this.privacyLevel = res.data.level
            })
            .then(() => {
                this.privacyLevelLoading = false
            })
        },
        updatePrivacyLevel() {
            this.privacyLevelLoading = true
            this.$apollo.mutate({
                mutation: gql`
                    mutation SetPrivacyLevel($level: Int!) {
                        setPrivacyLevel(level: $level)
                    }
                `,
                variables: {
                    level: parseInt(this.privacyLevel)
                }
            })
            .then(() => {})
            .then(() => {
                this.privacyLevelLoading = false
            })
        },
        getUsers() {
            if (!this.canSearch) {
                return
            }

            this.clearAlert()
            this.usersQueryLoading = true

            this.$apollo.query({
                query: gql`
                    query GetUser($val: String!) {
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
                    }
                `,
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
.ui.form {
    padding-bottom: 3rem;
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
