import {chatCompletion} from "./openAi";

test('openAi.chatCompletion.test', async function () {

  const response = await chatCompletion({
    request: '주제 요약',
    chat: [
      { speeches: 'A', message: 'GPT를 도입하자'},
      { speeches: 'B', message: 'HELLO WORLD!'},
      { speeches: 'C', message: 'GPT는 좋은 인공지능 모델이에요. 빠르게 서비스에 적용할 수 있을거에요.'},
      { speeches: 'D', message: '좋아요. 빠르게 도입해보죠'},
    ]
  })
  console.log("response => ", JSON.stringify(response))
})
