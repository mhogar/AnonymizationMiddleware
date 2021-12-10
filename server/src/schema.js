const { privacyLogic } = require('./logic')
const schemas = require('./schemas.json')

let queryTypeDefs = ''
let queryResolvers = {
    getPrivacyLevel: (_, {}, ctx) => ctx.privacyLevel
}

let userTypeDefs = ''
let userResolvers = {}

for (const [key, schema] of Object.entries(schemas)) {
    const queryKey = `usersBy${key}`
    queryTypeDefs += `${queryKey}(val: String!): [User]\n`
    queryResolvers[queryKey] = (_, { val }, ctx) => {
        if (ctx.privacyLevel < schema.privacyLevel) {
            throw Error(`Insufficient privacy clearance for query (min required ${schema.privacyLevel})`)
        }
        return ctx.users.filter((user) => user[key] === val)
    }

    userTypeDefs += `${key}: String\n`
    userResolvers[key] = (obj, {}, ctx) => {
        return privacyLogic.getString(ctx.privacyLevel, obj[key], schema.privacyLevel, schema.format)
    }
}

module.exports = {
    typeDefs: `
        type Query {
            getPrivacyLevel: Int
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
                console.log('Privacy Level Set:', level)
                ctx.privacyLevel = level
                return level
            }
        },
        User: userResolvers
    }
}
