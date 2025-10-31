# 重构为 Slash Command 架构

> **变更类型**: Breaking Change (重大架构变更)
> **优先级**: P0
> **预计时间**: 4-6 小时
> **状态**: 提议中

## Why - 为什么要做

### 问题

当前 Storyboardify 采用了**传统 CLI 架构**，这与整个生态系统的设计理念不符：

❌ **架构问题**:
- TypeScript 实现了所有业务逻辑（Coach/Hybrid 模式的交互流程）
- 使用 `inquirer.js` 做命令行交互
- AI 被排除在交互流程之外
- 把 Storyboardify 当成独立 CLI 工具，而非 AI 助手工具

❌ **与 Scriptify 生态不一致**:
- Scriptify 是 Slash Command 架构（AI 主导）
- Storyboardify 是 CLI 架构（程序主导）
- 用户在 Scriptify 中习惯了 `/command` 方式
- 切换到 Storyboardify 需要适应完全不同的交互方式

❌ **可维护性问题**:
- 复杂的 TypeScript 业务逻辑难以维护
- Coach 模式的引导流程硬编码在代码中
- 修改交互流程需要改代码、重新编译、发布
- 缺乏灵活性

### 影响

如果不重构：
- 用户体验割裂（Scriptify → Storyboardify）
- AI 无法参与核心创作流程
- 维护成本高，迭代速度慢
- 与生态系统设计理念背道而驰

## What Changes - 改什么

### 架构转变

**从：CLI 架构**
```
用户 → 终端 → TypeScript → inquirer.js → 业务逻辑 → 结果
```

**到：Slash Command 架构**
```
用户 → AI助手 → /command → CLI入口 → Bash脚本 → JSON输出
                    ↓
              Markdown指令模板
                    ↓
              AI按指令引导用户
                    ↓
              AI保存结果（Write工具）
```

### 核心变更

#### 1. 创建三层架构

**Layer 1: Markdown 指令层** (templates/commands/)
```
templates/commands/
├── specify.md          # 定义项目规格
├── import.md           # 导入剧本
├── preproduce.md       # 生成制作包
├── generate-coach.md   # Coach模式生成
├── generate-hybrid.md  # Hybrid模式生成
├── generate-express.md # Express模式生成
└── export.md          # 导出分镜
```

**Layer 2: Bash 脚本层** (scripts/bash/)
```
scripts/bash/
├── common.sh      # 通用函数库
├── specify.sh     # 项目规格管理
├── import.sh      # 剧本导入
├── preproduce.sh  # 制作包生成
├── generate.sh    # 分镜生成（读取状态）
└── export.sh      # 分镜导出
```

**Layer 3: TypeScript CLI 入口** (src/)
```typescript
// 极简CLI入口，只负责：
// 1. 命令注册
// 2. 调用bash脚本
// 3. 显示模板内容
```

#### 2. 删除内容

**删除文件/目录：**
- `src/modes/` - 所有模式实现
- `src/commands/` - 所有命令实现
- `src/generators/` - 生成器
- `src/validators/` - 验证器
- `src/education/` - 教育系统
- `src/exporters/` - 导出器
- `src/importers/` - 导入器
- `src/utils/interactive-prompt.ts` - inquirer 封装
- `src/utils/progress-display.ts` - 进度显示

**删除依赖：**
- `inquirer` 和 `@types/inquirer`
- `ora`

#### 3. 保留内容

**保留并简化：**
- `src/cli.ts` - 简化为命令注册和bash调用
- `src/types/` - 类型定义（供后续工具使用）
- `src/utils/bash-runner.ts` - 新增，调用bash脚本
- `src/utils/yaml-parser.ts` - 解析markdown前置元数据

### 命令映射

| 旧命令 | 新命令 | 说明 |
|--------|--------|------|
| `storyboardify specify` | `/specify` | 定义项目规格 |
| `storyboardify import` | `/import` | 导入剧本 |
| `storyboardify preproduce` | `/preproduce` | 生成制作包 |
| `storyboardify generate --mode coach` | `/generate-coach` | Coach模式 |
| `storyboardify generate --mode hybrid` | `/generate-hybrid` | Hybrid模式 |
| `storyboardify generate --mode express` | `/generate-express` | Express模式 |
| `storyboardify export` | `/export` | 导出分镜 |

## How to Implement - 怎么做

### Phase 1: 准备工作 (30分钟)

1. **创建新结构**
   ```bash
   mkdir -p templates/commands
   mkdir -p scripts/bash
   ```

2. **从 Scriptify 复制基础设施**
   - 复制 `scripts/bash/common.sh`
   - 复制 `src/utils/bash-runner.ts`
   - 复制 `src/utils/yaml-parser.ts`

3. **保留类型定义**
   - 保持 `src/types/` 不变

### Phase 2: 创建 Bash 脚本层 (1.5小时)

**核心脚本：**

1. **specify.sh** - 项目规格管理
   ```bash
   # 检查/创建 .storyboardify/config.json
   # 输出项目状态 JSON
   ```

2. **import.sh** - 剧本导入
   ```bash
   # 验证 scriptify JSON
   # 复制到项目目录
   # 输出导入状态
   ```

3. **preproduce.sh** - 制作包生成
   ```bash
   # 读取剧本
   # 检查状态
   # 输出需要生成的内容
   ```

4. **generate.sh** - 分镜生成状态
   ```bash
   # 读取制作包
   # 检查已有分镜
   # 输出当前状态和框架
   ```

5. **export.sh** - 分镜导出
   ```bash
   # 读取分镜
   # 检查导出格式
   # 输出导出状态
   ```

### Phase 3: 创建 Markdown 指令层 (2小时)

**核心模板：**

1. **specify.md** - 引导用户定义项目
2. **import.md** - 引导验证和导入剧本
3. **preproduce.md** - 引导生成制作包
4. **generate-coach.md** - Coach模式详细引导流程
5. **generate-hybrid.md** - Hybrid模式引导流程
6. **generate-express.md** - Express模式执行
7. **export.md** - 引导导出选择

### Phase 4: 重构 CLI 入口 (1小时)

简化 `src/cli.ts`：

```typescript
// 参考 scriptify/src/cli.ts
program
  .command('specify')
  .description('定义项目规格')
  .action(async () => {
    const result = await executeBashScript('specify');
    if (result.status === 'success') {
      const template = await parseCommandTemplate('templates/commands/specify.md');
      console.log(template.content);
      console.log(JSON.stringify(result, null, 2));
    }
  });

// 其他命令类似...
```

### Phase 5: 清理和测试 (1小时)

1. **删除不需要的文件**
2. **更新 package.json**
3. **更新 README.md**
4. **测试所有命令**

## Impact - 影响分析

### 用户影响

**Breaking Changes:**
- ⚠️ 命令使用方式改变（从 CLI 参数到 Slash Command）
- ⚠️ 不再支持纯命令行交互（需要 AI 助手）
- ⚠️ 版本从 0.4.0 跳到 1.0.0

**Migration Path:**
```bash
# 旧方式（不再支持）
storyboardify generate --mode coach

# 新方式（在 Claude/Cursor 中）
/generate-coach
```

### 开发影响

**优势：**
- ✅ 架构统一（与 Scriptify 一致）
- ✅ 维护成本降低（Markdown > TypeScript）
- ✅ 迭代速度加快（改模板即可）
- ✅ AI 可深度参与

**劣势：**
- ⚠️ 依赖 AI 助手（不能独立使用）
- ⚠️ 需要重新学习使用方式

### 技术影响

**代码量变化：**
- 删除：~2000行 TypeScript
- 新增：~500行 Bash + 1000行 Markdown
- 净减少：~500行代码

**依赖变化：**
- 移除：inquirer, ora
- 新增：无（使用系统 bash）

## Risks - 风险

### 技术风险

1. **Bash 脚本兼容性**
   - 风险：macOS/Linux 兼容性
   - 缓解：使用 POSIX 标准语法
   - 备选：提供 PowerShell 版本

2. **AI 依赖**
   - 风险：必须在 AI 助手中使用
   - 缓解：明确定位为"AI 辅助工具"
   - 备选：保留简单的 Express 模式 CLI

### 迁移风险

1. **用户适应**
   - 风险：v0.4 用户需要重新学习
   - 缓解：提供详细迁移指南
   - 策略：发布 v1.0.0，明确标注 Breaking Change

2. **功能丢失**
   - 风险：某些交互功能暂时无法实现
   - 缓解：AI 引导可以更灵活
   - 策略：分阶段迁移功能

## Success Criteria - 成功标准

### 必达目标 (P0)

- [ ] 所有核心命令可用（specify/import/preproduce/generate/export）
- [ ] Bash 脚本正确输出 JSON
- [ ] Markdown 模板提供清晰指令
- [ ] CLI 入口正确调用脚本和显示模板
- [ ] 能通过 `npm run build` 编译
- [ ] 至少一个完整流程测试通过

### 期望目标 (P1)

- [ ] 提供 PowerShell 版本（Windows 支持）
- [ ] 更新所有文档
- [ ] 提供迁移指南
- [ ] 示例项目更新

### 可选目标 (P2)

- [ ] 保留 Express 模式的纯 CLI 版本
- [ ] AI 助手配置自动生成
- [ ] 视频教程

## Timeline - 时间规划

| 阶段 | 时间 | 可交付物 |
|------|------|----------|
| Phase 1: 准备 | 30min | 目录结构 + 基础文件 |
| Phase 2: Bash 脚本 | 1.5h | 5个核心脚本 |
| Phase 3: Markdown 模板 | 2h | 7个指令模板 |
| Phase 4: CLI 重构 | 1h | 新的 cli.ts |
| Phase 5: 清理测试 | 1h | 可用的 v1.0.0 |
| **总计** | **6h** | **完整重构** |

## Next Steps - 下一步

1. ✅ 批准此提案
2. 创建 `templates/commands/` 目录
3. 创建 `scripts/bash/` 目录
4. 从 Scriptify 复制基础设施
5. 逐个实现核心功能
6. 测试和文档
7. 发布 v1.0.0

---

**提案人**: AI Assistant
**创建时间**: 2025-10-31
**预期完成**: 2025-10-31

