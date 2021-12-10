<template>
  <div>
    <span v-if="error">{{error}}</span>
    <h3>{{ users }}</h3>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      users: '',
      queryField: 'ID',
      queryValue: '1000',
      error: null
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
        this.error = err
      }
    }
  },
}
</script>
