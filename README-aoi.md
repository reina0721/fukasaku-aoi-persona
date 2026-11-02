# 深作葵 · DSH 角色蒸馏包

本次成果位于当前目录。默认采用**动画第13话后**，另附第1话种子；用户要求的中二、谐音、活泼和角色/QQ双重身份自知独立保存。漫画特殊意识及未核实细节没有混入确认的动画记忆。

先读 [研究报告](aoi-research-report.md) 与 [人物画像](aoi-persona-profile.md)，使用前读 [接入说明](aoi-integration.md)。原始 `goal.md` 和 `goal-context.md` 保留。

## 核心交付

|内容|文件|
|---|---|
|完整五层人物种子（权威数据）|[aoi.persona.json](aoi.persona.json)|
|现有DSH/brain原生兼容种子|[aoi.dsh-seed.json](aoi.dsh-seed.json)、[第1话版本](aoi.dsh-seed.episode1.json)|
|来源、证据、冲突|[证据索引](aoi-evidence-index.md)、aoi.sources.json、aoi.evidence.json|
|人格与情绪分析|[人物画像](aoi-persona-profile.md)、种子derived_persona_model|
|方向性关系图谱|[关系报告](aoi-relationships.md)、aoi.relationships.json|
|世界、知识与经历|[世界知识报告](aoi-world-knowledge.md)、aoi.knowledge.json、aoi.timeline.json|
|身份、平台与风格|aoi.identity.json、aoi.style.json、aoi.runtime.initial.json|
|42组模拟对话与场景|[对话样本](aoi-dialogue-samples.md)、aoi.scenarios.json|
|实际测试结果|[验证报告](aoi-validation-report.md)、aoi.validation.json|
|未知与后续研究|[未知清单](aoi-unknowns.md)、aoi.unknowns.json|
|需求覆盖与内容校验|[覆盖矩阵](aoi-requirements-matrix.md)、aoi.manifest.json|
|可运行适配器和测试|aoi-adapter.mjs、test-aoi.mjs|
|辅助兼容资料|aoi.preset.patch.yml、aoi.lorebook.json、aoi.persona.schema.json|

`_upstream/` 是为接口检查下载的固定提交源码，不是已部署服务。`research/` 保存实际检查过的官方设定参考图；`validation/` 保存仅含模拟数据的离线测试数据库。所有产物均在当前目录及其子目录内。

## 验证与使用

```powershell
node test-aoi.mjs
```

已实际验证CRDE编译、SQLite导入、持久化、知识门控和多轮状态规则。对话示例是本次创作的Simulation参考，不是原作台词或生产模型的输出。角色自然度与长期线上表现尚待部署模型实测。

原生种子可供仓库导入函数使用；完整分层知识与关系需要接入 `aoi-adapter.mjs` 的上下文构建。仅加载preset不会自动得到这些认知能力。没有修改线上DSH、QQ或生产数据库。

## 依赖与修改顺序

`build_aoi.py → aoi.persona.json → aoi-adapter.mjs → 原生种子/上下文`

`build_aoi_scenarios.py → 场景/模拟样本 → test-aoi.mjs → 实际验证结果`

`权威种子 + 实际验证结果 → render_aoi_docs.py → 报告/Schema/世界书/Manifest`

需要修改设定时更新构建输入或权威包，并同步投影；不要单独改style等投影文件后误以为运行包已经更新。运行记忆与演化记录不得回填为原作事实。版本迁移规则详见接入说明。
