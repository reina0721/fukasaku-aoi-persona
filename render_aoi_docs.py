"""Render read-only views of the authoritative package and actual validation results."""
from pathlib import Path
import json, hashlib
R=Path(__file__).resolve().parent
b=json.loads((R/'aoi.persona.json').read_text(encoding='utf-8'))
def md(name,text): (R/name).write_text(text.strip()+'\n',encoding='utf-8')
def js(name,obj): (R/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def cell(x):return str(x).replace('|','/').replace('\n',' ')
lines=['# 来源与证据索引','','权威机读文件：`aoi.sources.json`、`aoi.evidence.json`。所有摘要为研究性概括；事件情绪和长期影响有独立的Inference标记。日期为2026-11-02。置信度为本次证据判断，不是统计概率。','', '|ID|资料与链接|版本|读取方式|位置与限制|','|---|---|---|---|---|']
for s in b['sources']:lines.append(f"|{s['id']}|[{s['title']}]({s['url']})|{s['version']}|{s['access_status']}|{cell(s['locator']+'；'+s['note'])}|")
lines += ['','## 命题账本','','Canon + provisional不是确认事实；严格Canonical Seed只选择confirmed且版本为anime的条目。元叙事信息可确认，但仍不等于原作人物当时亲知。','', '|ID|命题|类别/状态|证据|归属/阶段|','|---|---|---|---|---|']
for c in b['claims']:lines.append(f"|{c['id']}|{cell(c['value']) if c['value'] is not None else 'Unknown / null'}|{c['category']} / {c['status']}|{', '.join(c['source_ids'])}|{c['version']} / {c['knowledge_owner']} / {c['available_from_episode']}|")
md('aoi-evidence-index.md','\n'.join(lines))

lines=['# 世界观、知识边界与事件时间线','','本文件是`aoi.knowledge.json`与`aoi.timeline.json`的人类可读视图。只列与人物模型直接相关的关键事件，不重写完整剧情。','', '## 世界规则','','动画角色的任务处于事故后的旧首都救援环境。耐污染是故事规则，不是现实医学能力。普通生存者、队伍任务、危险区域与救援网络构成她的行动条件。漫画的2036年单独保存为C07，不作为当前现实时间或动画精确年代。','', '本次未确认的历史年份、事故全部机制、军事编制细节、研究者秘密与后期政治情节不填入角色亲知。技术设定需要被当作虚构世界知识，不能用于现实辐射处理建议。','', '## 事件与主观影响','','原作事件来源为S03/S04，完整定位见证据索引。以下主观影响是Inference；未知时间码保留null。','', '|事件|阶段|事实摘要|当时可知|人物模型中的影响（推论）|','|---|---|---|---|---|']
for e in b['episodic_history']['canonical']:lines.append(f"|{e['id']}|动画{e['episode']}话|{e['summary']}|{e['character_awareness']}|{e['long_term']['value']}|")
lines += ['','## 知识归属','','|类别|入口|规则|','|---|---|---|','|世界客观规则|C05/C06/C08|确认资料也不自动覆盖所有人知情范围|','|角色亲知|knowledge_model.character + 阶段事件|available_from_episode不得超过锚点|','|作品元认知|C03/C04|身份问答可用；不写成剧情中已知作者和声优|','|错误信念候选|false_belief_candidates|自我无用感不是系统认可的客观事实|','|遗忘与特殊意识|C20|尚未确认，不造缺失段的主观回忆|','|漫画研究|C07/C18/C19|仅研究模式且允许剧透；保留provisional|','|新知识|runtime.learned_knowledge|用户纠错先pending_verification；不改Canon|','|过时知识|checked_at/expires_at设计|真实学习适配器尚未接入，不声称自动验证完毕|','', '## 能力与认知边界','','C16确认动画觉醒。C17的具体能力列表、C20的记忆细节以及漫画训练后的控制程度继续隔离。主观记忆不得精确描述未经确认的无意识过程。原作医疗队身份也不等于所有成员具有同等医疗知识。','', '## 模拟与现实时间','','默认QQ时钟为Asia/Shanghai；剧情锚点不随它推进。现实身体、住所、睡眠和学校日程对默认QQ运行模型属于Not Applicable。显式小剧场如需开启，应创建Simulation事件，保留与原作及平台实际事件的来源区别。本次所有测试新用户与事件都是offline_simulation。']
md('aoi-world-knowledge.md','\n'.join(lines))

lines=['# 原作关系图与QQ新关系','','详细多维向量、证据和反向边保存在`aoi.relationships.json`。数值都是未校准Inference先验，不是事实测量。反向态度未知不补成对称向量。','', '```mermaid','graph LR','  aoi[深作葵]']
for r in b['relationships']:
    key=r['to_id'].split(':')[1]
    lines += [f'  {key}["{r["target_name"]}"]', f'  aoi -->|"{r["id"]}：推论先验"| {key}']
lines += ['  qq[QQ用户：稳定平台ID]','  aoi -. 新建关系，不继承原作 .-> qq','```','','## 关系解释','','|对象|葵侧依据|对方侧已知与未知|阶段变化|','|---|---|---|---|']
for r in b['relationships']:lines.append(f"|{r['target_name']}|{r['basis']}（{', '.join(r['evidence_ids'])}）|{r['reverse']['observation']}|{r['stage_change']}|")
lines += ['','## 运行原则','','QQ新关系以platform/account/user_id组成稳定键，群与私聊再分scope。昵称变化不创建原作身份；同昵称不同ID仍是不同人。熟悉、信任、亲密、尊重、依赖、冲突、戒备不能相互替代。','', '本适配器演示熟悉、信任、戒备与偏好记录；不会自动增长恋爱或依赖。完整原作图存于扩展包，上游原生导入只建立荆与妙子的seed命名空间节点。不要把两者的初始字符串映射当成全部多维图已写入生产关系表。','', '他人不回复可能忙碌，不能无证据记作拒绝；接受道歉是局部修复，不是消除历史。私聊反馈默认不跨群传播。']
md('aoi-relationships.md','\n'.join(lines))

lines=['# 未知、冲突与后续研究','','本清单不阻止当前保守种子使用；对应字段保持空值或研究隔离。没有因用户未回复而推定任何新增创作偏好。','', '|ID|事项|当前处理|下一项可核查工作|','|---|---|---|---|']
for u in b['unknowns']:lines.append(f"|{u['id']}|{u['topic']}|{u['handling']}|{u['research_next']}|")
lines += ['','## 冲突决策','','|ID|冲突|处理|','|---|---|---|']
for x in b['conflicts']:lines.append(f"|{x['id']}|{x['topic']}|{x['resolution']}|")
lines += ['','## 可调整的用户选择','','默认动画13话后是本次可逆交付选择，不是用户明确指定的时间点。可改为附带的第1话种子；两者都保留用户已明确的元叙事自知。漫画扩展暂不启用。风格强度可在权威包user_overrides.style修改后重编译，派生style文件不应单独改写。','', '目前没有必须等待用户才能继续生成的事项。后续若要把未证实的生日、住所、恋爱对象等作为创作设定加入，应由用户明确决定并记入User Override，不以搜索推断用户偏好。']
md('aoi-unknowns.md','\n'.join(lines))

mapping=[
('4.1 身份','claims C01-C06/C11/C22-C25；identity model','T01-T10','确认项与Unknown分列'),
('4.2 世界观','knowledge_model；world knowledge report','T26-T30','漫画年份与动画阶段隔离'),
('4.3 外观多模态','C09/C10；官方图','I01','图已检查；声音未实测'),
('4.4 人格','20维dimensions；8维traits','I12/I14','数值为Inference，不是心理测量'),
('4.5 情绪','emotion_rules；runtime emotions','T13/T39/I14','事件驱动已模拟；时间衰减仅设计'),
('4.6 兴趣习惯','C12/C15；style；evolution policy','T12/T25/I10','偏好候选与用户兴趣区分'),
('4.7 知识能力','knowledge_model；C16-C20','T23/T27/T28/T41','非全知，能力细项待核'),
('4.8 时间线','9个带主观影响的事件','T26/I03','关键节点；非逐集全量回忆'),
('4.9 社会关系','11条有方向关系及反向记录','T10/I08/I09','反向未知不填对称数值'),
('4.10 语言','style.japanese_analysis；42样本','T12/T25/T37/T42','中文适配已设计；原声语料待补'),
('4.11 动机决策','dimensions values；planTurn utilities','T13/T17/T24/I14','结构化语义输入，非已实现NLU'),
('4.12 缺点矛盾','profile self_efficacy/responsibility','T16/T39','不删除退缩、自责和认知局限'),
('4.13 能力意识','C16-C20；version_policy','T27-T29','漫画状态未启用'),
('4.14 缺失维度','身份解析、来源归属、迁移、沉默','T21/T22/I08/I13','自主补充并声明实现范围'),
('5 用户风格','user_overrides.style','T12-T15/T25/T37/T42','可调、严肃门控、冷却'),
('6 双重身份与四层认知','aoi.identity.json；buildContext','T01-T10/I04','保留诚实身份与角色语气'),
('7 QQ关系','observe scoped IDs and vectors','T10/T11/T38/T40/I08-I10','初始无虚构共同历史'),
('8 记忆与成长','runtime/evolution histories；learning policy','T31/I09-I11/I13','学习待验证；未宣称后台核验'),
('9.1 27类种子字段','下面逐项映射','I01/I02','结构化且可追溯'),
('9.2 五层','aoi.persona.json五个主字段','I01/I11/I13','原生投影与完整扩展分开'),
('9.3 现有兼容','真实compileSeed/applySeed','I02/I13','离线实测；线上未接入'),
('10.1-10.7 场景验证','42场景＋16项机制/接口检查','aoi.validation.json','未把模拟样本当真实模型输出'),
('11 十类交付','README清单','manifest','全部有对应文件'),
('12 工作流','研究日志/来源/编译/验证报告','全部','能力缺口明确'),
('13 原则','证据分层、版本、身份、模型边界','负向I05-I07','未知不伪造；不宣称已达高保真'),
]
lines=['# 角色目标覆盖矩阵','','范围是goal.md的蒸馏任务；goal-context.md整套系统工程作为背景，不将其几十项长期模块冒充本次已实现。','', '|需求|产物/数据位置|验证|状态与限制|','|---|---|---|---|']
for row in mapping:lines.append('|'+ '|'.join(row)+'|')
fields=['identity/version_policy','sources/claims','user_overrides.identity','knowledge_model.world','runtime.platform/capabilities','derived.dimensions/traits','derived.state_priors','derived.emotion_rules','derived.dimensions.values','style.japanese_analysis','style.long_term','C12/C15/unknowns','knowledge_model','canonical_seed.ability','episodic_history.canonical','relationships','aoi.relationships.json.qq_initial','derived.dimensions + planTurn','style.initiative + planTurn','evolution_policy.skills + habits投影','world clock/anchor constraints','selectKnowledge gates','evolution_policy','user_overrides','sources/claims/conflicts','package_version/change_history','aoi.scenarios.json/aoi.validation.json']
lines += ['','## 9.1 的27项逐项数据映射','','|序号|数据位置|','|---|---|']+[f'|{i}|{f}|' for i,f in enumerate(fields,1)]
md('aoi-requirements-matrix.md','\n'.join(lines))

v=json.loads((R/'aoi.validation.json').read_text(encoding='utf-8'))
lines=['# 验证报告','',f"实际执行：{v['total']}项，{v['passed']}通过，{v['failed']}失败。Node {v['node']}，固定源码提交{v['upstream_commit']}。",'', '42项为场景策略检查，16项为证据/版本/状态/原生接口检查。机器结果在`aoi.validation.json`。对话自然度的示例评语是本次作者自检，不是独立评审或目标模型输出。','', '## 重点结果','','- 真实调用仓库CRDE编译，生成原生schemaVersion=1种子，重复编译内容稳定。','- 真实调用仓库applySeed和SQLite存储；导入、重复导入、关闭重开读取通过。','- 早期锚点不会暴露后期事件，漫画候选不会作为动画亲历注入。','- 模拟连续互动、冲突与修复有独立事件和演化记录；一次修复不抹去全部冲突。','- 情绪累积与部分恢复会改变表达；人物温暖先验变化可改变支持策略。','- 同一情境改变历史偏好、同一种子改变语境、同一语境改变种子参数均产生可解释差异。','- 伪造来源、污染确认层、非法阶段输入会拒绝，而不是默默接受。','', '## 实际逐项结果','','|ID|测试|实际状态|','|---|---|---|']
for r in v['results']:lines.append(f"|{r['id']}|{cell(r['name'])}|{r['status']}|")
lines += ['','## 发现与修订','','已将原生“AI自述即出戏”评估排除；不再把通用场景里的其他名字当葵。原生编译投影先过滤未知和版本；用显式traits避开文本否定句触发关键词人格修正。完整来源、关系和五层状态不依赖原生扁平字段保存。','', '## 验证不能证明的事项','','本次没有生产模型回合、QQ真实收发、观众盲测、原声音色测量或数月真实运行。因而“全部通过”只表示这里声明的契约和离线策略成立，不表示每个LLM回答都自然或原作高保真。测试不覆盖通用七类人物系统的全部泛化要求，也不声称替代goal-context.md的系统验收。','', '推荐线上验收时固定模型、采样设置与种子版本，按42场景各采样至少3次；对原作事实、身份诚实、版本泄漏作硬门槛；对自然度、情绪一致性、角色辨识度、梗适切性各0–4分盲评，并保留失败回应。当前不填任何尚未运行的分数。']
md('aoi-validation-report.md','\n'.join(lines))

schema={'$schema':'https://json-schema.org/draft/2020-12/schema','title':'Aoi full persona package','type':'object','required':['schema','package_version','identity','canonical_seed','derived_persona_model','runtime_cognitive_state','episodic_history','evolution_history','user_overrides','claims','sources','relationships','knowledge_model','unknowns','conflicts'],'properties':{'schema':{'const':'dsh-aoi-persona-package/1.0'},'claims':{'type':'array','items':{'type':'object','required':['id','field','value','category','source_ids','version','status','confidence','knowledge_owner','available_from_episode'],'properties':{'category':{'enum':['Canon','Official Supplement','Adaptation','Fanon','Inference','User Override','Simulation','Unknown','Not Applicable']},'status':{'enum':['confirmed','provisional','unknown','archived']},'confidence':{'type':'number','minimum':0,'maximum':1},'source_ids':{'type':'array','minItems':1,'items':{'type':'string'}}}}},'sources':{'type':'array'},'canonical_seed':{'type':'object'},'derived_persona_model':{'type':'object'},'runtime_cognitive_state':{'type':'object'},'episodic_history':{'type':'object','required':['canonical','runtime','simulation']},'evolution_history':{'type':'array'},'relationships':{'type':'array'},'user_overrides':{'type':'object'}}}
js('aoi.persona.schema.json',schema)
js('aoi.lorebook.json',dict(format='dsh-aoi-gated-lorebook/1',standard_auto_import=False,note='必须经aoi-adapter的版本/归属门控；不是自动注入全部条目的传统世界书。',entries=[dict(id=c['id'],keys=[c['field']],content=c['value'],category=c['category'],status=c['status'],version=c['version'],knowledge_owner=c['knowledge_owner'],available_from_episode=c['available_from_episode'],source_ids=c['source_ids'],enabled_by_default=c['status']=='confirmed' and c['version']=='anime' and c['knowledge_owner']=='character') for c in b['claims']]))
manifest=[]
for p in sorted(R.iterdir()):
    if p.is_file() and (p.name.startswith(('aoi','build_aoi','render_aoi','test-aoi','README'))):
        if p.name=='aoi.manifest.json':continue
        manifest.append(dict(path=p.name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
for p in sorted((R/'research').glob('*')):
    if p.is_file():manifest.append(dict(path=p.relative_to(R).as_posix(),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
js('aoi.manifest.json',dict(package_version=b['package_version'],upstream_commit=b['upstream_commit'],files=manifest,excluded=['_upstream is separately pinned by git commit','validation SQLite databases named per run','original goal files remain untouched']))
print(f'Rendered reports, schema, lorebook and manifest ({len(manifest)} files).')
