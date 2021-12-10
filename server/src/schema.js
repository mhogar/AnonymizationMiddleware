const { privacyLogic } = require('./logic')
const schemas = require('./schemas.json')

let queryTypeDefs = ''
let queryResolvers = {}

let userTypeDefs = ''
let userResolvers = {}

for (const [key, schema] of Object.entries(schemas)) {
    const queryKey = `usersBy${key}`
    queryTypeDefs += `${queryKey}(val: String!): User\n`
    queryResolvers[queryKey] = (_, { val }, ctx) => {
        if (ctx.privacyLevel < schema.privacyLevel) {
            throw Error("Insufficient privacy level for query.")
        }
        return ctx.users.find((user) => user[key] === val)
    }

    userTypeDefs += `${key}: String\n`
    userResolvers[key] = (obj, _, ctx) => {
        return privacyLogic.getString(ctx.privacyLevel, obj[key], schema.privacyLevel, schema.format)
    }
}

module.exports = {
    typeDefs: `
        type Query {
            ${queryTypeDefs}
        }
        
        type Mutation {
            setPrivacyLevel(level: Int!): Int
        }
        
        type User {
            ${userTypeDefs}
        }
    `,
    resolvers: {
        Query: queryResolvers,
        Mutation: {
            setPrivacyLevel(_, { level }, ctx) {
                ctx.privacyLevel = level
                return level
            }
        },
        User: userResolvers
    }
}
