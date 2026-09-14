# Momo

My dear kitty!

Momo 是一只住在 Windows 桌面上的小猫。她会一直待在最上层、没有窗口边框、背景透明。**按住拖动**可以放到桌面任意位置；**单击**会撒娇（打滚、心心眼等）；**双击**打开和通义千问的聊天框。

架构是**单个 Electron 应用**（没有独立后端服务），模块划分：

| 模块 | 目录 | 职责 |
| --- | --- | --- |
| ui | `src/ui`、`src/renderer` | 透明宠物窗、聊天/设置界面 |
| chat | `src/chat` | 会话状态、把消息交给 Qwen 客户端 |
| qwen | `src/qwen` | DashScope 真实客户端 + **本地 mock 客户端** |
| settings | `src/settings` | API Key / Base URL / 模型的本机存储 |

本应用 **不会** 录音、截屏或做任何隐蔽采集。

## 环境要求

- Windows 10/11（主要目标平台；macOS / Linux 也可开发调试）
- [Node.js](https://nodejs.org/) 20 或更高版本

## 安装

```bash
git clone https://github.com/Orchid-yan/momo.git
cd momo
npm install
```

## 开发运行（推荐先走模拟回复）

日常开发和自动化验证**默认不要调用**通义千问，以免消耗 Cursor / DashScope 额度：

```bash
# Linux / macOS
MOMO_MOCK_QWEN=1 npm run dev

# Windows cmd
set MOMO_MOCK_QWEN=1&& npm run dev

# Windows PowerShell
$env:MOMO_MOCK_QWEN=1; npm run dev
```

模拟模式下发送消息会得到带 `【模拟】` 前缀的本地假回复，界面会提示「未调用千问」。

## 你自己做一次真实冒烟（可选）

只有在你明确想测通义千问时，才配置自己的密钥。仓库和 CI **不会**替你发起真实请求。

1. 打开 [阿里云百炼控制台](https://bailian.console.aliyun.com/) 创建 API Key。
2. 任选一种方式写入密钥（不要提交到 Git）：

   **应用内设置（推荐）**  
   **双击**小猫 → 齿轮 → 填写 API Key → 选择与密钥相同的地域 → 模型默认 `qwen-plus` → 保存。  
   保存只写本机 `settings.json`，**不会**立刻调用 API。

   **或 `.env` 文件**

   ```bash
   cp .env.example .env
   ```

   ```env
   DASHSCOPE_API_KEY=sk-你的密钥
   DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   DASHSCOPE_MODEL=qwen-plus
   ```

3. **不要**设置 `MOMO_MOCK_QWEN`（或设为 `0`），然后：

   ```bash
   npm run dev
   ```

4. **双击**小猫打开聊天，发一句「你好」，应看到通义千问的流式回复。测完即可关掉窗口；密钥仍只留在本机。

设置页保存的密钥优先于 `.env`。

### DashScope OpenAI 兼容接口

调用路径：`POST {DASHSCOPE_BASE_URL}/chat/completions`

| 地域 | Base URL（不要带 `/chat/completions`） |
| --- | --- |
| 北京（中国站） | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 新加坡（国际站） | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| 美东弗吉尼亚 | `https://dashscope-us.aliyuncs.com/compatible-mode/v1` |

- 请求头：`Authorization: Bearer <API Key>`
- 默认模型：`qwen-plus`（也可改为 `qwen-turbo`、`qwen-max` 等）
- **API Key 必须和 Base URL 属于同一地域**，否则会返回 401
- 官方说明：[使用 OpenAI 兼容接口调用千问](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope)

## 脚本

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 开发模式启动宠物 |
| `MOMO_MOCK_QWEN=1 npm run dev` | 启动并用本地假回复（不消耗额度） |
| `npm test` | 单元/集成测试（全部 mock，不访问 DashScope） |
| `npm run smoke` | 构建后启动应用：点开聊天路径 + 存假密钥 + mock 回复后退出 |
| `npm run pack` | 仅编译（不打安装包） |
| `npm run build` | 编译并按当前系统打包 |
| `npm run build:win` | 编译并打 Windows 安装包 |
| `npm run typecheck` | TypeScript 检查 |

## 在 Windows 上打包

```bash
npm install
npm run build:win
```

安装包会输出到 `release/` 目录（NSIS：`momo-0.1.0-setup.exe`）。

> 在 macOS / Linux 上交叉编译 Windows 安装包通常需要额外工具（如 Wine）。建议直接在 Windows 上执行 `npm run build:win`。

## 常见问题

**怎么和小猫互动？**

| 操作 | 效果 |
| --- | --- |
| 按住拖动 | 把 Momo 移到桌面任意位置 |
| 单击（几乎不移动） | 播放撒娇动画（打滚 / 心心眼 / 伸懒腰 / 招手 / 眨眼），并冒出「喵～」之类的小气泡 |
| 双击 | 打开通义千问聊天窗 |
| 右键 | 菜单（聊天 / 设置 / 退出） |

**点击后没有回复？**  
先看聊天里的红色错误：多数是没填 Key、仍处于模拟模式、Key 与地域不符，或 Base URL 多写了 `/chat/completions`。

**小猫点不到 / 背景是黑的？**  
Windows 需要开启桌面合成（DWM）。请确认窗口透明效果没有被系统关闭。

**如何退出？**  
右键小猫，或点击托盘图标，选择「退出 Momo」。
