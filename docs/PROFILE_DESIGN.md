# 个人主页视觉资源

这个仓库是 GitHub Profile README，不是 Vue 网站。主视觉用原创、独立的 SVG 图片实现，直接提交到仓库即可随 README 展示。

## 构建

需要 Node.js 18 或更新版本。构建工具只使用 Node.js 标准库，无需安装依赖。

```sh
npm run build
```

构建入口是 `scripts/build-assets.mjs`，输出到 `assets/`。修改配色、文字或动画后，重新构建并一起提交生成的 SVG 文件。

## 视觉内容

- `hero.svg`：深空粒子、双层旋转刻度、交叉椭圆光轨、发光猫、文字扫光。
- `vibe-git.svg`：人类意图到三个 Agent 的能量流、节点呼吸、中心旋转环和反馈路径。
- `divider.svg`：流动光点与几何分隔线。
- `footer.svg`：星光与曲线组成的收尾区域。
- `*-mobile.svg`：窄屏专用构图；README 的 `<picture>` 在视口宽度不超过 640px 时选择。

所有资源采用深色底、薄荷绿与银白色，无外部字体、JavaScript、`foreignObject` 或图片依赖。文字和关键图形在动画关闭时仍然可见，CSS 支持 `prefers-reduced-motion`。

GitHub README 的展示以图片为单位，动画不会响应鼠标。SVG 内部的 CSS 动画负责循环特效；项目入口通过 README 外层链接跳转。

## 动态数据

统计卡片、语言分布、技术栈图标、访问量和贡献曲线沿用外部图片服务。主视觉和协作图由仓库本地资源提供。

贪吃蛇由 `.github/workflows/snake.yml` 每 12 小时生成一次，也可在 Actions 中手动运行。推送该工作流到 `main` 会触发首次生成，输出发布到 `output` 分支；README 根据深浅色模式选择对应图片。

上游参考：[GitHub 工作流目录说明](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows)、[Platane/snk SVG 配色与输出配置](https://github.com/Platane/snk#usage)。
