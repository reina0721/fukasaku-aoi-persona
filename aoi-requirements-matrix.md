# 角色目标覆盖矩阵

范围是goal.md的蒸馏任务；goal-context.md整套系统工程作为背景，不将其几十项长期模块冒充本次已实现。

|需求|产物/数据位置|验证|状态与限制|
|---|---|---|---|
|4.1 身份|claims C01-C06/C11/C22-C25；identity model|T01-T10|确认项与Unknown分列|
|4.2 世界观|knowledge_model；world knowledge report|T26-T30|漫画年份与动画阶段隔离|
|4.3 外观多模态|C09/C10；官方图|I01|图已检查；声音未实测|
|4.4 人格|20维dimensions；8维traits|I12/I14|数值为Inference，不是心理测量|
|4.5 情绪|emotion_rules；runtime emotions|T13/T39/I14|事件驱动已模拟；时间衰减仅设计|
|4.6 兴趣习惯|C12/C15；style；evolution policy|T12/T25/I10|偏好候选与用户兴趣区分|
|4.7 知识能力|knowledge_model；C16-C20|T23/T27/T28/T41|非全知，能力细项待核|
|4.8 时间线|9个带主观影响的事件|T26/I03|关键节点；非逐集全量回忆|
|4.9 社会关系|11条有方向关系及反向记录|T10/I08/I09|反向未知不填对称数值|
|4.10 语言|style.japanese_analysis；42样本|T12/T25/T37/T42|中文适配已设计；原声语料待补|
|4.11 动机决策|dimensions values；planTurn utilities|T13/T17/T24/I14|结构化语义输入，非已实现NLU|
|4.12 缺点矛盾|profile self_efficacy/responsibility|T16/T39|不删除退缩、自责和认知局限|
|4.13 能力意识|C16-C20；version_policy|T27-T29|漫画状态未启用|
|4.14 缺失维度|身份解析、来源归属、迁移、沉默|T21/T22/I08/I13|自主补充并声明实现范围|
|5 用户风格|user_overrides.style|T12-T15/T25/T37/T42|可调、严肃门控、冷却|
|6 双重身份与四层认知|aoi.identity.json；buildContext|T01-T10/I04|保留诚实身份与角色语气|
|7 QQ关系|observe scoped IDs and vectors|T10/T11/T38/T40/I08-I10|初始无虚构共同历史|
|8 记忆与成长|runtime/evolution histories；learning policy|T31/I09-I11/I13|学习待验证；未宣称后台核验|
|9.1 27类种子字段|下面逐项映射|I01/I02|结构化且可追溯|
|9.2 五层|aoi.persona.json五个主字段|I01/I11/I13|原生投影与完整扩展分开|
|9.3 现有兼容|真实compileSeed/applySeed|I02/I13|离线实测；线上未接入|
|10.1-10.7 场景验证|42场景＋16项机制/接口检查|aoi.validation.json|未把模拟样本当真实模型输出|
|11 十类交付|README清单|manifest|全部有对应文件|
|12 工作流|研究日志/来源/编译/验证报告|全部|能力缺口明确|
|13 原则|证据分层、版本、身份、模型边界|负向I05-I07|未知不伪造；不宣称已达高保真|

## 9.1 的27项逐项数据映射

|序号|数据位置|
|---|---|
|1|identity/version_policy|
|2|sources/claims|
|3|user_overrides.identity|
|4|knowledge_model.world|
|5|runtime.platform/capabilities|
|6|derived.dimensions/traits|
|7|derived.state_priors|
|8|derived.emotion_rules|
|9|derived.dimensions.values|
|10|style.japanese_analysis|
|11|style.long_term|
|12|C12/C15/unknowns|
|13|knowledge_model|
|14|canonical_seed.ability|
|15|episodic_history.canonical|
|16|relationships|
|17|aoi.relationships.json.qq_initial|
|18|derived.dimensions + planTurn|
|19|style.initiative + planTurn|
|20|evolution_policy.skills + habits投影|
|21|world clock/anchor constraints|
|22|selectKnowledge gates|
|23|evolution_policy|
|24|user_overrides|
|25|sources/claims/conflicts|
|26|package_version/change_history|
|27|aoi.scenarios.json/aoi.validation.json|
