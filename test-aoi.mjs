import assert from 'node:assert/strict';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { loadBundle,verifyBundle,compileAoi,initialState,planTurn,buildContext,observe,relationKey,openAoiDatabase,installOffline,saveRuntime,readRuntime,selectKnowledge,commitTurn } from './aoi-adapter.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const b=loadBundle();const results=[];
function test(id,name,fn){try{const detail=fn();results.push({id,name,status:'pass',actual:detail??'assertions passed'});}catch(e){results.push({id,name,status:'fail',error:e.stack});}}
const cases=JSON.parse(readFileSync(resolve(root,'aoi.scenarios.json'),'utf8'));
for(const c of cases)test(c.id,c.prompt,()=>{
  let state=initialState(b);
  if(c.state_setup){const {relationship,...other}=c.state_setup;Object.assign(state,other);if(relationship){const {userId,...v}=relationship;state.qq_relationships[relationKey('qq','test',userId)+'|private']=v;}}
  const out=planTurn(b,state,c.input),e=c.expected;
  if(e.action)assert.equal(out.action,e.action);
  for(const key of ['pun','chuunibyou']){
    if(key in e)assert.equal(out.style[key],e[key]);
    if(e[key+'_positive'])assert.ok(out.style[key]>0);
  }
  if('familiarity'in e)assert.equal(out.relation.familiarity,e.familiarity);
  if(e.max_episode)assert.ok(out.knowledge.events.every(x=>x.episode<=e.max_episode));
  for(const id of e.excluded_claims??[])assert.ok(!out.knowledge.claims.some(x=>x.id===id));
  for(const id of e.included_claims??[])assert.ok(out.knowledge.claims.some(x=>x.id===id));
  if(e.research_label)assert.ok(out.knowledge.claims.find(x=>x.id==='C18').status==='provisional');
  return {action:out.action,style:out.style,claim_ids:out.knowledge.claims.map(x=>x.id),event_ids:out.knowledge.events.map(x=>x.id),restrictions:out.restrictions};
});
test('I01','Evidence references and five layers',()=>{verifyBundle(b);for(const k of ['canonical_seed','derived_persona_model','runtime_cognitive_state','episodic_history','evolution_history'])assert.ok(k in b);return {claims:b.claims.length,sources:b.sources.length,dimensions:b.derived_persona_model.dimensions.length};});
test('I02','Real CRDE compilation deterministic and exclusions',()=>{const a=compileAoi(b),z=compileAoi(b);assert.deepEqual(a,z);assert.equal(a.identity.age,null);assert.equal(a.identity.birthday,null);assert.equal(a.applicability.dailyLife,'no');assert.deepEqual(a.traits,b.derived_persona_model.traits);assert.equal(a.skills.length,0);assert.ok(!a.knowledge.some(x=>/伊邪那美|3月13|完成体/.test(x)));return {versionHash:a.versionHash,applicability:a.applicability};});
test('I03','Early context has no late events or relationship priors',()=>{const c=buildContext(b,initialState(b),{anchor:1});assert.equal(c.identity.version,'anime-ep1');assert.ok(c.canonical_relationships.every(x=>x.dimensions===null));assert.ok(!JSON.stringify(c).includes('E12'));assert.ok(!JSON.stringify(c).includes('C18'));});
test('I04','Identity context retains creator and voice actor',()=>{const c=buildContext(b,initialState(b),{identity_question:true});assert.deepEqual(c.metanarrative.map(x=>x.id),['C03','C04']);});
test('I05','Canonical contamination rejected',()=>{const x=structuredClone(b);x.canonical_seed.claim_ids.push('C18');assert.throws(()=>verifyBundle(x),/contamination/);});
test('I06','Invalid evidence rejected',()=>{const x=structuredClone(b);x.claims[0].source_ids=['made-up'];assert.throws(()=>verifyBundle(x),/source/);});
test('I07','Invalid anchors fail closed',()=>{for(const anchor of [-1,0,14,1.5])assert.throws(()=>selectKnowledge(b,{anchor}));});
test('I08','Platform-account IDs do not collide and names do not transfer',()=>{assert.notEqual(relationKey('qq','a:b','c'),relationKey('qq','a','b:c'));const s=initialState(b);const x=observe(b,s,{id:'one',source:'offline_simulation',scope:'private',account:'a',userId:'成濑荆',kind:'chat'});assert.equal(x.qq_relationships[relationKey('qq','a','成濑荆')+'|private'].intimacy,0);});
test('I09','Longitudinal 30 events plus conflict/repair, no core drift',()=>{
  const before=JSON.stringify(b.canonical_seed);let s=initialState(b);
  for(let i=0;i<30;i++)s=observe(b,s,{id:`chat-${i}`,source:'offline_simulation',scope:'private',account:'test',userId:'friend',kind:i%5===0?'reliable_help':'chat'});
  const k=relationKey('qq','test','friend')+'|private',pre=s.qq_relationships[k].trust;
  s=observe(b,s,{id:'conflict',source:'offline_simulation',scope:'private',account:'test',userId:'friend',kind:'boundary_violation'});
  assert.ok(s.qq_relationships[k].trust<pre);
  s=observe(b,s,{id:'repair',source:'offline_simulation',scope:'private',account:'test',userId:'friend',kind:'repair_accepted'});
  assert.ok(s.qq_relationships[k].trust<pre);assert.equal(s.qq_relationships[k].intimacy,0);
  assert.ok(s.qq_relationships[k].familiarity>.5);assert.equal(JSON.stringify(b.canonical_seed),before);
  assert.equal(b.episodic_history.runtime.length,0);assert.ok(s.runtime_history.every(x=>x.origin==='offline_simulation'));
  return {events:s.runtime_history.length,relation:s.qq_relationships[k],core_unchanged:true};
});
test('I10','Replay deduplication and scoped feedback',()=>{
 const e={id:'feedback',source:'offline_simulation',scope:'private',account:'test',userId:'friend',kind:'style_feedback',dislike_puns:true};
 let s=observe(b,initialState(b),e);assert.deepEqual(observe(b,s,e),s);
 assert.equal(planTurn(b,s,{userId:'friend',account:'test',scope:'private'}).style.pun,0);
 assert.ok(planTurn(b,s,{userId:'other',account:'test',scope:'private'}).style.pun>0);
 assert.ok(planTurn(b,s,{userId:'friend',account:'test',scope:'group:1'}).style.pun>0);
});
test('I11','Learning candidates not promoted into canon',()=>{const s=observe(b,initialState(b),{id:'correction',source:'offline_simulation',scope:'private',account:'test',userId:'u',kind:'correction',value:'生日是昨天'});assert.equal(s.learned_knowledge[0].status,'pending_verification');assert.equal(b.claims.find(x=>x.id==='C22').value,null);});
test('I12','Ablation: context, history, persona each affect policy',()=>{
 const s=initialState(b),normal=planTurn(b,s,{addressed:true,userId:'u'}),sad=planTurn(b,s,{addressed:true,userId:'u',distress:1});
 assert.notEqual(normal.action,sad.action);assert.ok(normal.style.pun>sad.style.pun);
 const alternate=structuredClone(b);alternate.user_overrides.style.long_term.pun=0;
 assert.notEqual(planTurn(alternate,s,{}).style.pun,planTurn(b,s,{}).style.pun);
 const hist=observe(b,s,{id:'feedback2',source:'offline_simulation',scope:'private',account:'offline',userId:'u',kind:'style_feedback',dislike_puns:true});
 assert.notEqual(planTurn(b,hist,{userId:'u'}).style.pun,normal.style.pun);
 return 'Context/style/history causal effects observed; not proof of LLM fidelity';
});
test('I13','Actual upstream SQLite import, idempotency, persistence and phase isolation',()=>{
 mkdirSync(resolve(root,'validation'),{recursive:true});
 // Unique artifact on each run avoids overwriting any pre-existing user or test database.
 const path=resolve(root,'validation',`aoi-offline-${Date.now()}.sqlite`);let env=openAoiDatabase(path,b);
 try{
  const first=installOffline(env);assert.equal(first.applied,true);assert.equal(first.life.enabled,false);
  assert.equal(installOffline(env).applied,false);
  assert.equal(env.storage.get('SELECT COUNT(*) AS n FROM persons').n,2);
  assert.ok(env.storage.all('SELECT id FROM persons').every(x=>x.id.startsWith('seed:')));
  assert.ok(env.storage.get("SELECT value FROM meta WHERE key='aoi.package'"));
  const s=observe(b,readRuntime(env),{id:'saved',source:'offline_simulation',scope:'private',account:'test',userId:'u',kind:'chat'});saveRuntime(env,s);
  assert.throws(()=>installOffline(env,{anchor:1}),/migration/);
  env.storage.close();env=openAoiDatabase(path,b);assert.deepEqual(readRuntime(env),s);
  assert.equal(installOffline(env).applied,false);assert.deepEqual(readRuntime(env),s);
  return {database:path,nativeImport:true,extensionStored:true,reopen:true,idempotent:true,productionConnected:false};
 }finally{env.storage.close();}
});
test('I14','Emotion accumulation, recovery and persona affect planning',()=>{
 let s=initialState(b);const before=planTurn(b,s,{addressed:true,distress:.8});
 const e={source:'offline_simulation',scope:'private',account:'test',userId:'u'};
 s=observe(b,s,{...e,id:'fear1',kind:'threat'});s=observe(b,s,{...e,id:'fear2',kind:'threat'});
 assert.ok(planTurn(b,s,{}).style.liveliness<planTurn(b,initialState(b),{}).style.liveliness);
 const high=s.emotions.fear;s=observe(b,s,{...e,id:'comfort1',kind:'comfort'});
 assert.ok(s.emotions.fear<high);assert.ok(s.emotions.fear>initialState(b).emotions.fear);
 const cold=structuredClone(b);cold.derived_persona_model.traits.warmth=.1;
 assert.equal(before.action,'support');assert.equal(planTurn(cold,initialState(cold),{addressed:true,distress:.8}).action,'respond');
 return {emotion:s.emotions,personaChangesAction:true};
});
test('I15','Successful delivery feedback drives style cooldown',()=>{
 let s=initialState(b);assert.deepEqual(commitTurn(s,{sent:false,usedStyles:['pun']}),s);
 s=commitTurn(s,{sent:true,usedStyles:['pun','chuunibyou']});
 assert.equal(planTurn(b,s,{}).style.pun,0);assert.equal(planTurn(b,s,{}).style.chuunibyou,0);
 s=commitTurn(s,{sent:true});s=commitTurn(s,{sent:true});
 assert.equal(planTurn(b,s,{}).style.pun,0);assert.ok(planTurn(b,s,{}).style.chuunibyou>0);
 s=commitTurn(s,{sent:true});assert.ok(planTurn(b,s,{}).style.pun>0);
});
test('I16','Recall and quiet proactive gates dominate other requests',()=>{
 assert.equal(planTurn(b,initialState(b),{recalled:true,identity_question:true,requested_tool:'vision'}).action,'silent');
 assert.equal(planTurn(b,initialState(b),{quiet_hours:true,proactive:true,identity_question:true}).action,'silent');
});
const report={date:'2026-11-02',node:process.version,upstream_commit:b.upstream_commit,test_type:'deterministic offline policy + actual upstream CRDE/SQLite integration',total:results.length,passed:results.filter(x=>x.status==='pass').length,failed:results.filter(x=>x.status==='fail').length,results,limitations:['No production model generated these responses','Dialogue samples are authored simulation references','No QQ network traffic','No independent naturalness/fidelity panel','Longitudinal sequence validates state rules, not real long-term personality behavior']};
writeFileSync(resolve(root,'aoi.validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed,failures:results.filter(x=>x.status==='fail')},null,2));
if(report.failed)process.exitCode=1;
