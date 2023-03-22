import Express, { json, urlencoded } from 'express'

const app = Express()

app.use(json())
app.use(urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res
    .status(200)
    .send('hello-world')
})

export default app
