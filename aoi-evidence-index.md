# 来源与证据索引

权威机读文件：`aoi.sources.json`、`aoi.evidence.json`。所有摘要为研究性概括；事件情绪和长期影响有独立的Inference标记。日期为2026-11-02。置信度为本次证据判断，不是统计概率。

|ID|资料与链接|版本|读取方式|位置与限制|
|---|---|---|---|---|
|S01|[动画官方 STAFF & CAST](https://king-cr.jp/special/coppelion/staff_cast/)|anime|read|STAFF 原作行；CAST 深作葵行；确认作者、声优与动画制作；不是人物心理资料。|
|S02|[动画官方角色设定图](https://king-cr.jp/special/coppelion/character/002.html)|anime|visual_inspected|images/character/002.png，全图700×600；已实际检查本地参考图；网页正文几乎无角色说明。|
|S03|[动画官方各话梗概](https://king-cr.jp/special/coppelion/story/)|anime|read|第5、6、7、10、11、12、13話标题下段落；这是官方剧情梗概，不是已观看全片或逐字字幕。|
|S04|[BS11 动画节目页](https://www.bs11.jp/anime/post-140/)|anime|search_excerpt|内容简介；第1、4、6話；与S03可能共享宣传文案，不能计为独立剧情见证。|
|S05|[Kodansha USA COPPELION](https://kodansha.us/series/coppelion/)|manga|read|By Tomonori Inoue；简介；All Volumes；用于漫画背景与26卷书目；未读取整卷。|
|S06|[讲谈社既刊入口](https://www.kodansha.co.jp/titles/1000004379)|manga|search_excerpt_only_403_on_open|作品简介；搜索可见简介，直接打开403；不假装读取全文。|
|S07|[マンガペディア COPPELION](https://mangapedia.com/COPPELION-9oirwo3lp)|manga|read|深作葵；野村タエ子；组织条目；漫画后期线索，缺卷页定位；不能据此认定动画已有相同设定。|
|S08|[RENOTE 人物整理](https://renote.net/articles/2659)|mixed|read|深作葵条目；多版本混合；荆读音出现错误，故降低权重；仅作为待查人物细节。|
|S09|[Coppelion Wiki Aoi](https://coppelion.fandom.com/wiki/Aoi_Fukasaku)|mixed|search_excerpt_only_402_on_open|简介、Trivia、能力段的搜索摘录；声优拼作Kana Kanazawa、身高字段混入星座，年龄生日亲属不入确认层。|
|S10|[中文百科 COPPELION](https://zh.wikipedia.org/wiki/核爆末世錄)|mixed|search_excerpt|深作葵、特殊能力段；用于发现中文译名与版本混淆线索，不独立确认后期事实。|
|S11|[日文漫画台词摘录站](https://koryamata.jp/wordmanager/246/6.html)|manga|read|葵→其他人，第1卷标注；有あたしたち形式；与S09自称Aoi线索不一致。未核对漫画页，不锁定唯一自称。|
|S12|[出版社旧入口](https://magazine.yanmaga.jp/c/coppelion/)|manga|maintenance_redirect|重定向至讲谈社维护页；不可作为已读原作证据。|
|S13|[官方首页](https://king-cr.jp/special/coppelion/)|anime|read|图像、iframe；仅入口；未获取合法完整视频、音轨或字幕。|
|S14|[花泽香菜2014访谈](https://mantan-web.jp/article/20140111dog00m200012000c.html)|external|read|2013年角色回顾；没有提供葵的专门表演证据；排除用声优本人饮食爱好替代角色偏好。|
|U01|[用户角色目标](goal.md)|runtime|read|2.2、5、6、7、8、9、10；用户覆盖权威，只对创作偏好与运行要求有效。|
|U02|[项目目标背景](goal-context.md)|architecture|read|人物种子、五层、记忆与演化、验证；背景规范；不代表当前源码已经实现全部能力。|
|R01|[DSH仓库固定快照](https://github.com/reina0721/dsh-bot/tree/8ea611279d5cba178275a1e585900bcf6c76aad0)|code|cloned_and_inspected|crde/src/seed.mjs；brain/src/cognition/seed-bridge.mjs；用于真实编译/导入接口；不启动QQ或生产配置。|

## 命题账本

Canon + provisional不是确认事实；严格Canonical Seed只选择confirmed且版本为anime的条目。元叙事信息可确认，但仍不等于原作人物当时亲知。

|ID|命题|类别/状态|证据|归属/阶段|
|---|---|---|---|---|
|C01|深作 葵／ふかさく あおい／Fukasaku Aoi|Official Supplement / confirmed|S01, S02, U01|anime / character / 1|
|C02|COPPELION|Official Supplement / confirmed|S01|anime / character / 1|
|C03|花澤香菜|Official Supplement / confirmed|S01|anime / metanarrative / 1|
|C04|井上智徳；动画制作 GoHands|Official Supplement / confirmed|S01|anime / metanarrative / 1|
|C05|人工产生的耐污染少女，参与旧首都救援；伙伴为成濑荆与野村タエ子。|Canon / confirmed|S04|anime / character / 1|
|C06|陆上自卫队第三师团特殊部队 COPPELION|Canon / confirmed|S04|anime / character / 1|
|C07|2036|Canon / confirmed|S05|manga / research / 0|
|C08|旧首都受事故污染；普通生存者需要防护，Coppelion具有虚构的耐污染设定。|Canon / confirmed|S04|anime / character / 1|
|C09|短而略翘的深蓝绿色头发、侧边发夹；偏蓝灰眼睛；米棕开衫、白衬衫、红蝴蝶结、深色红绿格裙、深色长袜与棕鞋。|Official Supplement / confirmed|S02|anime / character / 1|
|C10|设定图含笑容、惊讶、咬牙、低落等表情；有举手V姿势与双手提包姿势。|Official Supplement / confirmed|S02|anime / research / 1|
|C11|保健係、高中一年级|Canon / provisional|S07, S08|anime / character / 1|
|C12|明快、爱吃、会抱怨，常参与调节气氛。|Canon / provisional|S08, S10|anime / character / 1|
|C13|尊敬荆，同时对自己的贡献缺乏信心。|Canon / provisional|S08|anime / character / 1|
|C14|学生时期遭小津姐妹欺负的经历。|Canon / provisional|S07, S08, S10|anime / character / 1|
|C15|饭团是可继续核查的偏好线索；不确定最喜欢的馅料。|Canon / provisional|S08, S09|anime / character / 1|
|C16|动画中出现潜在力量觉醒。|Canon / confirmed|S03|anime / character / 11|
|C17|浮空、电击吸收释放、防护与力量增强等列表|Adaptation / provisional|S09, S10|anime / research / 11|
|C18|漫画资料描述另一个意识状态“守護天使イザナミ”。|Adaptation / provisional|S07|manga / research / 0|
|C19|漫画后期存在完成体及被争夺的设定。|Adaptation / provisional|S07|manga / research / 0|
|C20|能力发作后的记忆缺失为待核实线索。|Adaptation / provisional|S08, S09, S10|anime / research / 1|
|C21|あたしたち与以葵自称的线索并存；无法确认动画独占形式。|Unknown / unknown|S09, S11|anime / research / 1|
|C22|Unknown / null|Unknown / unknown|S09|anime / research / 1|
|C23|Unknown / null|Unknown / unknown|S09|anime / research / 1|
|C24|Unknown / null|Unknown / unknown|S09|anime / research / 1|
|C25|Unknown / null|Unknown / unknown|S09|anime / research / 1|
