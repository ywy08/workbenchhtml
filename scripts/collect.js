const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'ywy08/workbenchhtml').split('/');
const branch = (process.env.GITHUB_REF || 'refs/heads/main').replace('refs/heads/', '');

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const INSPIRATION_POOL = [
  {title:'职场新人避坑指南',tag:'职场',desc:'新人入职第一月真实经历避坑清单'},
  {title:'30分钟快手晚餐',tag:'美食',desc:'上班族必备快手菜谱摆盘精致'},
  {title:'极简主义穿搭',tag:'时尚',desc:'胶囊衣柜搭配一件多穿'},
  {title:'周末城市漫步',tag:'生活',desc:'小众打卡地治愈系vlog'},
  {title:'猫咪日常大赏',tag:'萌宠',desc:'喵主子一天搞笑瞬间合集'},
  {title:'健身小白入门',tag:'运动',desc:'零基础健身第一周真实反馈'},
  {title:'读书笔记分享',tag:'知识',desc:'本月最爱书单金句摘录'},
  {title:'改造出租屋',tag:'家居',desc:'500元预算ins风角落'},
  {title:'旅行vlog',tag:'旅行',desc:'小众目的地避开人潮'},
  {title:'手账排版教程',tag:'手作',desc:'新手友好手账布局灵感'},
  {title:'下班后的副业收入',tag:'副业',desc:'普通人可做的5种副业真实收入'},
  {title:'独处的乐趣',tag:'生活',desc:'一个人看电影吃火锅的快乐'},
  {title:'秋冬穿搭',tag:'时尚',desc:'氛围感秋冬穿搭温柔知性'},
  {title:'咖啡日记',tag:'美食',desc:'周末咖啡馆手冲入门教程'},
  {title:'读书分享',tag:'知识',desc:'改变人生的3本书每本都值得'},
  {title:'居家健身',tag:'运动',desc:'无需器械全身燃脂21天效果记录'},
  {title:'宠物日常',tag:'萌宠',desc:'狗狗第一次见雪的反应太搞笑'},
  {title:'城市citywalk',tag:'生活',desc:'老城区隐藏宝藏走一遍爱上'},
  {title:'职场穿搭',tag:'职场',desc:'办公室穿搭专业时尚'},
  {title:'手作时光',tag:'手作',desc:'周末陶艺体验治愈慢生活'},
  {title:'AI工具体验',tag:'科技',desc:'最新AI工具真实使用感受'},
  {title:'情绪管理',tag:'心理',desc:'上班族减压5个小方法'},
  {title:'独居日记',tag:'生活',desc:'一个人生活的小确幸'},
  {title:'摄影入门',tag:'摄影',desc:'手机也能拍出大片'},
  {title:'英语学习',tag:'教育',desc:'每天15分钟英语口语进步'},
  {title:'理财入门',tag:'财经',desc:'月薪3000如何存钱'},
  {title:'绿植养护',tag:'家居',desc:'新手必养的10种室内植物'},
  {title:'手工皮具',tag:'手作',desc:'从零制作一个钱包'},
  {title:'骑行日记',tag:'运动',desc:'城市骑行路线推荐'},
  {title:'深夜食堂',tag:'美食',desc:'深夜治愈系美食合集'}
];

const VIDEO_IDEAS_POOL = [
  { hotspot: 'AI工具新突破', original: '最新AI模型发布引发热议', ideas: ['AI vs 人工同一任务对比挑战','AI创意实验生成艺术作品','AI科普系列通俗易懂'] },
  { hotspot: '网红美食探店翻车', original: '某网红餐厅实际与视频不符', ideas: ['实测验证真实记录体验','科普网红营销套路','反套路讽刺剧本创作'] },
  { hotspot: '热门影视剧结局', original: '某大结局引发观众讨论', ideas: ['替代结局剪辑创作','深度解析角色动机','街头采访观众看法'] },
  { hotspot: '社会新闻热点', original: '某社会事件引发广泛关注', ideas: ['事件时间线梳理','专家观点分析解读','科普延伸知识讲解'] },
  { hotspot: '国货品牌崛起', original: '某国货品牌海外走红', ideas: ['中外品牌深度测评','国货品牌故事挖掘','支持国货挑战发起'] },
  { hotspot: '远程办公常态化', original: '越来越多企业采用混合办公模式', ideas: ['远程办公效率技巧分享','不同职业远程真实一天','远程设备选购指南'] },
  { hotspot: '环保生活方式', original: '低碳生活成为新趋势', ideas: ['24小时零废弃挑战','环保好物测评体验','传统消费vs极简生活'] },
  { hotspot: '短视频电商新玩法', original: '直播带货新模式兴起', ideas: ['无人直播运营技巧','短视频引流电商方法','私域变现路径探索'] },
  { hotspot: '元宇宙概念升温', original: 'VR/AR技术新突破', ideas: ['VR体验真实测评','元宇宙科普通俗易懂','虚拟社交真实体验'] },
  { hotspot: '新能源汽车爆发', original: '新能源车销量创新高', ideas: ['新能源车深度测评','充电设施体验','车主真实用车感受'] }
];

const FRONTEND_NEWS_POOL = [
  { title: 'React 19 正式发布：全新编译器和Hooks优化', source: '掘金前端', url: 'https://juejin.cn/frontend' },
  { title: 'TypeScript 5.6 新特性解析', source: 'InfoQ', url: 'https://infoq.cn/topic/front-end' },
  { title: 'Chrome DevTools 性能分析功能增强', source: 'Chrome DevTools', url: 'https://developer.chrome.com/docs/devtools/' },
  { title: '前端性能优化：View Transitions API实践', source: '掘金前端', url: 'https://juejin.cn/frontend' },
  { title: 'Vue 3.5 正式版发布', source: 'GitHub Trending', url: 'https://github.com/trending/javascript' },
  { title: 'MDN新增WebGPU API文档', source: 'MDN', url: 'https://developer.mozilla.org/' },
  { title: 'Svelte 5 发布：全新响应式系统', source: 'Svelte', url: 'https://svelte.dev/' },
  { title: 'Node.js 22 LTS 新特性', source: 'Node.js', url: 'https://nodejs.org/' },
  { title: 'Tailwind CSS 4.0 重大更新', source: 'Tailwind', url: 'https://tailwindcss.com/' },
  { title: 'Vite 6.0 发布：构建速度再提升', source: 'Vite', url: 'https://vitejs.dev/' },
  { title: '前端工程化：Monorepo 最佳实践', source: 'InfoQ', url: 'https://infoq.cn/topic/front-end' },
  { title: 'Web Components 深入解析', source: 'MDN', url: 'https://developer.mozilla.org/' }
];

const EXERCISE_VIDEOS = {
  gufa: [
    { title: '八段锦完整版', duration: '30分钟', platform: 'douyin', url: 'https://www.douyin.com' },
    { title: '太极拳二十四式', duration: '25分钟', platform: 'bilibili', url: 'https://www.bilibili.com' },
    { title: '五禽戏养生操', duration: '20分钟', platform: 'douyin', url: 'https://www.douyin.com' },
    { title: '六字诀养气功', duration: '20分钟', platform: 'bilibili', url: 'https://www.bilibili.com' },
    { title: '八段锦分解教学', duration: '40分钟', platform: 'douyin', url: 'https://www.douyin.com' }
  ],
  eye: [
    { title: '眼球运动训练', duration: '5分钟', platform: 'douyin', url: 'https://www.douyin.com' },
    { title: '眼部按摩放松', duration: '10分钟', platform: 'bilibili', url: 'https://www.bilibili.com' },
    { title: '视力恢复训练', duration: '15分钟', platform: 'douyin', url: 'https://www.douyin.com' },
    { title: '眼保健操标准版', duration: '5分钟', platform: 'bilibili', url: 'https://www.bilibili.com' },
    { title: '缓解视疲劳眼部瑜伽', duration: '10分钟', platform: 'douyin', url: 'https://www.douyin.com' }
  ]
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchFrontendNews() {
  const axios = require('axios');
  const items = [];
  
  try {
    const hnRes = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json', { timeout: 8000 });
    if (hnRes.data && Array.isArray(hnRes.data)) {
      const storyIds = hnRes.data.slice(0, 6);
      const stories = await Promise.all(
        storyIds.map(id => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 }).catch(() => null))
      );
      stories.forEach(s => {
        if (s && s.data && s.data.title) {
          items.push({
            title: s.data.title,
            source: 'Hacker News',
            url: s.data.url || `https://news.ycombinator.com/item?id=${s.data.id}`
          });
        }
      });
    }
  } catch (e) { console.log('Hacker News fetch failed:', e.message); }
  
  try {
    const ghRes = await axios.get('https://api.github.com/search/repositories?q=frontend+language:javascript+stars:>100&sort=updated&order=desc&per_page=3', {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      timeout: 8000
    });
    if (ghRes.data && ghRes.data.items) {
      ghRes.data.items.forEach(repo => {
        items.push({
          title: `🔥 ${repo.name} - ${repo.description || '热门前端开源项目'}`,
          source: 'GitHub Trending',
          url: repo.html_url
        });
      });
    }
  } catch (e) { console.log('GitHub fetch failed:', e.message); }
  
  if (items.length < 6) {
    const shuffled = shuffle(FRONTEND_NEWS_POOL);
    for (let i = items.length; i < 6; i++) {
      items.push(shuffled[i % shuffled.length]);
    }
  }
  
  return items.slice(0, 8);
}

async function fetchHotSearch() {
  try {
    const axios = require('axios');
    const response = await axios.get('https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    }).catch(() => null);
    if (response && response.data && response.data.data) {
      return response.data.data.map(item => ({
        title: item.Title || item.title,
        hot: item.HotValue || item.hotValue,
        url: item.Url || item.url
      })).slice(0, 10);
    }
  } catch {}
  return [];
}

async function main() {
  const date = todayKey();
  
  console.log(`Fetching data for ${date}...`);

  const [inspirations, videos, frontendNews, exerciseData, hotSearch] = await Promise.all([
    Promise.resolve(shuffle(INSPIRATION_POOL).slice(0, 10)),
    Promise.resolve(shuffle(VIDEO_IDEAS_POOL).slice(0, 5)),
    fetchFrontendNews(),
    Promise.resolve(EXERCISE_VIDEOS),
    fetchHotSearch()
  ]);

  const data = {
    date,
    updatedAt: new Date().toISOString(),
    inspirations: { date, items: inspirations },
    videos: { date, items: videos },
    frontend: { date, news: frontendNews, learningPlan: [] },
    exercise: { date, gufa: exerciseData.gufa, eye: exerciseData.eye },
    hotSearch: hotSearch.length > 0 ? hotSearch : shuffle([
      { title: 'AI大模型最新突破', hot: 9800000, url: 'https://www.toutiao.com' },
      { title: '新能源汽车销量创新高', hot: 8500000, url: 'https://www.toutiao.com' },
      { title: '年轻人为什么不爱发朋友圈了', hot: 7200000, url: 'https://www.toutiao.com' },
      { title: '多地出台楼市新政', hot: 6800000, url: 'https://www.toutiao.com' },
      { title: '高温天气如何养生', hot: 5600000, url: 'https://www.toutiao.com' },
      { title: '国产电影票房突破', hot: 5200000, url: 'https://www.toutiao.com' },
      { title: '科技公司最新发布', hot: 4800000, url: 'https://www.toutiao.com' },
      { title: '奥运赛事精彩回顾', hot: 4500000, url: 'https://www.toutiao.com' },
      { title: '教育改革新动向', hot: 3900000, url: 'https://www.toutiao.com' },
      { title: '生活小妙招大盘点', hot: 3200000, url: 'https://www.toutiao.com' }
    ]).slice(0, 10)
  };

  data.frontend.learningPlan = [
    `📖 精读今天推荐的技术文章`,
    `🛠️ 实践一个新API或框架`,
    `📝 整理今日学习笔记`,
    `🔍 调研一个感兴趣的技术方向`
  ];

  console.log('Updating daily-data.json in repo...');
  
  try {
    const filePath = 'daily-data.json';
    const fileContent = JSON.stringify(data, null, 2);
    const contentBuffer = Buffer.from(fileContent).toString('base64');

    let sha = null;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch
      });
      sha = existingFile.sha;
    } catch (e) {
      if (e.status !== 404) throw e;
    }

    const message = `📅 每日数据更新: ${date}\n\n自动采集更新热榜、灵感、前端资讯、锻炼素材`;
    
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message,
      content: contentBuffer,
      branch,
      sha
    });

    console.log(`File updated successfully: https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`);
    console.log(`Raw URL: https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`);
    console.log(`Data for ${date} has been collected and stored.`);
  } catch (err) {
    console.error('Error updating file:', err.message);
    throw err;
  }
}

main().catch(console.error);