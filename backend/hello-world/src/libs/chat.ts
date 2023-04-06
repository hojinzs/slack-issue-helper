import { ChatRow } from "./openAi";

interface Message {
  text: string;
  user: string;
}

/* Slack Message에서 user정보와 그 user가 했던 말에 대한 정보 추출*/
function extractUserAndTextFromMessage(inputData: any): Message[] {
  const messages: Message[] = [];
  inputData.messages.forEach((message: any) => {
    if (message.text && message.user) {
      messages.push({
        text: message.text,
        user: message.user,
      });
    }
  });
  return messages;
}


/* 대화를 한 전체 메세지가 4000자(chatGPT 3.5가 현재 처리할 수 있는 최대 크기는 4096 token임)가 넘어갈 경우에 에러메세지 출력,
초과하지 않는 경우에는 ChatRow[]로 리턴하여 OpenAI에 chat 항목의 데이터를 채울 수 있게 하는 함수 */

export function ProcessChatMessage(inputData : any)  {

  const messageArray: Message[] = extractUserAndTextFromMessage(inputData);
  let totalMessageSize: number = 0;
  let returnData: ChatRow[] = [];
  let IsOkayData: boolean = true;
    
  for(let userData of messageArray){

    totalMessageSize += userData.text.length;

    if(totalMessageSize > 4000){ //Slack Message에서 추출한 사용자 메세지가 총 4000자를 초과하는지 확인

      IsOkayData = false;
      break;

    }

    let chatGPTInputData:ChatRow = {speeches: userData.user, message: userData.text};

    returnData.push(chatGPTInputData);
  
  }

  if(IsOkayData){

    console.log(returnData);
    return returnData;

  } else{

    console.log("chatGPT 질문 허용가능 범위 초과");
    console.error("chatGPT 질문 허용가능 범위 초과");  
  
  }
}