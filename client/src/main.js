import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'
import { createApolloProvider } from '@vue/apollo-option'
import { createApp } from 'vue'
import App from './App.vue'

const httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: 'http://localhost:4000',
})
  
const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    connectToDevTools: true,
})
  
const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
})

const app = createApp(App)
app.use(apolloProvider)
app.mount('#app')
