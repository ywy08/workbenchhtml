# 🌿 日常工作台 PWA

移动端日常工作台应用，将所有日常任务管理、创作灵感、学习计划整合到一个原生体验的 PWA 中。

## ✨ 功能模块

1. **每日计划** - 任务清单，勾选完成自动生成进度条，支持从其他模块拉取计划，查看历史计划完成情况
2. **选题灵感** - 每日 10 条选题灵感，一键唤起抖音/B站
3. **爆款二创** - 聚合热点素材，输出视频二创方向，展示每日热榜
4. **创作打卡** - 文案模板管理，AI 生成适配抖音发布的文案
5. **每日前端** - 前端资讯聚合，AI 个性化学习计划，自定义学习计划
6. **每日锻炼** - 古法健身操、眼保健操，AI 智能推荐锻炼素材
7. **每日阅读** - 书籍管理、AI 阅读规划、笔记统计
8. **设置** - 主题切换、数据导入导出、Gist 数据源配置

## 🚀 快速开始

### 本地运行

```bash
# 启动任意静态服务器
npx serve .
# 或
python -m http.server 8080
```

访问 `http://localhost:8080` 即可使用。

## 📦 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

将代码推送到 GitHub 仓库：

```bash
git init
git add .
git commit -m "feat: 初始化日常工作台"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2. 启用 GitHub Pages

1. 打开仓库的 **Settings** 页面
2. 左侧菜单选择 **Pages**
3. Source 选择 **Deploy from a branch**
4. Branch 选择 **main**，目录选择 **/root**
5. 保存后等待部署完成

部署完成后，访问 `https://你的用户名.github.io/仓库名/` 即可。

### 3. 在手机上"安装"

**Android Chrome**：
1. 打开应用页面
2. 点击菜单 → "添加到主屏幕"
3. 即可像原生 App 一样使用

**iOS Safari**：
1. 打开应用页面
2. 点击分享按钮 → "添加到主屏幕"
3. 从主屏幕打开即可全屏使用

## 🔧 配置 Gist 数据源（可选）

### 1. 创建 GitHub Gist

1. 访问 [github.com/gists](https://github.com/gists)
2. 创建一个新的 Gist，文件名设为 `daily-data.json`
3. 将 [gist-example.json](gist-example.json) 的内容粘贴进去
4. 创建后复制 Gist ID（URL 中的那串字符）

### 2. 获取 Gist 原始链接

在 Gist 页面点击 "Raw" 按钮，复制 raw URL，格式如：
```
https://gist.githubusercontent.com/用户名/GistID/raw/文件名
```

### 3. 在应用中配置

1. 打开应用 → 进入"设置"页面
2. 在"GitHub Gist 原始JSON地址"输入框中粘贴你的 Gist raw URL
3. 点击"保存配置"
4. 点击刷新按钮即可获取远程数据

## ⏰ 设置定时自动更新（可选）

### 1. 创建 Personal Access Token

1. 访问 [github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token"
3. 勾选 `gist` 权限
4. 保存生成的 token

### 2. 配置 GitHub Actions Secret

1. 打开仓库 → Settings → Secrets and variables → Actions
2. 新增两个 Repository secrets：
   - `GIST_TOKEN`: 你的 Personal Access Token
   - `GIST_ID`: 你的 Gist ID

### 3. 启用工作流

工作流文件位于 `.github/workflows/daily-collector.yml`，默认在每天 **6:00、12:00、20:00** 自动运行。

也可以在 Actions 页面手动触发。

## 📁 项目结构

```
├── index.html              # 主应用文件（包含所有功能）
├── manifest.webmanifest    # PWA 清单文件
├── sw.js                   # Service Worker（Stale-While-Revalidate 策略）
├── icon-192.png            # 192x192 PNG 图标
├── icon-512.png            # 512x512 PNG 图标
├── icon-192.svg            # 192x192 SVG 图标（备用）
├── icon-512.svg            # 512x512 SVG 图标（备用）
├── gist-example.json       # Gist 数据格式示例
├── generate-icons.ps1      # PNG 图标生成脚本
├── package.json            # 采集脚本依赖
├── scripts/
│   └── collect.js          # 数据采集脚本（Hacker News + GitHub Trending + 头条热榜）
└── .github/
    └── workflows/
        └── daily-collector.yml  # 定时采集工作流（早6/午12/晚8）
```

## 🎨 自定义

### 修改主题色

在 `index.html` 中找到 `:root` CSS 变量：

```css
--primary: #556B2F;        /* 主色调 - 橄榄绿 */
--primary-dark: #3F5224;   /* 深色变体 */
--primary-light: #7A9B3D;  /* 浅色变体 */
--primary-bg: #f5f7f0;     /* 背景色 */
--accent: #8FBC6C;         /* 强调色 */
```

### 修改导航项

在 `index.html` 的 `NAV_ITEMS` 数组中修改：

```javascript
const NAV_ITEMS = [
  { id: 'plan', icon: '📋', title: '每日计划' },
  // 添加或修改导航项
];
```

## 📱 唤起 App Scheme

应用内置了抖音和B站的 URL Scheme 唤起：
- 抖音: `snssdk1128://webview/?url=...`
- B站: `bilibili://search?keyword=...`

如果设备未安装对应 App，会自动跳转到网页版。

## 📄 数据存储

所有数据存储在浏览器 localStorage 中：
- `dw_plans` - 每日计划（含历史记录）
- `dw_inspirations` - 选题灵感
- `dw_video_ideas` - 二创方向
- `dw_creative` - 创作打卡
- `dw_frontend` - 前端资讯 + AI/自定义学习计划
- `dw_exercise` - 锻炼视频 + AI推荐素材
- `dw_reading` - 阅读数据
- `dw_settings` - 设置
- `dw_hot_search` - 每日热榜

可在"设置"页面导出备份。

## 📝 注意事项

1. **Service Worker**：采用 Stale-While-Revalidate 策略，首次加载后缓存，后台静默更新
2. **更新缓存**：每次部署新版本后，Service Worker 的 `CACHE_NAME` 版本号（如 `v2`→`v3`）需递增，用户刷新后自动获取新版本
3. **离线使用**：已缓存的页面可以离线访问（数据除外）
4. **跨设备同步**：通过 Gist 实现简单的跨设备数据同步
5. **浏览器兼容**：推荐使用 Chrome 或 Safari 最新版本
6. **iOS 图标**：已使用 PNG 格式图标，确保 iOS 添加到主屏幕时正常显示

## 📄 License

MIT