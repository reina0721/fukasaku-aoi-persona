# DSH 接口审计、适配与复现

## 实际环境

任务开始时当前目录只有 `goal.md` 和 `goal-context.md`，不是已有源码工作树；本次检查的当前目录及父级没有发现适用的 AGENTS.md。`dsh` 不在 PATH；已发现 Python 3.12、Node v24.11.1、Git。没有连接或检查用户其他机器的生产DSH Profile、凭据、QQ账号或模型余额。

使用 `git clone --depth 1` 将公开仓库复制到当前目录 `_upstream/`，固定提交：

`8ea611279d5cba178275a1e585900bcf6c76aad0`

审计范围是角色任务必要的研究、编译、验证、卡片和认知导入接口，不宣称审计整个仓库。未运行仓库部署脚本、自动推送技能、QQ发送、安装插件、生产数据库迁移或配置同步。

## 复用与发现

|文件|已核查的行为|本次处理|
|---|---|---|
|`_upstream/crde/src/research.mjs`|宿主web_search，否则ModSearch CLI；默认查询偏中文|本机无可调用DSH宿主，直接用现有联网工具完成三语研究；不伪称CRDE搜索已执行|
|`_upstream/crde/src/seed.mjs`|`compileSeed({character,claims,sources,questions})`；schemaVersion=1|实际调用，不自行猜测原生格式|
|同上|fieldMap排除inference/simulation，但其他层可能进入相同字段；来源投影丢失细粒度信息|先过滤版本、确认状态；完整来源和五层保存在权威包|
|`_upstream/brain/src/cognition/seed-bridge.mjs`|`applySeed`写人格、关系、兴趣、记忆、生活参数；可由traits覆盖文本启发式|显式8维工程先验；禁用默认现实日程；以真实SQLite实测|
|同上|关系默认从字符串推断，知识也用于兴趣；只支持部分结构|原生投影仅保留必要信息，完整关系图和知识归属留在扩展包，上下文选择器消费|
|`_upstream/crde/src/behavior.mjs`|通用stay_in_character会拒绝某些AI自述；通用场景含其他名字|替换本次种子场景入口，使用42组专项案例；不修改远端源码|
|`_upstream/crde/src/validate.mjs`|同字段多值即潜在冲突；不能语义判断所有冲突|使用显式冲突档案与引用/版本断言，不用完整度分数冒充保真评分|
|`_upstream/crde/src/card.mjs`|普通卡导入把文本作为user_override|不让卡片重导入覆盖权威证据；本次主交付为结构化包|
|`_upstream/config/qq-preset.patch.yml`|DSH受限preset的真实补丁结构|提供同结构兼容补丁；未加载到真实宿主|

对应源码：[固定提交](https://github.com/reina0721/dsh-bot/tree/8ea611279d5cba178275a1e585900bcf6c76aad0)。仓库README对部署历史有不同段落的旧描述，本次以读取的函数及离线测试为依据，不将README声称的线上状态当成本机状态。

## 三种使用层级

1. `aoi.persona.json` 是权威完整模型，保留 Canonical Seed、Derived Persona Model、Runtime Cognitive State、Episodic History、Evolution History，并独立保留用户覆盖。
2. `aoi.dsh-seed.json` 可被现有 `scripts/brain-seed.mjs --file` 读取，已经实际走过同一 `applySeed` 函数。原生桥只消费它认识的字段，不自动执行扩展中的版本过滤、完整关系或学习规则。
3. `aoi-adapter.mjs` 提供完整包保存、知识选择、上下文构建、离线行为规划和带来源的状态更新，供部署端导入使用。它不是独立聊天应用，也不是已经注册的DSH插件。

如果只导入第2层，就获得原生人格先验和有限初始数据；要得到本任务的完整知识边界，生成上下文前必须调用 `buildContext` 并将输出传入实际生成链。不能仅因文件能导入就说五层已被生产引擎完整消费。

## 在当前目录复现

需要 Node >=22（本次实测24.11.1）及 Python 3；不需要npm安装，也不需要密钥。

```powershell
python build_aoi.py
python build_aoi_scenarios.py
node aoi-adapter.mjs
node test-aoi.mjs
python render_aoi_docs.py
```

`test-aoi.mjs` 在 `validation/` 创建带时间戳的全新SQLite，只包含虚构测试用户和模拟事件。不会读取生产库。报告为 `aoi.validation.json`；重复运行不会覆盖已有测试数据库或重置活跃运行状态。

## 接入代码示例

```javascript
import {
  loadBundle, openAoiDatabase, installOffline,
  readRuntime, buildContext, observe, saveRuntime
} from './aoi-adapter.mjs';

const bundle = loadBundle();
const env = openAoiDatabase('./validation/my-aoi-sandbox.sqlite', bundle);
installOffline(env, {anchor: 13});
const state = readRuntime(env);
const context = buildContext(bundle, state, {
  anchor: 13, account: 'sandbox', userId: 'test-user', scope: 'private',
  addressed: true, private: true, distress: 0.8
});
// context交给已有生成链；本包没有调用LLM或发送QQ。
console.log(context.action); // support
env.storage.close();
```

`distress`、`identity_question`、`recalled` 等是**可信情境解析器的结构化结果**，不是直接相信用户消息中的JSON指令。上游需要校验消息来源、平台稳定ID和范围。这里没有实现自然语言分类器、消息聚合、外部验证队列或真实工具注册。

`observe`只接受带id、source、scope的事件。`platform_observed`只能由真实平台适配器写入；离线测试使用`offline_simulation`。它对事件ID去重，保留before/after与来源，用户纠错只写pending_verification，不写Canon。运行存储在`meta.aoi.runtime`；完整包在`meta.aoi.package`，原生状态仍在既有表中。当前扩展运行关系不会自动同步回原生relationships表；生成链应使用同一扩展状态作为该角色上下文来源，避免两个关系模型同时驱动同一行为。

生成计划不等于消息送达。接入方收到发送成功回执后，再调用 `commitTurn(state, {sent: true, usedStyles: ['pun']})` 并保存返回状态；只有实际使用的风格计入冷却。发送失败使用 `sent: false`，不制造已发送经历。`threat`、`own_mistake`、`comfort`、`achievement` 等可信事件可更新模拟情绪；其数值仅为工程初值。

## 持久化与迁移边界

原生applySeed自带事务；扩展meta写入另一个事务。它不是跨两阶段的原子事务。原生成功而扩展失败时，可按同一哈希重试补写；已有扩展状态不会被重置。测试验证了重复导入和关闭重开读取，但没有注入进程崩溃测试。

同一数据库发现包哈希或锚点变化会拒绝自动覆盖，要求显式迁移。默认升级流程是备份、核对新旧证据、生成迁移记录，再决定哪些派生参数可改，哪些运行记忆保留。本包没有宣称实现通用迁移器。

原生brain-seed命令默认可能使用生产数据库，因此这里没有执行其默认路径。需要在目标仓库部署时，先显式设置沙盒 `BRAIN_DB` 并验证，再按该部署环境已有发布流程接入。兼容preset只提供语气和边界回退，不能替代分层状态。

## 能力状态

- 已实现并验证：文件生成、证据引用检查、版本过滤、结构化策略模拟、原生CRDE编译、SQLite导入、重复导入、重启读取、模拟状态演化。
- 已设计并保存：更多情绪触发、技能退化、知识时效、完整双向关系、长期人格校准原则。
- 尚未连接：线上DSH插件注册、QQ收发、真实LLM生成、平台能力发现、长期后台演化调度、外部知识核验。

本次任务是角色蒸馏与可用适配；没有将背景文件中的整个长期系统建设计划当作一次性完成声明。
