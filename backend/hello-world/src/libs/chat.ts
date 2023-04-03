import { ChatRow } from "./openAi";

function extractTextFromBlocks(data: any) {
  const messages = data.messages;
  const textArray: string[] = [];

  messages.forEach((message: any) => {
    if (message.blocks) {
      message.blocks.forEach((block: any) => {
        if (block.elements) {
          block.elements.forEach((element: any) => {
            if (element.elements) {
              element.elements.forEach((innerElement: any) => {
                if (innerElement.text) {
                  textArray.push(innerElement.text);
                }
              });
            }
          });
        }
      });
    }
  });

  return textArray;
}


export function ProcessChatMessage(data : any) {

  const textArray: string[] = extractTextFromBlocks(data);
  let questionData: string = "";
  let returnData: ChatRow[] = [{speeches: "", message: ""}];
  let label: number = 1;
  
  for(let checkingData in textArray){

    if(checkingData.length > 10000){

      continue;

    }

    let inputData:ChatRow = {speeches: label.toString(), message: checkingData};

    label++;

    returnData.push(inputData);
  
  }

  console.log(returnData);
  
  return returnData;

}