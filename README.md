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

## 六种牌阵

| 菜单                     | 中文名            | 张数 | 牌位                         |
| ------------------------ | ----------------- | ---- | ---------------------------- |
| THE FLOW                 | 时间之流          | 3    | 过去、现在、未来             |
| THE GUN                  | 铳与手            | 4    | 行动、方式、目标、反应       |
| THE CREPE                | 饼与馅            | 4    | 表象、内情、感触、余存       |
| THE GATE                 | 此与彼            | 4    | 彼在、此在、通行、开启       |
| THE HALO                 | 本真之环          | 5    | 输出、输入、处理、内核、记忆 |
| DAILY READING / THE COIN | 日常占卜 · 正与反 | 2    | 所得、所失                   |

菜单与牌位参考用户提供的 `sample.mp4`，并对照[“今日答案！”活动资料](https://wiki.biligame.com/arknights/月行水上/今日答案！)核对；所有牌阵直接开放，不加入战斗、奖励或解锁系统。牌面为原创 SVG，解释与行动建议为本项目编写的本地文本。

- 从22张牌背自选，逐张揭晓；Web Crypto 生成不重复牌序，正逆位各50%概率。
- 22张大阿尔卡纳共用牌库；图鉴支持正逆位牌义、循环切牌、可滚动列表。
- 每张牌包含六种模式的正逆位解读，配合牌位提问和总结。问题仅用于个人记录，不发送到网络、不参与生成答案。
- 全部翻开后保存最近30条完成记录。未完成牌阵不持久化；切换图鉴保留当前会话的抽牌进度。
- 日常占卜每天保存同一组两张牌。按设备本地日期判断，刷新或清空历史不会重新抽取当天指引。
- **旧记录兼容**：保留旧版四种模式的牌数、名称和解读；历史可继续查看。如果当天已保存旧版每日一牌，仍显示当天原来的那张牌，次日起使用两张“正与反”。不补抽或删除既有结果。
- 存储损坏安全回退；存储不可用仍能完成当前抽牌。浏览器间不共享记录。
- 桌面大字斜向菜单；手机使用横向菜单和纵向结果牌阵。支持键盘选牌、焦点提示和原生弹窗焦点管理。
- 可选 WebMCP 工具支持读取当前状态与切换六种模式；不支持该能力的浏览器照常使用。

## 背景与圆形波纹

按用户提供的素材实现两组静态场景：

- THE FLOW / GUN / CREPE / GATE / HALO：`Samples/emptybackground1.jpg`。
- DAILY READING：`Samples/emptybackground2.jpg`。
- 两张原图复制到 `public/assets/`，没有修改图像内容。运行时不依赖第三方素材站点。
- THE 系列内部切换保持背景静止，仅播放约半秒的牌背翻至牌面动画；快速切换以最后选择为准，暂停动效或偏好减少动态时直接展示。进入/离开图鉴不播放页面转场。
- 底栏固定在视口底部，按实际高度自动预留空间，四张牌模式和手机换行时均不会消失或遮住页面末尾。
- 只有 THE 与 DAILY 相互切换时，参考 `Samples/Transition.mp4` 播放约 **2.2秒** 的圆形扩散：新背景从中央逐步展开，三层淡色圆环模拟波纹边缘。两个方向均向外展开。
- 两张图预加载，圆形半径按容器尺寸覆盖最远角落。快速反向切换立即收敛到最后一次选择，离开页面取消未完成转场。
- 顶部动效开关和系统 `prefers-reduced-motion` 可关闭动画。卡牌翻面、悬浮和图鉴内部切牌仍有轻量反馈。
- 已移除之前的沉水视频、全屏斜切遮罩和视频资源。用户参考视频只用于分析，不包含在发布内容中。

素材说明见 [public/assets/CREDITS.md](public/assets/CREDITS.md)。英文字体 Barlow Condensed 随构建提供，许可见依赖包内的 OFL；中文采用系统字体。

## 源码位置

- `src/data/tarot.ts`：六种牌阵、旧模式兼容、22张牌及中文牌义。
- `src/components/ArcanaSymbol.tsx`、`CardArt.tsx`：原创几何图案、统一卡框、牌背。
- `src/components/SceneBackground.tsx`：两组背景、资源预加载、圆形波纹与转场取消。
- `src/styles.css`、`src/motion.css`、`src/scene.css`：基础布局、卡牌动效与双场景/菜单样式。
- `src/lib/reading.ts`、`storage.ts`：抽牌状态转换、每日日期、记录校验与持久化。

## 验证

`npm test` 覆盖六种牌阵的牌数、牌位、完整解读、无重复抽牌、正逆位、状态边界、30条记录上限、每日日期、存储损坏以及旧记录兼容。生产构建执行 TypeScript 检查。

浏览器检查覆盖桌面、平板、手机的六项菜单与牌阵布局、完整抽牌、每日恢复、图鉴切换、双向波纹、连续快速切换、关闭动效及无动画进入图鉴。

所有解读仅供娱乐与自我探索，不是确定的预言，也无法揭示他人的真实想法。
