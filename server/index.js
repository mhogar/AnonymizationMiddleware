const { GraphQLServer } = require('graphql-yoga')
const { typeDefs, resolvers } = require('./src/schema')
const users = require('./data/users.json')

const server = new GraphQLServer({
    typeDefs: typeDefs,
    resolvers,
    context: {
        users,
        privacyLevel: 3
    }
})

const port = 4000
server.start(port, () => console.log(`Running on port ${port}...`))
