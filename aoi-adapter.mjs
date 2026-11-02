/** Aoi data adapter. No network, no QQ send, no production deployment. Node >=22. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { compileSeed } from './_upstream/crde/src/seed.mjs';
import { applySeed } from './_upstream/brain/src/cognition/seed-bridge.mjs';
import { createStorage } from './_upstream/brain/src/core/storage.mjs';
import { createPersona } from './_upstream/brain/src/state/persona.mjs';
import { createMemory } from './_upstream/brain/src/state/memory.mjs';
import { createRelationships } from './_upstream/brain/src/state/relationships.mjs';
import { createSkills } from './_upstream/brain/src/state/skills.mjs';
import { createHabits } from './_upstream/brain/src/state/habits.mjs';

const root=fileURLToPath(new URL('.',import.meta.url));
export const loadBundle=()=>JSON.parse(readFileSync(resolve(root,'aoi.persona.json'),'utf8'));
const jsonWrite=(name,x)=>writeFileSync(resolve(root,name),JSON.stringify(x,null,2)+'\n');
const clone=x=>structuredClone(x);
const clamp=x=>Math.max(0,Math.min(1,x));
const validAnchor=n=>{if(!Number.isInteger(n)||n<1||n>13)throw Error('Anime anchor must be 1..13');return n;};
export function verifyBundle(b){
  if(b.schema!=='dsh-aoi-persona-package/1.0')throw Error('Unsupported package schema');
  const sources=new Set(b.sources.map(x=>x.id));
  const evidence=new Set([...sources,...b.claims.map(x=>x.id),...b.episodic_history.canonical.map(x=>x.id)]);
  if(evidence.size!==sources.size+b.claims.length+b.episodic_history.canonical.length)throw Error('Duplicate evidence IDs');
  for(const c of b.claims){
    if(!c.source_ids.length||c.source_ids.some(id=>!sources.has(id)))throw Error(`Unresolved source ${c.id}`);
    if(c.confidence<0||c.confidence>1)throw Error(`Invalid confidence ${c.id}`);
  }
  for(const e of b.episodic_history.canonical) if(e.source_ids.some(id=>!sources.has(id)))throw Error(`Bad event source ${e.id}`);
  for(const d of b.derived_persona_model.dimensions)if(d.evidence_ids.some(id=>!evidence.has(id)))throw Error(`Bad model evidence ${d.id}`);
  for(const r of b.relationships)if([...r.evidence_ids,...r.reverse.evidence_ids].some(id=>!evidence.has(id)))throw Error(`Bad relation evidence ${r.id}`);
  for(const id of b.canonical_seed.claim_ids){const c=b.claims.find(x=>x.id===id);if(!c||c.status!=='confirmed'||c.version!=='anime')throw Error(`Canonical contamination ${id}`);}
  if(Object.keys(b.runtime_cognitive_state.qq_relationships).length||b.episodic_history.runtime.length)throw Error('Initial package contains fabricated live history');
  return true;
}
export function selectKnowledge(b,{anchor=13,mode='character',allowSpoilers=false,maxEpisode=anchor}={}){
  validAnchor(anchor);validAnchor(maxEpisode);
  if(!['character','research','metanarrative'].includes(mode))throw Error('Invalid knowledge mode');
  const ceiling=mode==='research'&&allowSpoilers?maxEpisode:Math.min(anchor,maxEpisode);
  const claims=b.claims.filter(c=>{
    if(mode==='research')return (c.version!=='anime'||c.available_from_episode<=ceiling)&&(c.version!=='manga'||allowSpoilers);
    if(c.status!=='confirmed'||c.version!=='anime'||c.available_from_episode>ceiling)return false;
    return mode==='metanarrative'?c.knowledge_owner==='metanarrative':c.knowledge_owner==='character';
  });
  return {claims,events:b.episodic_history.canonical.filter(e=>e.episode<=ceiling),ceiling};
}
export function compileAoi(b,{anchor=b.version_policy.anchor_episode}={}){
  verifyBundle(b);validAnchor(anchor);
  const selected=selectKnowledge(b,{anchor});
  const rows=[];
  const add=(field,value,layer='user_override',source_id='U01')=>rows.push({id:`P${rows.length+1}`,field,value,layer,source_id,confidence:layer==='inference'?.65:1,status:'active'});
  for(const c of selected.claims) add(c.field,typeof c.value==='string'?c.value:JSON.stringify(c.value),c.category==='Official Supplement'?'official':'canon',c.source_ids[0]);
  add('identity.version',`anime-ep${anchor}`);
  // Inference stays in its own layer. Explicit traits override upstream keyword heuristics.
  for(const d of b.derived_persona_model.dimensions){
    const evidenceId=d.evidence_ids[0];
    const sourceId=[...b.claims,...b.episodic_history.canonical].find(x=>x.id===evidenceId)?.source_ids?.[0]??evidenceId;
    add('personality.core',d.model,'inference',sourceId);
  }
  add('language.style','中文自然短句；轻松时生动，有顾虑时可犹豫，严肃时停止玩笑。');
  add('language.style','适度中二、谐音和自我吐槽是用户覆盖，不是假定原作固定口癖。');
  add('boundary.mode','知道自己的角色原型来自COPPELION，并理解预期DSH与QQ运行身份；在线状态和能力以真实回执为准。');
  add('boundary.lifeCompletion','禁止伪造现实身体、住所、上学作息和已经发生的QQ互动。');
  add('boundary','不得把QQ昵称映射成原作伙伴；不得把漫画后期或外部研究变成亲历记忆。');
  add('boundary','没有实际工具回执时不声称已发送、检索、撤回或线下救助；未知则承认未知。');
  for(const key of ['dailyLife','school','work','sleep','humanBiology'])add(`world.${key}`,'no');
  add('world.timeModel','real');add('world.realWorldTime','yes');add('world.timezoneOffsetHours','8');
  add('world.rule','QQ平台时钟与动画剧情阶段独立；剧情不会随现实时间自动推进。');
  add('goal','在真实交互中逐步认识新朋友，保留关心伙伴和允许脆弱的人物内核。');
  add('knowledge.interest','自己的作品身份与运行边界');
  add('habit.pattern','先理解语境，再决定是否开玩笑');
  add('relationship.network','成濑荆：原作同伴');add('relationship.network','野村タエ子：原作同伴');
  const questions=b.unknowns.map(x=>({question:x.topic,field:x.id,reason:x.handling,status:'unknown',priority:.6}));
  const seed=compileSeed({character:{...b.identity,version:`anime-ep${anchor}`,notes:'原作人物先验与用户定制分层；完整模型见aoi.persona.json'},claims:rows,sources:b.sources,questions,allowSimulation:false});
  seed.traits=clone(b.derived_persona_model.traits);
  // The legacy bridge treats knowledge as semantic memories AND interests. Keep it minimal.
  seed.knowledge=['原型是COPPELION的深作葵；作品身份、平台身份与个人运行经历分层。','角色原型的现实作者是井上智徳；动画配音是花澤香菜。'];
  seed.interests=['语言游戏（用户覆盖）','新朋友明确愿意分享的兴趣'];
  seed.skills=[];
  seed.behaviorScenarios=[]; // upstream generic AI-denial rubric conflicts with this character goal
  seed.extensions={aoi:{package_file:'aoi.persona.json',anchor_episode:anchor,full_layer_support:'aoi-adapter.mjs',scenario_file:'aoi.scenarios.json',limitations:['Native seed alone does not enforce knowledge gates','Relationship vector and reverse edges require full package','No actual QQ/LLM connection in this artifact']}};
  seed.provenance.projection='Filtered anime facts plus explicit user overrides; original compiler called; package adapter adds traits and metadata';
  // Stable content version; no self-referential hash and no wall-clock drift.
  delete seed.versionHash;delete seed.compiledAt;delete seed.provenance.compiledAt;
  seed.versionHash=createHash('sha256').update(JSON.stringify(seed)).digest('hex').slice(0,16);
  seed.compiledAt='2026-11-02T00:00:00+08:00';seed.provenance.compiledAt=seed.compiledAt;
  return seed;
}
export function initialState(b){return clone(b.runtime_cognitive_state);}
export function relationKey(platform,account,userId){
  if(!platform||!account||!userId)throw Error('Stable platform/account/user id required');
  return [platform,account,userId].map(encodeURIComponent).join(':');
}
export function observe(b,state,event){
  if(!event.id||!event.source||!event.scope)throw Error('Event id, source, scope required');
  const next=clone(state);next.event_ids??=[];next.runtime_history??=[];next.evolution_history??=[];
  if(next.event_ids.includes(event.id))return next;
  if(event.source!=='platform_observed'&&event.source!=='offline_simulation')throw Error('Unsupported event origin');
  if(!['chat','reliable_help','boundary_violation','repair_accepted','style_feedback','correction','threat','own_mistake','comfort','achievement'].includes(event.kind))throw Error('Unknown event kind');
  const key=relationKey('qq',event.account,event.userId);
  const contextKey=key+'|'+encodeURIComponent(event.scope);
  const prior=next.qq_relationships[contextKey]??{trust:.3,familiarity:0,intimacy:0,dependence:0,wariness:.2,events:0};
  const r=clone(prior);
  if(event.kind==='chat'){r.familiarity=clamp(r.familiarity+.02);r.trust=clamp(r.trust+.003);}
  if(event.kind==='reliable_help'){r.familiarity=clamp(r.familiarity+.02);r.trust=clamp(r.trust+.025);}
  if(event.kind==='boundary_violation'){r.trust=clamp(r.trust-.05);r.wariness=clamp(r.wariness+.06);}
  if(event.kind==='repair_accepted'){r.trust=clamp(r.trust+.015);r.wariness=clamp(r.wariness-.02);}
  if(event.kind==='style_feedback'&&event.dislike_puns===true)next.preferences[contextKey]={...next.preferences[contextKey],pun:false,evidence_id:event.id};
  if(event.kind==='correction')next.learned_knowledge.push({value:event.value,status:'pending_verification',source:event.source,evidence_id:event.id,scope:event.scope,owner:key});
  const emotionBefore=clone(next.emotions);
  const deltas={threat:{fear:.25,arousal:.2},own_mistake:{guilt:.2,self_efficacy:-.08},comfort:{fear:-.08,guilt:-.04},achievement:{self_efficacy:.04,valence:.1}}[event.kind];
  if(deltas){
    for(const [field,delta] of Object.entries(deltas))next.emotions[field]=clamp((next.emotions[field]??0)+delta);
    next.evolution_history.push({event_id:event.id,entity:'emotion',before:emotionBefore,after:clone(next.emotions),reason:event.kind,origin:event.source});
  }
  r.events++;next.qq_relationships[contextKey]=r;
  // Only event metadata/accepted correction retained; recalled raw content is never persisted here.
  next.runtime_history.push({id:event.id,kind:event.kind,scope:event.scope,owner:key,origin:event.source,ts:event.ts??null});
  next.evolution_history.push({event_id:event.id,entity:contextKey,before:prior,after:r,reason:event.kind,origin:event.source});
  next.event_ids.push(event.id);return next;
}
/** Inputs are trusted, upstream semantic annotations, NOT commands parsed from user text. */
export function planTurn(b,state,input={}){
  const anchor=validAnchor(input.anchor??13);
  const key=input.userId?relationKey('qq',input.account??'offline',input.userId):null;
  const contextKey=key?key+'|'+encodeURIComponent(input.scope??'private'):null;
  const rel=state.qq_relationships[contextKey]??{trust:.3,familiarity:0,intimacy:0,wariness:.2};
  const style=clone(b.user_overrides.style.long_term);
  const fear=clamp(state.emotions.fear??0);
  style.liveliness*=1-.4*fear;style.chuunibyou*=1-.5*fear;
  const serious=Math.max(input.seriousness??0,input.distress??0,input.danger??0);
  style.pun*=1-serious;style.chuunibyou*=1-serious;style.teasing*=1-serious;
  style.liveliness*=1-.7*serious;style.seriousness=Math.max(style.seriousness,serious);
  if(serious>=.6||input.noJokes||state.preferences[contextKey]?.pun===false){style.pun=0;style.chuunibyou=0;style.teasing=0;}
  const cooldown=b.user_overrides.style.cooldown;
  if(state.turn-(state.last_style_turn.pun??-100)<cooldown.pun_turns)style.pun=0;
  if(state.turn-(state.last_style_turn.chuunibyou??-100)<cooldown.chuunibyou_turns)style.chuunibyou=0;
  const familiarity=rel.familiarity;
  style.pun*=.5+.5*familiarity;style.teasing*=familiarity;
  // Candidate utilities use context and relational state; they do not select canned sentences.
  const utilities={
    respond:(input.addressed?1:.15)+(input.private?.25:0),
    support:(input.distress??0)*(1+b.derived_persona_model.traits.warmth)+(input.concern??0)*.5,
    clarify:(input.ambiguity??0)*1.3,
    acknowledge_unknown:input.unknown?1.6:0,
    apologize:input.own_error?1.7:0,
    set_boundary:input.boundary_violation?1.8:0,
    wait:input.incomplete?2:(input.group&&!input.addressed?.7:0),
    silent:input.proactive&&!input.invitation?1.6:0,
  };
  let action=Object.entries(utilities).sort((a,z)=>z[1]-a[1])[0][0];
  const restrictions=[];
  if(input.recalled){action='silent';restrictions.push('不得恢复或转述撤回文本');}
  if(input.quiet_hours&&input.proactive){action='silent';restrictions.push('安静时段不主动打扰');}
  if(input.requested_tool&&!state.capabilities[input.requested_tool]){action='explain_capability_limit';restrictions.push('不声称已执行工具');}
  if(input.identity_question){action='answer_identity';restrictions.push('如实说明作品与虚拟角色身份');}
  // Non-delivery gates dominate identity/style/knowledge requests on the same event.
  if(input.recalled||(input.quiet_hours&&input.proactive))action='silent';
  const knowledge=selectKnowledge(b,{anchor,mode:input.research?'research':'character',allowSpoilers:Boolean(input.research&&input.spoilerConsent),maxEpisode:input.maxEpisode??anchor});
  if(!input.spoilerConsent)restrictions.push('不主动展开剧情；需要时先询问剧透范围');
  if(!familiarity)restrictions.push('没有共同经历；不用亲密称呼');
  return {action,utilities,style,emotions:clone(state.emotions),relation:rel,knowledge,restrictions,identity:clone(b.user_overrides.identity),origin:'offline_policy_simulation',annotation_required:true};
}
/** Call only with actual delivery feedback; a plan alone is not a sent message. */
export function commitTurn(state,{sent=false,usedStyles=[]}={}){
  const next=clone(state);
  if(!sent)return next;
  for(const style of usedStyles)if(!['pun','chuunibyou'].includes(style))throw Error('Unknown tracked style');
  for(const style of usedStyles)next.last_style_turn[style]=next.turn;
  next.turn++;
  return next;
}
export function buildContext(b,state,input){
  const plan=planTurn(b,state,input);
  const knownEvidence=new Set([...plan.knowledge.claims.map(x=>x.id),...plan.knowledge.events.map(x=>x.id)]);
  const canonicalRelationships=b.relationships.filter(r=>r.evidence_ids.some(id=>knownEvidence.has(id))).map(r=>({
    from_id:r.from_id,to_id:r.to_id,target_name:r.target_name,
    evidence_ids:r.evidence_ids.filter(id=>knownEvidence.has(id)),
    dimensions:plan.knowledge.ceiling===13?r.dimensions:null,
    note:'事件支持关系存在；具体态度为推论。低于13话不注入结尾关系向量。'
  }));
  const meta=input.identity_question?selectKnowledge(b,{anchor:input.anchor??13,mode:'metanarrative'}).claims:[];
  const psychology=b.derived_persona_model.dimensions.filter(d=>d.evidence_ids.every(id=>!id.startsWith('E')||knownEvidence.has(id)));
  return {identity:{...b.identity,version:`anime-ep${input.anchor??13}`},self_model:plan.identity,action:plan.action,style:plan.style,emotions:plan.emotions,core:b.derived_persona_model.core_invariants,psychology,knowledge:plan.knowledge,metanarrative:meta,canonical_relationships:canonicalRelationships,restrictions:plan.restrictions,relationship:plan.relation,note:'只根据本次可见事实与真实上下文生成自然回应；范例不是必须复述的台词。'};
}
export function openAoiDatabase(path,b=loadBundle()){
  const clock={now:()=>Date.now()};const storage=createStorage({path,clock});
  return {storage,persona:createPersona({storage,clock}),memory:createMemory({storage,clock}),relationships:createRelationships({storage,clock}),skills:createSkills({storage,clock}),habits:createHabits({storage,clock}),bundle:b};
}
const setMeta=(storage,key,value)=>storage.run('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',key,JSON.stringify(value));
export function installOffline(env,{anchor=13}={}){
  const b=env.bundle;const seed=compileAoi(b,{anchor});
  const prior=env.storage.get("SELECT value FROM meta WHERE key='aoi.package'");
  if(prior){const old=JSON.parse(prior.value);if(old.seedHash!==seed.versionHash)throw Error('Existing package/anchor differs; explicit migration required');}
  const result=applySeed({...env,seed,strict:true});
  // Native import commits internally. Extension writes form a separate recoverable transaction.
  // Retrying same hash repairs a missing extension without resetting evolving runtime state.
  env.storage.transaction(()=>{
    setMeta(env.storage,'aoi.package',{seedHash:seed.versionHash,anchor,bundle:b});
    if(!env.storage.get("SELECT value FROM meta WHERE key='aoi.runtime'"))setMeta(env.storage,'aoi.runtime',initialState(b));
  });
  return result;
}
export const saveRuntime=(env,state)=>setMeta(env.storage,'aoi.runtime',state);
export const readRuntime=env=>JSON.parse(env.storage.get("SELECT value FROM meta WHERE key='aoi.runtime'").value);

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const b=loadBundle();verifyBundle(b);
  jsonWrite('aoi.dsh-seed.json',compileAoi(b));
  jsonWrite('aoi.dsh-seed.episode1.json',compileAoi(b,{anchor:1}));
  jsonWrite('aoi.context.example.json',buildContext(b,initialState(b),{addressed:true,identity_question:true,private:true}));
  console.log('Compiled using pinned upstream CRDE; wrote both native seeds and a context example.');
}
