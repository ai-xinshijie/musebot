# JSON Lens — Chrome Web Store 上架 Checklist

## 0. 发布前确认（已完成 ✓）

- [x] Manifest V3，`version: 0.1.0`，`minimum_chrome_version: 114`
- [x] 仅申请 `clipboardRead` + `storage`，无 `host_permissions`，无 content script，无远程代码
- [x] 商店文案：`store-assets/listing.md`（标题/短描述/详细描述/截图说明）
- [x] 宣传截图 4 张（1280×800）：`store-assets/01~04-*.png`
- [x] 隐私政策页：`store-assets/privacy.html`（待部署，见第 3 步）
- [ ] 开源协议：README 里 License 还是 TBD — 建议 MIT，发布前定下来

## 1. 打包 zip

在扩展**根目录**执行（只打包扩展本身，不要把 `store-assets/` 打进去）：

```bash
cd ~/workspace/projects/jsonlens
zip -r jsonlens-0.1.0.zip manifest.json popup.html tab.html icons src README.md \
  -x "*.DS_Store"
unzip -l jsonlens-0.1.0.zip   # 检查：根目录就是 manifest.json，没有多余嵌套
```

上传到商店的是这个 `.zip`（商店后台推荐直接传 zip，不用 `.crx`）。

## 2. 商店后台填写字段（Developer Dashboard → New Item）

| 字段 | 填写内容 |
|---|---|
| Package | 上面打的 `jsonlens-0.1.0.zip` |
| Item name | JSON Lens — Local JSON Formatter & Viewer |
| Summary（短描述） | `listing.md` 里的 Short description（≤132 字符） |
| Description（详细描述） | `listing.md` 里的 Detailed description |
| Category | Developer Tools |
| Language | English |
| Screenshots | 4 张 1280×800 PNG（`store-assets/01~04`），按编号顺序传 |
| Small tile icon | 已有 `icons/icon128.png`（128×128 ✓） |
| Large tile (440×280) | 可选，建议做一张（品牌色底 + "JSON Lens" + 一句卖点），缺了也能上架 |
| Privacy policy URL | GitHub Pages 部署后的 `privacy.html` 地址（第 3 步） |
| Homepage / Support URL | GitHub 仓库地址 |
| Pricing | Free（不勾选 in-app purchases） |
| Visibility | Public |
| Regions | All regions（默认） |
| Permission justification | 按实际填写，例如：`clipboardRead` — only reads clipboard when the user clicks Paste; `storage` — remembers input on-device only |

## 3. 隐私政策页部署（GitHub Pages）

Chrome 商店要求隐私政策是一个**公开可访问的 URL**。建议方案：

1. 把 `store-assets/privacy.html` 放进 GitHub 仓库（例如 `musebot` 仓库的 `docs/jsonlens/privacy.html`，或单独建一个 `jsonlens` 仓库）。
2. 仓库 Settings → Pages → Source 选 `main` 分支 + `/docs` 目录（或用 `gh-pages` 分支）。
3. 部署后 URL 形如 `https://<user>.github.io/musebot/jsonlens/privacy.html` —— 把这个地址填进商店后台的 Privacy policy 字段，同时更新 `listing.md` 里的 `[privacy policy URL]` 占位符。
4. 注意：Pages 首次部署有几分钟延迟，填 URL 前先在浏览器打开确认能访问。

## 4. 审核注意事项

- **预计审核时长**：通常几小时到 3 天；新开发者账号的第一个上架项可能触发更严的人工审核，等 3–5 天也正常。
- **权限说明是重点**：`clipboardRead` 是敏感权限，一定要在后台的 permission justification 里写清"仅用户主动点击 Paste 时读取"，否则大概率被打回补说明。
- **常见被拒原因**：
  - 描述与实际功能不符（我们的描述都是实测功能，如实写即可）
  - 缺隐私政策 URL（第 3 步解决）
  - 单一用途不明（Single Purpose）—— 我们的用途很明确：JSON 格式化/查看
  - 含远程代码或混淆代码（我们没有构建步骤、无混淆，源码可读是加分项）
- **被拒了别慌**：按审核邮件的要求补材料重新提交即可，不用重新付 $5。
- **发布后**：版本号 `0.1.0` → 以后每次更新包都要 bump `manifest.json` 里的 `version`。

## 5. 发布当天（主 agent 在浏览器里操作）

1. 登录 Developer Dashboard → New Item → 上传 zip
2. 按第 2 步表格填完所有字段，传截图
3. Submit for review → 等审核邮件
4. 审核通过后自动上架（或选手动发布）
