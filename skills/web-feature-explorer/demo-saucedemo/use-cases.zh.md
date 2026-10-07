# 用例 — https://www.saucedemo.com
_由 web-feature-explorer 生成（探索模式，2026-10-07）。结账流程已完整走通：Swag Labs 是演示商店，结账是假的（无真实支付）。_

## UC-01: 用户登录

**入口：** https://www.saucedemo.com/

**证据（探索中实际观察到）：**
- 填写 Username=standard_user / Password=secret_sauce，点击 Login -> /inventory.html
- 用错误密码点击 Login -> 显示错误横幅，停留在登录页

### UC-01-1 主流程 ✓ 已验证
```gherkin
Feature: 用户登录
  Scenario: 用户使用有效演示账号登录
    Given 用户在 https://www.saucedemo.com/
    When 用户填写用户名 "standard_user"、密码 "secret_sauce"
    And 点击 Login
    Then 跳转到商品列表页
    And 页头显示 "Products"
```

### UC-01-2 密码错误 ✓ 已验证
```gherkin
  Scenario: 密码错误时登录
    Given 用户在登录页
    When 用户填写错误的密码
    And 点击 Login
    Then 显示错误横幅 "Epic sadface: Username and password do not match any user in this service"
    And 用户停留在登录页
```

### UC-01-3 账号被锁定 ⚠ 未验证——根据页面结构推断，需手工执行
```gherkin
  Scenario: 被锁定的账号登录
    Given 用户在登录页
    When 用户以 "locked_out_user" 登录（登录页上公布的测试账号之一）
    Then 显示账号被锁定的错误
    And 不会进入商品列表页
```

## UC-02: 商品目录

**入口：** https://www.saucedemo.com/inventory.html

**证据（探索中实际观察到）：**
- 点击商品图片/名称 -> /inventory-item.html?id=4 和 ?id=1
- 点击 Back to products -> /inventory.html
- 排序下拉框有 4 个选项；排序行为未实际执行

### UC-02-1 商品排序 ⚠ 未验证——根据页面结构推断，需手工执行
```gherkin
Feature: 商品目录
  Scenario: 用户按价格排序商品
    Given 用户已登录，在商品列表页
    When 用户在排序下拉框选择 "Price (low to high)"
    Then 商品按价格从低到高排列
```

### UC-02-2 打开商品详情 ✓ 已验证
```gherkin
  Scenario: 用户打开商品详情页
    Given 用户在商品列表页
    When 用户点击某个商品的名称或图片
    Then 打开详情页 /inventory-item.html?id=<N>
    And 显示商品名称、描述和价格
    When 用户点击 "Back to products"
    Then 返回商品列表页
```

## UC-03: 购物车

**入口：** https://www.saucedemo.com/cart.html

**证据（探索中实际观察到）：**
- 对两件商品点击 Add to cart -> 按钮变为 Remove，购物车角标显示 2
- Remove 按钮存在；移除点击未实际执行

### UC-03-1 主流程 ✓ 已验证
```gherkin
Feature: 购物车
  Scenario: 用户加购并查看购物车
    Given 用户在商品列表页
    When 用户对两件商品点击 "Add to cart"
    Then 按钮变为 "Remove"
    And 购物车角标显示 2
    When 用户打开购物车
    Then 两件商品都在列表中，价格正确
```

### UC-03-2 移除商品 ⚠ 未验证——根据页面结构推断，需手工执行
```gherkin
  Scenario: 用户从购物车移除商品
    Given 购物车中有商品
    When 用户点击某行的 "Remove"
    Then 该行消失
    And 购物车角标数字减少
```

## UC-04: 结账流程

**入口：** https://www.saucedemo.com/checkout-step-one.html

**证据（探索中实际观察到）：**
- 填写 First Name=Test / Last Name=User / Zip=12345，点击 Continue -> /checkout-step-two.html
- 空表单点击 Continue -> 报错 Error: First Name is required，停留在当前页
- 总览页显示 Item total $45.98 / Tax $3.68 / Total $49.66
- 点击 Finish -> /checkout-complete.html（感谢页，购物车清空）
- 第一步点 Cancel -> /cart.html；总览页点 Cancel -> /inventory.html

### UC-04-1 主流程 ✓ 已验证
```gherkin
Feature: 结账流程
  Scenario: 用户完成演示结账
    Given 购物车中有商品
    When 用户点击 "Checkout"
    And 填写 First Name、Last Name、Zip/Postal Code（均为有效数据）
    And 点击 Continue
    Then 订单总览页显示商品、支付和配送信息
    When 用户点击 Finish
    Then 显示 "Thank you for your order!" 页面
    And 购物车被清空
```

### UC-04-2 必填项为空 ✓ 已验证
```gherkin
  Scenario: 必填项为空时提交
    Given 用户在结账信息页
    When 用户不填表直接点击 Continue
    Then 显示错误 "First Name is required"
    And 用户停留在当前页
```

### UC-04-3 取消流程 ✓ 已验证
```gherkin
  Scenario: 用户中途取消结账
    Given 用户在结账某一步
    When 用户在第一步点击 Cancel
    Then 返回购物车页
    When 用户在总览页点击 Cancel
    Then 返回商品列表页
```

## UC-05: 全局导航

**入口：** https://www.saucedemo.com/inventory.html（所有页面共用页头页脚）

**证据（探索中实际观察到）：**
- 打开汉堡菜单：All Items / About / Logout / Reset App State
- About 链接 href 确认为 https://saucelabs.com/（未跳转）
- Logout 和 Reset App State 按安全规则未点击

### UC-05-1 主流程 ✓ 已验证
```gherkin
Feature: 全局导航
  Scenario: 用户打开汉堡菜单
    Given 用户已登录
    When 用户点击汉堡菜单
    Then 菜单显示 All Items、About、Logout、Reset App State
    When 用户查看 About 链接
    Then 链接指向 https://saucelabs.com/
```

### UC-05-2 登出与重置（手工执行）
```gherkin
  Scenario: 用户登出并重置应用状态 [手工]
    Given 用户已登录
    When 用户点击 Logout
    Then 返回登录页
    # Reset App State 会清空购物车和选择状态；探索器按安全规则不自动执行
```
