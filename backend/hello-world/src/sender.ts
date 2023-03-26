import app from './app'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverlessExpress = require('@vendia/serverless-express')
const server = serverlessExpress({ app })

export {
  server
}
