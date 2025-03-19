#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BaikeClient } from "./baike-client.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env 环境变量
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 创建百科客户端
const baikeClient = new BaikeClient();

// 创建 MCP 服务器
const server = new McpServer({
  name: process.env.MCP_SERVER_NAME || "Fly",
  version: process.env.MCP_SERVER_VERSION || "1.0.0",
  description: process.env.MCP_SERVER_DESCRIPTION || "百度百科内容访问和渲染服务"
});

// 添加百科讨论获取工具
server.tool(
  "request_baike",
  { url: z.string().describe("百度百科URL，例如：https://baike.baidu.com/item/DeepSeek") },
  async ({ url }: { url: string }) => {
    try {
      const discussions = await baikeClient.getDiscussions(url);
      
      return {
        content: [
          { 
            type: "text", 
            text: JSON.stringify(discussions, null, 2)
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "获取百科讨论时发生未知错误";
      
      return {
        content: [{ type: "text", text: errorMessage }],
        isError: true
      };
    }
  }
);

// 添加百科内容渲染提示模板
server.prompt(
  "render_baike_to_html",
  { url: z.string().describe("百度百科URL或词条ID") },
  async ({ url }: { url: string }) => {
    try {
      const discussions = await baikeClient.getDiscussions(url);
      
      // 提取讨论信息
      const discussionSummaries = discussions.data.map(item => {
        // 格式化时间戳为可读日期
        const createDate = new Date(item.createTime * 1000).toLocaleString();
        
        // 提取图片URL
        const imageUrls = item.content.pics.map(pic => pic.imgUrl).join("\n");
        
        return {
          title: item.title,
          author: item.authorName,
          date: createDate,
          content: item.content.text,
          summary: item.content.summary,
          imageUrls: imageUrls,
          likes: item.starNum
        };
      });
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `
<CURRENT_CURSOR_POSITION>
请将以下百度百科讨论数据渲染成一个精美的HTML页面，以便在网页中展示。

讨论数据：
${JSON.stringify(discussionSummaries, null, 2)}

页面标题：
“CVTE”的文字，并进行文字美化

HTML页面要求：
1. 使用现代化的响应式设计，兼容移动端和桌面端
2. 包含一个美观的标题和简介部分
3. 将每个讨论项以卡片形式展示，包括标题、作者、日期、内容、点赞数
4. 如果有图片，请将其优雅地集成到对应的讨论卡片中
5. 添加适当的CSS样式，确保页面美观大方
6. 可以使用Bootstrap或其他CSS框架的样式
7. 添加简单的交互元素，如可折叠的内容区域

请直接返回完整的HTML代码，包括<!DOCTYPE html>、<head>和所有必要的CSS样式。确保代码整洁且语法正确，可以直接在浏览器中运行。
`
            }
          }
        ]
      };
    } catch (error) {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `我尝试分析百度百科内容时遇到了错误：
              ${error instanceof Error ? error.message : "未知错误"}`
            }
          }
        ]
      };
    }
  }
);

// 启动服务器
async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
start(); 