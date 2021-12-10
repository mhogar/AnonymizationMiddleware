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
    <LoadingSegment v-if="users" :isLoading="usersQueryLoading" id="results">
        <TabMenu :tabs="tabs" @selected-tab-changed="selectedTabChanged" />
        <div v-if="selectedTab === 'Raw'" class="ui padded raw text segment">
            <pre>{{ usersRaw }}</pre>
        </div>
        <div v-else-if="selectedTab === 'Formatted'" class="ui stackable two column grid">
            <div v-for="user in usersFormatted" :key="user.ID" class="column">
                <div class="ui fluid formatted text card">
                    <div class="content">
                        <div class="header">
                            {{scrubbedSymbol(user.FirstName, user.LastName)}}
                            {{user.FirstName.value}} {{user.LastName.value}}
                        </div>
                    </div>
                    <div class="content">
                        <div class="ui sub header">General</div>
                        <div class="description">
                            <p><b>{{scrubbedSymbol(user.Gender)}}Gender: </b>{{user.Gender.value}}</p>
                            <p><b>{{scrubbedSymbol(user.Gender)}}Date of Birth: </b>{{user.DateOfBirth.value}}</p>
                        </div>
                    </div>
                    <div class="content">
                        <div class="ui sub header">Contact</div>
                        <div class="description">
                            <p><b>{{scrubbedSymbol(user.Email)}}Email: </b>{{user.Email.value}}</p>
                            <p><b>{{scrubbedSymbol(user.PhoneNumber)}}Phone Number: </b>{{user.PhoneNumber.value}}</p>
                            <p>
                                <b>{{scrubbedSymbol(user.Street, user.City, user.Province, user.PostalCode)}}Address: </b>
                                {{user.Street.value}}, {{user.City.value}} {{user.Province.value}}, {{user.PostalCode.value}}
                            </p>
                        </div>
                    </div>
                    <div class="content">
                        <div class="ui sub header">Financial</div>
                        <div class="description">
                            <p><b>{{scrubbedSymbol(user.SIN)}}SIN: </b>{{user.SIN.value}}</p>
                            <p><b>{{scrubbedSymbol(user.CreditCard)}}Credit Card: </b>{{user.CreditCard.value}}</p>
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

import formatUser from './helpers/formatUser'

export default {
    data() {
        return {
            tabs: ['Raw', 'Formatted'],
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
        usersFormatted() {
            return this.users.map(user => formatUser(Object.assign({}, user)))
        },
        canSearch() {
            return !this.usersQueryLoading && this.queryValue !== ''
        },
        searchDisabledClass() {
            return this.canSearch ? '' : ' disabled'
        }
    },
    methods: {
        scrubbedSymbol(...fields) {
            return fields.find(field => field.scrubbed) != null ? '*' : ''
        },
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
    background-color: aliceblue;
}

.ui.formatted.text.card {
    font-size: larger;
    background-color: aliceblue;
}

#results {
    padding-bottom: 5rem;
}
</style>
