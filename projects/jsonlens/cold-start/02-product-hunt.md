# JSON Lens 冷启动物料 ②：Product Hunt 发布页

> 状态：草稿，待上线后发布。注意：
> - Product Hunt 发布**必须用你自己的账号**（maker 身份），我代劳不了
> - 发布时机：选工作日（周二~周四），美西时间早上发布，当天多盯评论区
> - 记得把商店截图（store-assets/01~04）传上去当 gallery
> - 发布前先去 PH 上搜一下有没有同类 JSON 工具最近发布过，错开撞车

## Name

JSON Lens

## Tagline（≤60 字符）

The JSON formatter that never phones home

## Description（发布页正文）

Every developer has done this: pasted an API response — tokens, secrets and
all — into some random online JSON formatter, and only afterward wondered
where that data went.

JSON Lens is a Chrome extension built so you never have to make that
trade-off. It formats, validates, and explores JSON in a clean tree view, and
it runs **100% locally**: no `fetch`, no XHR, no analytics, no ads, no
account. It requests exactly two permissions (`clipboardRead` — only when you
press Paste, and `storage` — to remember your input on-device), no host
permissions, no content scripts, no remote code. The whole thing is vanilla
JavaScript with no build step — you can read every line of the source to
verify the "zero network" claim yourself.

**What it does**

- Paste, upload `.json`, or read-from-clipboard input
- Format + validate, with errors pinpointed to line and column
- Collapsible tree view with expand-all / collapse-all
- Full-text search with ↑/↓ match navigation
- One-click copy: formatted ↔ minified
- Follows your OS light/dark theme

**What it doesn't do** (honesty section — PH 社区吃这套)

- No JSON diff yet — semantic diff is planned for a future Pro tier
- ~500k character guard on very large files — streaming support is on the roadmap
- The free version stays free and stays local, forever. No paywalls on existing features, no phoning home. Ever.

## Topics（发布时选）

Developer Tools, Chrome Extensions, Privacy

## Maker's first comment（发布后第一时间自己抢沙发）

Hey everyone, I'm the maker of JSON Lens. I'm a frontend engineer, and I built
this because I was tired of pasting production API responses into online
formatters and hoping for the best.

The one thing I'd love your brutal feedback on: **can you verify the
zero-network claim?** The source is fully readable, the manifest is minimal —
if you find a single network request I didn't know about, that's the most
valuable bug report I could get today.

Also happy to answer anything about the Manifest V3 review process — first
submission took [X days], happy to share notes.

## 发布后 24 小时 checklist（给你自己的）

- [ ] 每个评论都回，别只回夸你的，批评的优先回
- [ ] 把"有人验证了零网络"这条评论置顶/引用到 Twitter/Reddit 二次传播
- [ ] 当天结束把 PH 链接贴到 Reddit 帖评论区（别反过来，容易被判刷票）
- [ ] 收集到的 feature request 记进 GitHub issues，当场建 3–5 个让围观的人看到项目在动
