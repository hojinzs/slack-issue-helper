import axios, {type AxiosInstance} from "axios";

export interface JiraClientInitialize {
  token: string
  host: string
  username: string
}

export interface JiraClientHeader {
  host: string
  username: string
  token: string
}

export interface JiraIssueCreatePayload {
  project: string
  summary: string,
  description: string
  type: string
}

export class JiraClient {
  fetch: AxiosInstance = axios.create()

  configFetch(config: JiraClientHeader) {
    this.fetch = axios.create({
      baseURL: config.host + '/rest/api/3',
      auth: {
        username: config.username,
        password: config.token
      }
    })
  }

  static create(options: JiraClientInitialize) {
    const instance = new JiraClient()
    instance.configFetch(options)
    return instance
  }

  getPermissions() {
    return this.fetch.get('mypermissions', {
      params: {
        permissions: 'BROWSE_PROJECTS',
      }
    })
  }

  getAllProjects() {
    return this.fetch.get('project')
  }

  getIssueTypes() {
    return this.fetch.get('issuetype')
  }

  createIssue(payload: JiraIssueCreatePayload) {
    return this.fetch.post('issue', {
      fields: {
        project: { key: payload.project },
        summary: payload.summary,
        description: payload.description,
        issueType: { name: payload.type }
      }
    })
  }

  getIssue(id: string) {
    return this.fetch.get(`issue/${id}`)
  }
}
