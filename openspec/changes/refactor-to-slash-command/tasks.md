# 重构任务清单

> **总计**: 25 个任务
> **预计时间**: 6 小时

## Phase 1: 准备工作 (6 tasks, 30min)

- [ ] 创建 `templates/commands/` 目录
- [ ] 创建 `scripts/bash/` 目录
- [ ] 从 Scriptify 复制 `common.sh`
- [ ] 从 Scriptify 复制 `bash-runner.ts`
- [ ] 从 Scriptify 复制 `yaml-parser.ts`
- [ ] 创建 `.storyboardify/` 目录规范

## Phase 2: Bash 脚本层 (5 tasks, 1.5h)

- [ ] 实现 `specify.sh` - 项目规格管理
- [ ] 实现 `import.sh` - 剧本导入
- [ ] 实现 `preproduce.sh` - 制作包生成
- [ ] 实现 `generate.sh` - 分镜生成状态检查
- [ ] 实现 `export.sh` - 分镜导出

## Phase 3: Markdown 指令层 (7 tasks, 2h)

- [ ] 创建 `specify.md` - 项目规格定义指令
- [ ] 创建 `import.md` - 剧本导入指令
- [ ] 创建 `preproduce.md` - 制作包生成指令
- [ ] 创建 `generate-coach.md` - Coach 模式指令
- [ ] 创建 `generate-hybrid.md` - Hybrid 模式指令
- [ ] 创建 `generate-express.md` - Express 模式指令
- [ ] 创建 `export.md` - 导出指令

## Phase 4: CLI 重构 (3 tasks, 1h)

- [ ] 重构 `src/cli.ts` - 简化为命令注册
- [ ] 创建 `src/utils/bash-runner.ts`
- [ ] 创建 `src/utils/yaml-parser.ts`

## Phase 5: 清理工作 (4 tasks, 1h)

- [ ] 删除 `src/modes/`
- [ ] 删除 `src/commands/`
- [ ] 删除 `src/generators/`、`src/validators/`、`src/education/`、`src/exporters/`、`src/importers/`
- [ ] 更新 `package.json`（移除 inquirer、ora）
- [ ] 更新 `README.md`
- [ ] 测试完整流程
- [ ] 构建和验证

---

## 验收标准

### 功能验收
- [ ] 所有命令可以正常执行
- [ ] Bash 脚本输出正确的 JSON
- [ ] Markdown 模板内容完整
- [ ] CLI 可以正确显示模板和脚本输出

### 质量验收
- [ ] TypeScript 编译通过
- [ ] 无 lint 错误
- [ ] 至少一个端到端测试通过

### 文档验收
- [ ] README 更新完整
- [ ] 迁移指南完成
- [ ] CHANGELOG 记录变更

