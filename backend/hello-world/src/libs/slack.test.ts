import {slackWeb} from "./slack";

test('slack.test', async function () {


  const result = await slackWeb.chat.postMessage({
    text: 'TEST MESSAGE',
    channel: 'C0501V9ALP6'
  })

  console.log("result => ", result)

})
