export interface SlackMessage {
  ts: string;
  element: any;
}

export function chatMessageReducer(json: string) {
  const messages: SlackMessage[] = [];
  const data = JSON.parse(json);

  for (const block of data.blocks) {
    if (block.type === "rich_text") {
      for (const element of block.elements) {
        if (element.type === "user" || element.type === "channel") {
          continue;
        }

        const message: SlackMessage = {
          ts: data.ts,
          element: element
        };

        messages.push(message);
      }
    }
  }

  console.log(messages);

  return messages;
}

/*

  export function processingTextData(ListOfSlackMessage: SlackMessage[]): string[] {

    let word = '';
    const stringGroups = [];
    let group = ""; 

    for(const block of ListOfSlackMessage){

        word = block.split(/\s+/);




    }

   
   
  }

  export function CreateQuestionGroup(str: string): string[] {

    const questionGroup = [];
    let tempStr = "";

    
    for (let numberOfword = 0; numberOfword < str.length; numberOfword++) {
        if (numberOfword > 0 && numberOfword % 4000 === 0) {
            questionGroup.push(tempStr.trim());
            tempStr = "";
        }

        tempStr += " " + str[numberOfword];
      }
      
      if (tempStr.length > 0) {
        questionGroup.push(tempStr.trim());
      }   
    

    return questionGroup;

}

*/