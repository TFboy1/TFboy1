# 个人主页视觉资源

这个仓库是 GitHub Profile README。主视觉、作品插画、贡献曲线和贡献贪吃蛇均由仓库里的代码生成，随 README 一起提交。

## 构建与数据刷新

需要 Node.js 18 或更新版本。只使用 Node.js 标准库，无需安装依赖。

```sh
# 联网读取 GitHub 的真实贡献日历，保存数据快照
npm run refresh

# 离线生成 SVG，并更新 README 的作品展示区
npm run build

# 验证贡献数据处理逻辑
npm run test:data
```

`build` 使用已提交的数据，不请求远程图片服务。网络刷新失败时，不会用零值或虚构数据覆盖已有快照。

## 内容来源

- `data/projects.json`：个人网站的 13 个作品，加上 GitHub 上的 Vibe-Git、DSHcraft、ChatGPT-Share-Gate 和 MITI，共 17 个项目。
- 每个项目保存实际介绍、标签、来源和已有的源码、预览或下载入口。ClipFlow 标记为“正在打磨”，不虚构试玩或仓库链接。
- Vibe-Git 按当前项目说明介绍“提案 → 对齐 → 任务 → 变更审核”；移除了旧版自拟的三个 Agent 分工示意图。
- `data/github-contributions.json`：GitHub 公开贡献日历的日期、真实次数、颜色级别及同步时间。次数取自 GitHub 原始文字提示，不从颜色等级推测。

来源：[TFBOY 之家的作品册](https://tfboyhomepage.netlify.app/)、[TFboy1 的 GitHub](https://github.com/TFboy1)、[Vibe-Git 项目说明](https://github.com/TFboy1/vibe-git)。

## 生成文件

- `assets/hero*.svg`、`assets/footer*.svg`：深空粒子、旋转星环、发光猫和文字光效，包含手机端构图。
- `assets/projects/*.svg`：每个实际作品的原创动态插画。
- `assets/contribution-activity*.svg`：最近 31 天的真实贡献曲线，包含手机端构图与同步时间。
- `assets/github-contribution-grid-snake*.svg`：真实贡献格子上的原创光蛇巡游；兼容 GitHub 的深浅色主题。
- `assets/divider.svg`：流动光点分隔线。

图像没有外部字体、JavaScript、`foreignObject` 或远程图片依赖。动画通过 SVG 内部 CSS 实现，支持 `prefers-reduced-motion`。

修改 `data/projects.json` 后运行 `npm run build`。README 中 `PROJECTS:START` / `PROJECTS:END` 之间的内容会自动更新；其他内容保留。标题、描述和跳转链接使用可读 HTML，SVG 插画之外也保留项目信息。

## 自动更新

`.github/workflows/snake.yml` 保留原先每 12 小时执行一次的调度，现同时刷新贡献数据、贡献曲线、贪吃蛇和作品资源，也支持 Actions 手动运行。

工作流将生成的 `assets/`、贡献数据快照和 README 提交到 `main`。图片用仓库相对路径展示，不再等待 `output` 分支首次生成。工作流使用 `contents: write` 权限；如仓库设置禁止 Actions 提交或主分支受保护，提交步骤会失败，但已提交的图片仍可展示。

访问量徽章、技术图标及 GitHub 统计卡片仍使用原有公开图片服务。

## 本次图片问题

排查时，旧活动曲线服务返回 `HTTP 402 / DEPLOYMENT_DISABLED`。这张图已替换为本仓库生成的 SVG。

旧贪吃蛇工作流已成功，两个远程 SVG 当时均返回 HTTP 200；无法仅凭当前响应确认此前的显示失败原因。本次用同一份真实贡献数据在本仓库生成图片，取消对远程 `output` 路径的依赖。

工作流参考：[GitHub Token 权限](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)、[Actions Checkout 提交示例](https://github.com/actions/checkout#push-a-commit-using-the-built-in-token)。
