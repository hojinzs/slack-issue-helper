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
  projectId: string
  issueTypeId: string
  summary: string,
  description: string
}

export interface JiraProject {
  expand: string;
  self: string;
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties: Record<string, unknown>;
  entityId: string;
  uuid: string;
}

export interface JiraIssueType {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  untranslatedName: string;
  subtask: boolean;
  avatarId: number;
  hierarchyLevel: number;
  scope: {
    type: string;
    project: {
      id: string;
    };
  };
}

export interface JiraIssueCreateResult {
  id: string,
  key: string,
  self: string
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

  async getAllProjects(): Promise<JiraProject[]> {
    const projects =  await this.fetch.get('project')
    return projects.data as JiraProject[]
  }

  async getIssueTypes(): Promise<JiraIssueType[]> {
    const issueTypes =  await this.fetch.get('issuetype')
    return issueTypes.data as JiraIssueType[]
  }

  async createIssue(payload: JiraIssueCreatePayload): Promise<JiraIssueCreateResult> {
    const response = await this.fetch.post('issue', {
      fields: {
        project: { id: payload.projectId },
        issuetype: { id: payload.issueTypeId },
        summary: payload.summary,
        description: {
          content: [{
            type: "paragraph",
            content: [{
              text: payload.description,
              type: "text"
            }],
          }],
          type: "doc",
          version: 1
        },
      }
    })
    return response.data
  }

  getIssue(id: string) {
    return this.fetch.get(`issue/${id}`)
  }
}
