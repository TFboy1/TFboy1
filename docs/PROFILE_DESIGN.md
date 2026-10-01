# TFBOY 个人主页视觉资源

这是 GitHub Profile README 仓库。页面采用文字项目目录及两个自包含 SVG 展示位：五彩草书与抽卡流星头图、真实贡献贪吃蛇。

## 构建与数据刷新

需要 Node.js 18 或更新版本。只使用 Node.js 标准库，无需安装依赖。

```sh
# 联网读取真实 GitHub 贡献日历，保存数据快照
npm run refresh

# 离线生成四个 SVG 文件，并更新 README 的项目目录
npm run build

# 验证贡献数据处理逻辑
npm run test:data
```

全部文本与 SVG 使用 UTF-8。构建不请求远程图片服务；数据刷新失败时，不会用零值或虚构数据覆盖已有快照。

## 头图设计

- 桌面 1120×380，移动端单独采用 600×430 的构图。
- TFBOY 为自绘大写连笔草书轮廓路径；五色颜料沿笔触渐变，保留收笔、粗细变化、飞白及少量颜料飞溅，不依赖书法字体文件。
- 12 秒循环：0–2 秒流星由青蓝转为金色；2–5 秒金辉展开并按 T→F→B→O→Y 书写；5–11 秒展示完整字标与星芒；11–12 秒淡出衔接。
- 使用 SVG 遮罩、渐变、路径和内部 CSS 动画，无 JavaScript、foreignObject、外部图片或远程字体。
- prefers-reduced-motion 下直接显示完整草书，隐藏流星、金光展开与星芒动效。

## 项目目录

项目事实、原有源码／试玩／下载链接及来源保存在 data/projects.json。17 个作品来自个人网站与实际 GitHub 项目，ClipFlow 保留“正在打磨”状态。

pinnedOrder 是已有项目 ID 的有序数组。本次按 GitHub 当前置顶顺序配置：

1. academic-paper-writer-skills → academic-paper-writer
2. chatgpt-share-gate → ChatGPT-Share-Gate
3. oh-my-minimaxh3-director
4. dsh-minecraft-ui
5. vibe-git

这五个项目紧接头图展示，以仓库名称作为标题。其余 12 个作品按游戏、应用分类放入默认折叠的文字目录，置顶项目不重复出现。所有原有入口继续保留。

修改作品或置顶配置后运行 npm run build。PROJECTS:START / PROJECTS:END 标记之间的目录自动更新，标记之外的个人介绍等内容保留。配置的置顶顺序为本次快照，之后调整 GitHub 置顶时需相应更新 pinnedOrder。

来源：[TFBOY 之家的作品册](https://tfboyhomepage.netlify.app/)、[TFboy1 的 GitHub](https://github.com/TFboy1)。

## 贡献贪吃蛇与资源预算

贡献数据保存在 data/github-contributions.json，次数取自 GitHub 原始文字提示，不由颜色等级推测。蓝色明暗表示真实贡献等级，四芒星蛇头与金色尾迹沿日历巡游；保留日期、次数、总数与北京时间同步时间。浅色、深色主题使用各自的蓝色分级。

减少动态效果时隐藏蛇头与尾迹，保留静态贡献日历及真实等级颜色。

构建只生成四个资源：

- assets/hero.svg
- assets/hero-mobile.svg
- assets/github-contribution-grid-snake.svg
- assets/github-contribution-grid-snake-dark.svg

README 有两个 img 元素，每个 picture 按屏幕或主题选择一个版本。构建检查桌面头图加上较大的贪吃蛇版本，合计必须不超过 100 KiB；超出时在写入资源前报错。文件体积是资源预算，并非实际页面加载耗时。

旧项目插画、贡献曲线、页尾和分隔线的已知生成文件会被清理；其他文件保留。导航、技术栈和项目目录全部使用文字，不请求徽章或统计图片服务。

## 自动更新与验收

.github/workflows/snake.yml 每 12 小时刷新真实贡献日历、执行构建并提交资源与 README，也支持手动运行。保留原有数据处理测试与失败处理。

实施验收运行 npm run build、npm run test:data，并静态检查图片展示位数量、文件体积、置顶顺序、目录完整性及链接保留情况。最终视觉由用户检查，不进行浏览器或截图验证。
