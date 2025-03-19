# MCP-Fly

MCP-Fly 是一个用于访问和渲染百度百科内容的 MCP Server。它提供了两个主要功能：

1. 通过 `request_baike` 工具获取百度百科讨论数据
2. 通过 `render_baike` 提示模板将结构化数据渲染为易读的分析内容

## 安装

```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

## 环境变量配置

复制 `.env.example` 文件并重命名为 `.env`，然后根据需要修改其中的配置。

```bash
# 百度百科API配置
BAIKE_API_BASE_URL=https://baike.baidu.com/api   # 百度百科API基础URL
BAIKE_DISCUSSION_API=/discussion/gettashuos      # 百度百科讨论API路径
DEFAULT_LEMMA_ID=65258669                        # 默认词条ID（当无法解析提供的URL时使用）
BAIKE_COOKIE=''                                  # 百度百科Cookie，用于API认证和访问限制绕过

# 应用信息
MCP_SERVER_NAME=Fly
MCP_SERVER_VERSION=1.0.0
MCP_SERVER_DESCRIPTION=百度百科内容访问和渲染服务
```

### Cookie配置说明

`BAIKE_COOKIE` 环境变量用于存储百度百科的Cookie信息，这对于获取某些受限内容或防止请求被限制非常重要。要获取Cookie：

1. 使用浏览器登录百度百科
2. 使用浏览器开发者工具(F12)，在网络请求中查看任意百科API请求的Cookie头
3. 复制完整的Cookie值，放入`.env`文件的`BAIKE_COOKIE`字段中
4. Cookie示例格式：`PSTM=1709884903; BIDUPSID=AC7D9378915FB2E7A091826DB946A7BA; ...`

注意：Cookie包含敏感信息，请勿将其提交到版本控制系统或分享给他人。

## 使用方法

### 启动服务器

```bash
npm start
```

### 开发模式

```bash
npm run dev
```

## 功能

### request_baike 工具

该工具允许获取特定百度百科词条的讨论数据。

参数：
- `url`: 百度百科URL或词条ID，例如 "https://baike.baidu.com/item/DeepSeek" 或 "65258669"

### render_baike 提示模板

该提示模板基于获取的百科讨论数据，生成一份全面的分析，包括：

1. 讨论的主要话题
2. 主要观点及其倾向
3. 热门讨论
4. 反映的社会热点或技术趋势
5. 词条主题的重要性和影响力

## 示例

```javascript
// 获取百科讨论数据
const result = await mcp.tools.request_baike({ url: "https://baike.baidu.com/item/DeepSeek" });

// 生成百科内容分析
const prompt = await mcp.prompts.render_baike({ url: "https://baike.baidu.com/item/DeepSeek" });
``` 