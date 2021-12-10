<template>
<div class="ui container">
    <Alert ref="alert" />
    <TabMenu :tabs="tabs" @selected-tab-changed="selectedTabChanged" />
    <div v-if="selectedTab === 'Raw'" class="ui padded raw text segment">
        <pre>{{ usersRaw }}</pre>
    </div>
    <div v-else class="ui stackable two column grid">
        <div class="column">
            <div  class="ui fluid parsed text card">
                <div class="content">
                    <div class="header">{{trimStar(users.FirstName)}} {{trimStar(users.LastName)}}</div>
                    <div class="meta">{{trimStar(users.Email)}}</div>
                    <div class="description">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import gql from 'graphql-tag'
import Alert from './components/Alert.vue'
import TabMenu from './components/TabMenu.vue'

export default {
    data() {
        return {
            tabs: ['Raw', 'Parsed'],
            selectedTab: '',
            users: '',
            queryField: 'ID',
            queryValue: '1000'
        }
    },
    components: {
        Alert, TabMenu
    },
    computed: {
        usersRaw() {
            return JSON.stringify(this.users, null, 4)
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
        trimStar(str) {
            return str.substring(str.indexOf('*') + 1)
        }
     },
    apollo: {
        users: {
            query() {
                return gql`query GetUser($val: String!) {
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
                }`
            },
            variables() {
                return {
                    val: this.queryValue
                }
            },
            error(err) {
                this.setAlert(err)
            }
        }
    }
}
</script>

<style scoped>
.ui.raw.text.segment {
    font-weight: bolder;
    font-size: 20px;
    line-height: 30px;
}

.ui.parsed.text.card {
    font-size: larger;
}
</style>
