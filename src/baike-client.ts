import axios from "axios";

// 百度百科讨论响应类型
export interface BaikeDiscussionResponse {
  errno: number;
  errmsg: string;
  serviceStatus: number;
  data: BaikeDiscussionItem[];
}

// 百科讨论项
export interface BaikeDiscussionItem {
  issueId: number;
  title: string;
  content: {
    text: string;
    pics: {
      picId: number;
      width: number;
      height: number;
      picSrc: string;
      type: string;
      oriWidth: number;
      oriHeight: number;
      oriImgUrl: string;
      imgUrl: string;
      shareImgUrl: string;
    }[];
    struct: any[];
    more: number;
    summary: string;
  };
  uid: number;
  uname: string;
  category: number;
  entityType: number;
  referType: number;
  referId: string;
  status: number;
  progress: number;
  level: number;
  hotFlag: number;
  createTime: number;
  updateTime: number;
  closeTime: number;
  score: number;
  replyNum: number;
  starNum: number;
  extFlag: number;
  extData: {
    versionInfo: {
      lemmaId: number;
      versionId: number;
      lemmaTitle: string;
      lemmaDesc: string;
      isLatest: number;
    }[];
    relateInfo: {
      relateId: number;
      relateType: number;
    }[];
    isHelpEdit: number;
    isWap: number;
    isSapp: number;
    isAnonymous: number;
    BjhInfo?: {
      name: string;
      wishes: string;
      avatar: string;
      v_intro: string;
      appId: number;
      v_type: number;
      type: string;
      status: number;
      uk: string;
    };
    authorInfo?: {
      authorId: number;
      name: string;
      nameDesc: string;
      pic: string;
      level: string;
      classify: string;
      userId: number;
      tashuoCnt: number;
    };
    isDigest: number;
  };
  priority: number;
  portrait: string;
  displayname: string;
  authorName: string;
  uk: string;
  contributeFlags: any[];
  referData: {
    jumpData: {
      jumpType: string;
      iosScheme: string;
      androidScheme: string;
      jumpUrl: string;
      appKey: string;
      path: string;
      isDetail: string;
    };
  };
  bjhInfo?: {
    name: string;
    wishes: string;
    avatar: string;
    v_intro: string;
    appId: number;
    v_type: number;
    type: string;
    status: number;
    uk: string;
  };
  bdappUk: string;
}

export class BaikeClient {
  private readonly apiBaseUrl: string;
  private readonly discussionApiPath: string;
  private readonly defaultLemmaId: string;
  private readonly cookie: string;

  constructor() {
    this.apiBaseUrl = process.env.BAIKE_API_BASE_URL || "https://baike.baidu.com/api";
    this.discussionApiPath = process.env.BAIKE_DISCUSSION_API || "/discussion/gettashuos";
    this.defaultLemmaId = process.env.DEFAULT_LEMMA_ID || "65258669";
    this.cookie = process.env.BAIKE_COOKIE || "";
  }

  /**
   * 解析百科URL或词条ID
   */
  private parseLemmaIdOrUrl(lemmaIdOrUrl: string): string {
    // 如果是URL，尝试从URL中提取lemmaId
    if (lemmaIdOrUrl.startsWith("http")) {
      try {
        // 尝试从URL中查找lemmaId参数
        const url = new URL(lemmaIdOrUrl);
        const lemmaId = url.searchParams.get("lemmaId");
        if (lemmaId) {
          return lemmaId;
        }
        
        // 如果URL中没有lemmaId参数，尝试从路径中提取
        const pathParts = url.pathname.split("/").filter(part => part.length > 0);
        for (const part of pathParts) {
          // 检查是否为纯数字
          if (/^\d+$/.test(part)) {
            return part;
          }
        }
      } catch (error) {
        // URL解析失败，回退到使用默认lemmaId
      }
    } else if (/^\d+$/.test(lemmaIdOrUrl)) {
      // 如果输入是纯数字，直接作为lemmaId使用
      return lemmaIdOrUrl;
    }
    
    // 如果无法解析，使用默认的lemmaId
    return this.defaultLemmaId;
  }

  /**
   * 获取百度百科讨论内容
   */
  async getDiscussions(lemmaIdOrUrl: string): Promise<BaikeDiscussionResponse> {
    const lemmaId = this.parseLemmaIdOrUrl(lemmaIdOrUrl);
    
    try {
      const response = await axios.get<BaikeDiscussionResponse>(
        `${this.apiBaseUrl}${this.discussionApiPath}?lemmaId=${lemmaId}`,
        {
          headers: {
            "Content-Type": "application/json",
            cookie: this.cookie,
          },
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`百度百科API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
} 