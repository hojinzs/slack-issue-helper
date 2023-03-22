import app from './app'
import { getPort } from 'get-port-please'

void getPort({ port: 3000 })
  .then(port => {
    const listener = app
      .listen(port, () => {
        const address = listener.address()
        if (address !== null && typeof address !== 'string') {
          console.log(`server http://localhost:${address.port} listen!`)
        }
      })
      .on('request', (req, res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`${req.method} ${req.url} > ${res.statusCode}`)
      })
      .on('error', (err) => {
        console.log('on error')
        console.error(err.stack)
      })
  })
