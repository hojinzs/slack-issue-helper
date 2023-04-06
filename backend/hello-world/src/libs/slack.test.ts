import {slackWeb} from "./slack";

test('slack.test', async function () {


  const result = await slackWeb.chat.postMessage({
    text: 'TEST MESSAGE',
    channel: 'C0501V9ALP6'
  })

  console.log("result => ", result)

})


test('slack.chat.', async function () {

  const conversations = await slackWeb.conversations.replies({
    ts: '1680410948.295059',
    channel: 'C04V9ANGR5Z'
  })

  console.log(JSON.stringify(conversations))

})
