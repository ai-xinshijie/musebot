# JSON Lens 冷启动物料 ①：Reddit 发帖

> 状态：草稿，待上线后发布。**发布前必读**：Reddit 对自我推广极敏感，
> 各版块规则不同且经常变。发帖前先去目标版块看置顶规则（self-promotion 条款），
> 优先选每周固定"showoff / self-promo"主题帖；在自己帖子下面真诚回复每一条评论，
> 比帖子本身更重要。用你自己的老账号发（新号发推广帖大概率被秒删）。

## 推荐版块（按优先级）

1. **r/webdev** — 每周有固定自我推广主题帖（Showoff Saturday 一类），主帖自荐被删概率高，优先主题帖
2. **r/SideProject** — 对独立开发者项目容忍度高，可发主帖，标题带 [SideProject] 类标签按版规来
3. **r/chrome** — 浏览器扩展相关，容忍度中等，标题别写成广告
4. **r/programming** — 流量大但对自荐极严，**不建议首发**，等有了一定讨论度再考虑

## 标题备选（选一个）

- I got tired of pasting API responses with secrets into online JSON formatters, so I built one that never touches the network
- JSON Lens: a JSON formatter Chrome extension with zero network requests — you can read the entire source
- Show HN-style too long? 不用，Reddit 标题就用上面这两句之一，别加表情

## 正文（可直接粘贴）

I kept catching myself pasting API responses — with tokens and secrets in them —
into online JSON formatters without thinking. So I built the formatter I actually
wanted: **JSON Lens**, a Chrome extension that formats, validates, and explores
JSON, and makes **zero network requests**. No `fetch`, no XHR, no beacons, no
analytics. The manifest asks for two permissions (`clipboardRead`, `storage`),
no host permissions, no content scripts — there is physically nowhere for your
data to go. The whole thing is vanilla JS, no build step, no dependencies; you
can read every line of the source.

Features: paste / upload `.json` / read-from-clipboard input, format + validate
with exact line+column error locations, collapsible tree view, full-text search
with match navigation, one-click copy formatted ↔ minified, follows your OS
light/dark theme.

It's free, and the free version stays free and stays local — no account, no ads.
I'm thinking about a Pro tier later (semantic JSON diff, huge-file support),
but nothing in the free version will ever phone home or get paywalled.

Would genuinely love brutal feedback: what's missing, what's annoying, what
would make you switch from your current formatter?

[Chrome Web Store link — 上线后填]

---

## 评论区预判 & 回复要点（提前准备）

- **"VS Code / jq 就够了，为什么要装扩展？"** → 回：同意，jq 和编辑器格式化够用；这个是给"快速看一眼 API 返回/日志、不想开编辑器"场景的，浏览器里点一下图标就行。
- **"怎么证明真的零网络？"** → 回：源码全公开可读，manifest 里没有 host_permissions；也可以自己用 DevTools 的 Network 面板 / 抓包验证，欢迎打脸。
- **"和 JSONVue / 其他扩展比有什么区别？"** → 回：很多同类扩展要了一堆权限或含追踪；JSON Lens 的卖点就是权限最小 + 可验证的零网络。功能上目前不求全（diff、大文件支持在 Pro 路线图里）。
- **有人提 bug** → 先谢、复现、记下来，别辩解。第一个版本的目标就是收反馈。
