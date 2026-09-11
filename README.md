# Momo

My dear kitty!

Momo 是一只住在 Windows 桌面上的小猫。她会一直待在最上层、没有窗口边框、背景透明；点击她就会打开聊天框，通过阿里云百炼（DashScope）的 **OpenAI 兼容接口** 和 **通义千问（Qwen）** 说话。

## 功能

- 透明、置顶、可拖动的桌面宠物（眨眼 / 轻跳 / 摇尾巴）
- 单击打开中文聊天窗口；右键可打开菜单（聊天 / 设置 / 退出）
- 设置页保存 DashScope API Key（只存在本机，绝不写进代码）
- 流式回复，带「Momo 正在想…」等待状态
- 系统托盘可打开聊天或退出

本应用 **不会** 录音、截屏或做任何隐蔽采集。

## 环境要求

- Windows 10/11（主要目标平台；macOS / Linux 也可开发调试）
- [Node.js](https://nodejs.org/) 20 或更高版本
- 阿里云百炼 API Key（[获取地址](https://bailian.console.aliyun.com/)）

## 安装

```bash
git clone https://github.com/Orchid-yan/momo.git
cd momo
npm install
```

## 配置 API Key

**方式一：应用内设置（推荐）**

1. 启动后点击小猫，或右键 →「设置」
2. 填入 API Key
3. 选择与密钥相同的地域（见下表）
4. 选择模型，默认 `qwen-plus`
5. 点「保存」

密钥保存在系统用户目录下的 `settings.json`，不会进入 Git。

**方式二：环境变量 / `.env` 文件**

```bash
cp .env.example .env
```

编辑 `.env`：

```env
DASHSCOPE_API_KEY=sk-你的密钥
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus
```

设置页里保存的密钥优先于 `.env`。

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

## 开发运行

```bash
npm run dev
```

成功后桌面右下角会出现 Momo。点击她打开聊天；填好有效密钥后即可收到通义千问的回复。

其它脚本：

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 开发模式启动宠物 |
| `npm run build` | 编译并按当前系统打包 |
| `npm run build:win` | 编译并打 Windows 安装包 |
| `npm test` | 运行接口解析单元测试 |
| `npm run typecheck` | TypeScript 检查 |

## 在 Windows 上打包

在 Windows 机器上：

```bash
npm install
npm run build:win
```

安装包会输出到 `release/` 目录（NSIS：`momo-0.1.0-setup.exe`）。

> 在 macOS / Linux 上交叉编译 Windows 安装包通常需要额外工具（如 Wine）。建议直接在 Windows 上执行 `npm run build:win`。

## 项目结构

```
src/main        Electron 主进程（窗口、托盘、DashScope 请求）
src/preload     预加载，向渲染进程暴露安全 API
src/renderer    React 界面（宠物 + 聊天/设置）
src/shared      共享类型
resources       应用图标
```

技术栈：Electron + Vite + React + TypeScript。聊天请求走主进程，渲染进程拿不到完整环境密钥逻辑以外的 Node 能力。

## 常见问题

**点击后没有回复？**  
先看聊天里的红色错误：多数是没填 Key、Key 与地域不符，或 Base URL 多写了 `/chat/completions`。

**小猫点不到 / 背景是黑的？**  
Windows 需要开启桌面合成（DWM）。请确认窗口透明效果没有被系统关闭。

**如何退出？**  
右键小猫，或点击托盘图标，选择「退出 Momo」。
