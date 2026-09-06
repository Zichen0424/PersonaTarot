# BLUE HOUR · 蓝色时刻

以女神异闻录3的蓝白视觉语言为灵感的纯前端塔罗网站。原创 SVG 牌面，React + TypeScript + Vite 实现，无需后端、账户或 API 密钥。

## 本地运行

需要 Node.js 22.12 或更新版本。

```powershell
npm ci
npm run dev
```

打开终端提示的本地地址，默认是 `http://127.0.0.1:5173/`。项目已安装依赖时，直接运行 `npm run dev` 即可。

```powershell
npm test
npm run build
npm run preview
```

- `npm test`：运行牌库、随机抽取、抽牌状态、每日结果和本地记录测试。
- `npm run build`：TypeScript 检查并生成 `dist/` 静态文件。
- `npm run preview`：预览生产构建，地址以终端输出为准。
- `npm run format`：统一整理源码格式。

不要直接双击 `dist/index.html`，请通过本地预览或静态 HTTP 服务访问。页面使用哈希路由，静态服务器无需配置路由重写，构建资源使用相对路径，可放在子目录下。

## GitHub Actions 自动部署

已提供 `.github/workflows/deploy-pages.yml`。每次推送到 `main` 分支都会安装锁定版本的依赖、运行测试、构建，然后将 `dist/` 发布到 GitHub Pages。测试或构建失败时不会执行部署。

### 首次发布

1. 在 GitHub 创建仓库，将本项目源码放在仓库根目录，使用 `main` 分支。需要包含 `.github/`、`src/`、`public/`、`package.json`、`package-lock.json`、`index.html`、`tsconfig.json` 和 `vite.config.ts`；不要上传 `node_modules/` 或 `dist/`。
2. 在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 在 **Actions** 页面选择 **Deploy to GitHub Pages → Run workflow → main → Run workflow**。以后推送代码到 `main` 会自动更新网站。
4. 等待 **Test and build**、**Publish website** 成功，在部署记录或 **Settings → Pages** 中打开网站链接。

普通项目的网址通常为 `https://你的用户名.github.io/仓库名/`。网站保留 `base: './'` 和哈希路由，因此不需要把仓库名写死到代码里，图鉴深层链接刷新也不需要额外重写规则。

### 日常更新与排查

- 使用正常 Git 提交并推送到 `main` 即可。工作流仅上传构建产物，源码与参考截图不会作为网站内容发布。
- 无需手动创建令牌或添加 Secrets，使用 GitHub 自动提供的令牌和官方 Pages Actions。
- 如果仓库使用其他发布分支，需同时修改工作流中的 `push.branches` 与部署任务的分支判断。
- 如果首次运行提示 Pages 未启用或找不到站点，请完成上面的 Source 设置，再重新运行工作流。
- 如果部署提示权限或环境限制，请检查仓库 Actions 是否启用，以及 `github-pages` 环境是否允许从 `main` 部署。
- 本地抽牌历史不会迁移到公网域名；访问者的历史仍保存在各自浏览器中。

参考：[GitHub Pages 官方工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite 静态部署说明](https://vite.dev/guide/static-deploy#github-pages)。

## 已实现

| 模式               | 牌位                                         |
| ------------------ | -------------------------------------------- |
| 每日一牌           | 今日指引                                     |
| 过去 / 现在 / 未来 | 过去影响、当前状态、未来趋势                 |
| 感情关系           | 自己、对方、关系走向                         |
| 二选一抉择         | 当前处境、A的助力、A的挑战、B的助力、B的挑战 |

- 自选22张牌背，逐张翻面；洗牌时以 Web Crypto 随机生成牌序和各50%概率的正逆位，每轮不重复。
- 22张大阿尔卡纳图鉴全部开放；大图、独立几何图案、正逆位牌义、关键词、行动建议、循环切换与可滚动列表。
- 每张牌都有四种模式对应的正逆位解读。问题仅用于记录，不发送到网络、不参与生成答案。
- 完成所有翻牌后才保存记录；最近30条保存在当前浏览器，可查看与清空。
- 每日一牌按设备本地日期保存，刷新后在“每日一牌”模式恢复当天结果；次日提供新一轮。清空历史保留当天指引，避免通过清空重复抽取。
- 切换图鉴保留当前会话的抽牌进度；切换模式重置未完成牌阵。刷新不会恢复未完成牌阵。
- 存储损坏时安全回退；无法写入存储时保留当前会话并显示提示。浏览器之间不共享记录。
- 桌面斜向布局、手机纵向结果牌阵与横向图鉴；键盘选牌、焦点提示、原生弹窗焦点管理和减少动态效果支持。
- 支持该能力的浏览器可发现两个可选 WebMCP 工具：读取当前状态与切换模式；不支持时网站功能不受影响。

## 内容与素材

- `src/data/tarot.ts`：模式配置、22张牌及完整中文牌义。
- `src/components/ArcanaSymbol.tsx`：22个原创几何图案。
- `src/components/CardArt.tsx`：统一卡框、牌背、编号和牌面展示。
- `src/lib/reading.ts`：随机洗牌、日期和抽牌状态转换。
- `src/lib/storage.ts`：带版本号的记录校验与本地持久化。
- `src/App.tsx`、`src/components/`、`src/styles.css`：页面与交互。

参考截图 `MainPage.png`、`TarotPage.png` 仅用于构图参考，不作为网页背景或牌面使用。无游戏角色素材、战斗、奖励或解锁系统。英文字体 Barlow Condensed 随构建提供，其许可见依赖包内的 OFL；中文采用系统字体。运行时不依赖外部字体网站。

解读定位为娱乐与自我探索。趋势不是确定预言，感情牌位不推断他人的真实想法，选择最终由使用者判断。

## 验证记录

已运行核心单元测试与生产构建，并在本地浏览器检查四种模式的完整抽牌流程、正逆位、图鉴循环浏览、历史查看/清空、每日刷新恢复、键盘选牌及切换图鉴保留进度。视觉检查覆盖桌面1440像素、平板820像素、手机390像素宽度。

测试代码在 `src/lib/reading.test.ts`；本地存储的不可用/损坏场景、30条上限、每日日期边界通过单元测试覆盖。
