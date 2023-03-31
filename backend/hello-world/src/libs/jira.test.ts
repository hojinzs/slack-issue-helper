import {JiraClient} from "./jira";
import {AxiosError, isAxiosError} from "axios";

test('jira.projects', async function () {
  const jira = JiraClient.create({
    host: process.env.JIRA_HOST || "",
    token: process.env.JIRA_API_TOKEN || ""
  })

  try {
    const response = await jira.getPermissions()
    console.log("jira permissions => ", response.data)
  } catch (e) {

    if(isAxiosError(e)) {
      const error = e as AxiosError
      console.log(JSON.stringify(error.response?.data))
    } else {
      console.log(e)
    }
  }
})
