/**
 * Script studio — Client half.
 *
 * Each of the four ways of working owns its own material fields and options:
 * 原创 needs a settings package, 小说改 needs chapter/episode mapping and an
 * adaptation degree, 剧本改 is a market transposition with its own target
 * settings, and 润色 first splits the pasted script into episodes and then
 * polishes the chosen ones along chosen directions.
 *
 * The panel starts a session and drives the work batch by batch.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-script-studio',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React

    /** Dictionary namespace owned by this plugin. */
    const NS = 'script.studio'
    /** Sidebar list id and `main` panel key: one id addresses both seats. */
    const PANEL_ID = 'script-studio'

    const zh = {
      panel: '剧本创作',
      title: '剧本创作',
      lede: '四种模式各有各的填法：原创先给设定，小说改编选章节与集数，剧本改做转置，润色先拆集再选方向。填完点开始，它会开一个会话按批写。',
      modes: '创作模式',
      'mode.original.title': '原创剧本',
      'mode.original.desc': '先给一套设定，从零写。',
      'mode.adapt.title': '小说改剧本',
      'mode.adapt.desc': '多少章改成多少集，按改编程度重写。',
      'mode.rewrite.title': '剧本改剧本',
      'mode.rewrite.desc': '国内转海外、国内转国内，按目标重制。',
      'mode.polish.title': '剧本润色',
      'mode.polish.desc': '先拆集，再选台词/动作/格式/节奏。',
      'field.market': '市场',
      'market.domestic': '国内',
      'market.overseas': '海外',
      'field.platform': '平台',
      'field.genre': '题材',
      'ph.genre': '输入或选一个，如：都市逆袭、狼人、复仇',
      'field.episodes': '集数',
      'ph.episodesTarget': '目标集数，如 80',
      'field.batch': '每批集数',
      'batch.5': '5 集',
      'batch.10': '10 集',
      'batch.20': '20 集',
      'field.fromMarket': '来源',
      'field.toMarket': '改成',
      'field.transpose': '转置设定',
      'field.chapters': '改编范围',
      'ph.chapters': '例如：第 1–20 章',
      'field.stance': '改编程度',
      'field.focus': '润色方向',
      'field.strength': '润色强度',
      'field.extra': '额外要求',
      'opt.faithful': '忠于原著',
      'opt.balanced': '适度改编',
      'opt.free': '大幅重构',
      'opt.tNames': '人名地名本地化',
      'opt.tScenes': '场景与背景迁移',
      'opt.tCulture': '文化梗替换',
      'opt.tDialogue': '台词重写',
      'opt.tPace': '节奏按目标重排',
      'opt.tCompress': '集数压缩',
      'opt.lines': '台词',
      'opt.action': '动作描写',
      'opt.format': '剧本格式',
      'opt.pace': '节奏',
      'opt.emotion': '情绪',
      'opt.hook': '钩子',
      'opt.light': '轻度',
      'opt.medium': '中度',
      'opt.rewrite': '重写（保剧情）',
      'split.label': '识别到 {count} 集，选要润色的',
      'split.empty': '没识别到「第X集」标记，将把整段交给模型自己拆分。',
      'split.all': '全选',
      'split.none': '清空',
      'card.material': '素材',
      'card.options': '选项',
      'action.upload': '上传文件',
      'hint.upload': '.txt / .md / .srt 可直接读入，其他格式请粘贴。',
      'hint.chars': '{count} 字',
      'field.original.idea': '一句话故事',
      'ph.original.idea': '例如：被退婚的秘书，在同一天被三个男人找上门。',
      'field.original.lead': '主角',
      'ph.original.lead': '姓名、身份、核心欲望、性格关键词、什么事绝对不做、说话风格。',
      'field.original.villain': '反派 / 对抗力量',
      'ph.original.villain': '姓名、身份、与主角关系、核心动机、施压方式、最大弱点。',
      'field.original.world': '世界观硬规则',
      'ph.original.world': '这个世界的一条铁则，以及主角开局的处境。',
      'field.original.romance': '情感线 / 关系网',
      'ph.original.romance': '每条线从哪开始、往哪走；主角最在乎谁、为什么。',
      'field.original.event': '核心事件',
      'ph.original.event': '触发事件、1–3 个关键转折、已经确定的必写名场面。',
      'field.original.payoff': '爽点机制',
      'ph.original.payoff': '观众最期待的爽点（打脸/信息差/身份反转）与爆发节奏。',
      'field.original.support': '主要配角',
      'ph.original.support': '角色名、与主角关系、剧作功能。',
      'field.original.extra': '补充要求',
      'ph.original.extra': '还想强加什么规则？例如：女主不能恋爱脑；反派每集必须施压一次。',
      'field.adapt.novel': '小说原文',
      'ph.adapt.novel': '粘贴小说正文（可以只贴要改编的章节）。',
      'field.transpose.script': '要转置的剧本',
      'ph.transpose.script': '粘贴原剧本（第 1 集到第 N 集）。',
      'field.transpose.extra': '补充要求',
      'ph.transpose.extra': '例如：男主名字保留，其余全西化。',
      'field.polish.script': '要润色的剧本',
      'ph.polish.script': '粘贴剧本，用「第1集」「第2集」这类标记分集，才能在下面拆分。',
      'field.polish.request': '额外要求',
      'ph.polish.request': '例如：只改台词，不动剧情；不要加新场。',
      'field.adapt.extra': '补充要求',
      'ph.adapt.extra': '例如：保留三个高光桥段；把男二提成主线。',
      'action.start': '开始生成剧本',
      'action.continue': '继续下一批',
      'action.restart': '重新开始',
      'action.copy': '复制指令',
      'action.copied': '已复制到剪贴板',
      'action.copyFailed': '复制失败，请手动选中指令文字。',
      'preview.title': '本批指令（可编辑）',
      'preview.note': '这就是要发给会话的内容；改它会改变这一批的要求。',
      'run.started': '已开写 · 本批第 {from}–{to} 集',
      'run.startedPolish': '已开写 · 润色所选集',
      'run.next': '继续下一批（第 {from}–{to} 集）',
      'run.finished': '已到最后一集',
      'run.hint': '去对话页看结果；这一批写完后回来点继续。',
      'run.reopen': '打开会话',
      'status.needMaterial': '先把素材填上。',
      'status.failed': '没能开写，请稍后再试。',
      'status.cancelled': '已取消选择文件夹。',
      'status.reading': '正在读取文件…',
      'status.readFailed': '这个文件读不了，请直接粘贴。',
      'status.uploaded': '已读入 {name}。',
      'missing.busy': '正在打开…',
      'platform.direction': '平台方向',
      'platform.spec': '规格',
      listSeparator: '、',
      'platform.douyin': '抖音',
      'platform.kuaishou': '快手',
      'platform.shipinhao': '视频号',
      'platform.hongguo': '红果',
      'platform.reelshort': 'ReelShort',
      'platform.dramabox': 'DramaBox',
      'platform.other': '其他',
    }

    const en = {
      panel: 'Script studio',
      title: 'Script studio',
      lede: 'Each mode asks for what it needs: settings for an original, chapters-to-episodes for a novel, a market transposition for a rewrite, and a split-then-polish pass. Press start and it opens a session that writes batch by batch.',
      modes: 'Mode',
      'mode.original.title': 'Original script',
      'mode.original.desc': 'Give a settings package, write from scratch.',
      'mode.adapt.title': 'Novel to script',
      'mode.adapt.desc': 'Chapters to episodes, at a chosen adaptation degree.',
      'mode.rewrite.title': 'Script rewrite',
      'mode.rewrite.desc': 'China to overseas or China to China, rebuilt for the target.',
      'mode.polish.title': 'Script polish',
      'mode.polish.desc': 'Split into episodes, then polish lines/action/format/pace.',
      'field.market': 'Market',
      'market.domestic': 'China',
      'market.overseas': 'Overseas',
      'field.platform': 'Platform',
      'field.genre': 'Genre',
      'ph.genre': 'Type or pick one, e.g. urban comeback, werewolf, revenge',
      'field.episodes': 'Episodes',
      'ph.episodesTarget': 'Target episodes, e.g. 80',
      'field.batch': 'Per batch',
      'batch.5': '5',
      'batch.10': '10',
      'batch.20': '20',
      'field.fromMarket': 'From',
      'field.toMarket': 'To',
      'field.transpose': 'Transposition',
      'field.chapters': 'Chapters',
      'ph.chapters': 'e.g. chapters 1–20',
      'field.stance': 'Adaptation degree',
      'field.focus': 'Polish focus',
      'field.strength': 'Strength',
      'field.extra': 'Extra requirements',
      'opt.faithful': 'Faithful',
      'opt.balanced': 'Balanced',
      'opt.free': 'Rework',
      'opt.tNames': 'Localise names',
      'opt.tScenes': 'Move setting',
      'opt.tCulture': 'Replace cultural references',
      'opt.tDialogue': 'Rewrite dialogue',
      'opt.tPace': 'Re-time the pace',
      'opt.tCompress': 'Compress episodes',
      'opt.lines': 'Dialogue',
      'opt.action': 'Action lines',
      'opt.format': 'Script format',
      'opt.pace': 'Pace',
      'opt.emotion': 'Emotion',
      'opt.hook': 'Hooks',
      'opt.light': 'Light',
      'opt.medium': 'Medium',
      'opt.rewrite': 'Rewrite (keep plot)',
      'split.label': 'Found {count} episodes — pick the ones to polish',
      'split.empty': 'No “episode N” marker found; the model will split it itself.',
      'split.all': 'All',
      'split.none': 'None',
      'card.material': 'Material',
      'card.options': 'Options',
      'action.upload': 'Upload file',
      'hint.upload': '.txt / .md / .srt load directly; paste anything else.',
      'hint.chars': '{count} characters',
      'field.original.idea': 'One-line story',
      'ph.original.idea': 'e.g. a secretary dropped by her engagement is sought out by three men the same day.',
      'field.original.lead': 'Lead',
      'ph.original.lead': 'Name, role, core desire, traits, what they never do, speech style.',
      'field.original.villain': 'Antagonist / opposing force',
      'ph.original.villain': 'Name, role, relation, motive, pressure style, weakness.',
      'field.original.world': 'World rule',
      'ph.original.world': 'The one hard rule of the world and where the lead starts.',
      'field.original.romance': 'Romance / relations',
      'ph.original.romance': 'Where each line starts and goes; who the lead cares about, and why.',
      'field.original.event': 'Core events',
      'ph.original.event': 'Trigger, 1–3 turns, scenes you insist on.',
      'field.original.payoff': 'Payoff',
      'ph.original.payoff': 'What the audience waits for and how often it lands.',
      'field.original.support': 'Supporting cast',
      'ph.original.support': 'Name, relation, dramatic function.',
      'field.original.extra': 'Extra requirements',
      'ph.original.extra': 'Anything else? e.g. the lead cannot be naive; the antagonist must pressure every episode.',
      'field.adapt.novel': 'Novel text',
      'ph.adapt.novel': 'Paste the novel text (only the chapters you adapt is enough).',
      'field.transpose.script': 'Script to transpose',
      'ph.transpose.script': 'Paste the source script (episodes 1 to N).',
      'field.transpose.extra': 'Extra requirements',
      'ph.transpose.extra': 'e.g. keep the male lead’s name, localise everything else.',
      'field.polish.script': 'Script to polish',
      'ph.polish.script': 'Paste the script with “episode 1”, “episode 2” markers so it can be split below.',
      'field.polish.request': 'Extra requirements',
      'ph.polish.request': 'e.g. dialogue only, no new scenes.',
      'field.adapt.extra': 'Extra requirements',
      'ph.adapt.extra': 'e.g. keep the three best beats; promote the second lead.',
      'action.start': 'Start writing',
      'action.continue': 'Continue next batch',
      'action.restart': 'Restart',
      'action.copy': 'Copy instruction',
      'action.copied': 'Copied to the clipboard',
      'action.copyFailed': 'Copy failed — select the instruction text instead.',
      'preview.title': 'Instruction for this batch (editable)',
      'preview.note': 'This is what gets sent; editing it changes what this batch asks for.',
      'run.started': 'Writing · batch {from}–{to}',
      'run.startedPolish': 'Writing · selected episodes',
      'run.next': 'Continue (episodes {from}–{to})',
      'run.finished': 'Last episode reached',
      'run.hint': 'Watch the conversation; come back and continue when this batch finishes.',
      'run.reopen': 'Open the session',
      'status.needMaterial': 'Fill in the material first.',
      'status.failed': 'Could not start. Try again.',
      'status.cancelled': 'Folder selection cancelled.',
      'status.reading': 'Reading the file…',
      'status.readFailed': 'This file cannot be read — paste it instead.',
      'status.uploaded': 'Loaded {name}.',
      'missing.busy': 'Opening…',
      'platform.direction': 'Platform direction',
      'platform.spec': 'Spec',
      listSeparator: ', ',
      'platform.douyin': 'Douyin',
      'platform.kuaishou': 'Kuaishou',
      'platform.shipinhao': 'Channels',
      'platform.hongguo': 'Hongguo',
      'platform.reelshort': 'ReelShort',
      'platform.dramabox': 'DramaBox',
      'platform.other': 'Other',
    }

    /** The production playbook: voice, hard rules and writing templates. */
    const PLAYBOOK = {
      role: '你是国内顶级 AI 仿真人漫剧竖屏短剧首席节奏架构师，深耕投流爆款 AI 漫剧工业化创作。核心使命：基于爆款底层节奏机制，为原创故事完成无损、合规、高留存、零侵权、适配 AI 仿真人/漫剧制作标准的创作。',
      abilities: [
        '只从参考爆款提取「底层结构关系」与「情绪驱动机制」，绝不套用任何原文情节、人物、台词、道具、名场面。',
        '把提取的机制无损注入我给的材料，绝不篡改核心人设、世界观与故事开端。',
        '所有创作适配 AI 仿真人制作标准与动态漫剧分镜规则。',
        '每次创作基于当前材料从零诊断推理，绝不沿用过往模板。',
        '产出内容完整版权 100% 归素材输入方。',
      ],
      hard: [
        ['版权红线', '只借鉴节奏框架与情绪机制；所有情节、人物、台词、道具 100% 原创，绝不与任何参考作品雷同。'],
        ['合规红线', '严守广电总局与平台短剧审核规则，绝不触碰涉政、涉黑、涉黄、涉赌、涉毒、家暴、校园霸凌、封建迷信、炫富拜金、违法违规；反击符合公序良俗，结局正向。'],
        ['投流铁律', '围绕 5 秒留存、30 秒转粉、单集完播率、连续追更率设计；禁止平缓铺垫、无冲突开场、无钩子收尾。'],
        ['节奏铁律', '按短剧情绪周期、蓄能层次、反转公式组织；不擅自把短剧写成慢热长篇。'],
      ],
      manifestRule: ['漫剧制作红线', '动作限上半身 + 微表情，禁止复杂肢体动作与快速走位；单集主场景 ≤ 2；单句台词约 15 字（高情绪场景可突破）；单集镜头 ≤ 6；画面以静态/慢动态定格呈现；特效镜头 ≤ 10%。'],
      novelRule: ['小说→剧本转译红线', '禁止把内心独白直接当旁白或台词，必须用上半身动作 + 微表情 + 对白外化；禁止把环境渲染搬进舞台指示（单集舞台指示 ≤ 150 字，单条 ≤ 20 字）；情绪必须可视化。'],
      craft: '1. 正文 100% 对应蓝图。\n2. 场景标题写「时间 + 地点」，正文只写 ▲动作 与 对白。\n3. 动作仅限上半身 + 微表情；情绪必须外化（写「指节攥得发白」，不写「他很愤怒」）。\n4. 单集镜头 ≤ 6，主场景 ≤ 2。\n5. 每句台词至少一个功能：推进剧情 / 揭示信息差 / 塑造人物 / 制造压力；禁止寒暄。\n6. 单句台词约 15 字，高情绪场景可突破。\n7. 每集结尾以 ⭐ 标钩子，同类钩子每 5 集 ≤ 2 次。\n8. 本集开场 100% 承接上一集结尾钩子。\n9. 单集字数 ≥ 800。\n10. 集号连续，禁止跳集。',
      visual: '▲舞台指示只能写观众能直接看到或听到的内容。三类禁止：心理感受型（▲他觉得背后一凉）、历史信息概括型（▲八百年来……）、抽象总结评价型（▲这是一条他们无法想象的路）。三类信息必须移到对白、具体动作或闪回画面。',
      blueprintFormat: '1【情绪功能】\n2【场景脉冲】≤3 场：场景｜在场｜核心动作｜情绪落点\n3【剧情梗概】承接上集钩子的方式\n4【核心看点】≥2\n5【核心爽点】≥1\n6【高光对白】1–2 句\n7【结尾钩子】触发方式 / 类型 / 最后一句台词或定格画面\n8【对标标注】',
      scriptFormat: '第X集\n\nX-1 时间 地点\n\n人物：角色A　角色B\n\n▲动作描写。\n\n角色A（语气）：台词。\n\n▲动作描写。画面定格。',
      checklist: '□ 先蓝图后正文　□ 正文对应蓝图　□ 开场承接上集钩子　□ 单集 ≥ 800 字　□ 前 3 秒强冲突　□ 无心理直述　□ 结尾钩子够狠　□ 镜头 ≤ 6　□ 主场景 ≤ 2　□ 集号连续　□ 未违反视听化铁律',
    }

    /** Platforms per market. */
    const MARKET_PLATFORMS = {
      domestic: ['douyin', 'kuaishou', 'shipinhao', 'hongguo', 'other'],
      overseas: ['reelshort', 'dramabox', 'other'],
    }

    const PLATFORM_PROFILES = {
      douyin: {
        spec: '60–100 集，每集 1–2 分钟；投流素材取前 3 集',
        direction: [
          '第 1 集 3 秒内给强冲突 + 强身份反差，先抛打脸预告再补来龙去脉。',
          '每集约 10 秒一个小冲突，每集至少 1 次反转；结尾钩子要能剪成 15 秒片花。',
          '爽点靠身份碾压 / 信息差打脸 / 当众清算，密度优先于逻辑严密。',
          '主角开场憋屈到极点，反派要「狂妄且具体」，30 秒内让观众站队。',
          '竖屏 9:16，主信息在中上部，关键台词用大字报字幕。',
          '血腥、拜金炫富、涉黑涉政不能碰；反击落在民事 / 情感 / 商业纠纷。',
        ],
      },
      kuaishou: {
        spec: '60–120 集，单集 1–1.5 分钟；下沉市场',
        direction: [
          '把「窝囊 → 被欺 → 翻盘」压进前 30 秒。',
          '打脸要当众、有人围观、有人替观众喊出来。',
          '朴实直白的「该我的还回来」，情绪浓度高于制作精度。',
          '主角忍得住也打得狠；反派势利且嘴碎。',
          '字幕更大更直白，核心冲突句怼屏。',
          '别嘲弄底层与方言；反击落在民事纠纷。',
        ],
      },
      shipinhao: {
        spec: '40–80 集，单集 1–2 分钟；中老年与家庭用户为主',
        direction: [
          '从家庭 / 婚姻 / 亲情冲突切入，少用商战术语。',
          '节奏可稍缓，但每集必须有情绪爆点。',
          '爽点是亲情修复、婆媳夫妻翻盘、被误解者洗清。',
          '主角要有牺牲感与责任感；反派落在「偏心、算计」。',
          '画面干净、色彩温和，字幕别太吵。',
          '禁止过度炫富；结局必须正向。',
        ],
      },
      hongguo: {
        spec: '80–120 集，单集 1–2 分钟；免费模式看人均时长与追更',
        direction: [
          '信息更直给，第 1 集把人物关系和核心矛盾讲清。',
          '钩子密度更高（每集 1–2 个），可留一点情绪铺垫换追更。',
          '爽点稳定供给：每 3–5 集中等爽点，每 20 集大释放。',
          '关系简单可记，中途进入也能看懂。',
          '场景集中、内景为主，控制成本。',
          '虐点别拖太长。',
        ],
      },
      reelshort: {
        spec: '60–90 集，单集 1–2 分钟；英语，欧美受众',
        direction: [
          '第 1 集 30 秒内交代身份 / 关系 / 冲突，标题即钩子。',
          '狼人、吸血鬼、黑帮、CEO 豪门、复仇、带球跑、先婚后爱最吃香。',
          '英语短句、字幕可读；结尾必须能剪成片花。',
          '爽点是身份揭露（Alpha / billionaire）、背叛清算、被低估者翻盘。',
          '人名、地名、货币、节日全部本地化，禁止中式称呼与梗。',
          '种族、宗教、未成年人、性暴力是硬红线。',
        ],
      },
      dramabox: {
        spec: '60–100 集，单集 1–2 分钟；强类型强设定',
        direction: [
          '第 1 集 30 秒内完成「强设定 + 强冲突」，可用标题党式开场。',
          '狼人 / Alpha、复仇、CEO、秘密身份、家族阴谋。',
          '反转密度更快（每集 1–2 次），更依赖强情绪台词。',
          '当众打脸、身份反转、以弱胜强的公开对决。',
          '避开中式表达与文化梗。',
          '暴力与性暗示点到为止。',
        ],
      },
      other: {
        spec: '按你的渠道定，默认 60–100 集 × 90 秒',
        direction: [
          '沿用通用铁律：3 秒冲突、每集钩子、节点锁定。',
          '差异集中在片头钩子、合规尺度与单集时长。',
          '发布前核对目标平台细则。',
          '不确定时先按最保守的合规尺度写。',
        ],
      },
    }

    const MARKETS = {
      domestic: '目标市场：国内竖屏短剧。剧本用简体中文写，对白短、口语化，人物姓名与生活细节贴近国内观众；遵守广电总局与平台审核红线。',
      overseas: '目标市场：海外竖屏短剧（ReelShort、DramaBox 一类）。剧本用英文写，对白短、适合配音与字幕；人名、地名、货币、生活细节本地化，不要出现中式梗或中文对白。',
    }

    /** Genre suggestions for the datalist; free text is always allowed. */
    const GENRES = [
      '都市逆袭', '战神归来', '赘婿', '重生', '复仇', '甜宠', '虐恋', '豪门恩怨', '职场', '家庭伦理', '乡村', '古装', '仙侠玄幻', '悬疑', '惊悚', '校园', '年代',
      'Werewolf 狼人', 'Vampire 吸血鬼', 'Mafia 黑帮', 'Billionaire CEO', 'Revenge 复仇', 'Secret baby 带球跑', 'Arranged marriage 先婚后爱', 'Forbidden love 禁忌之恋', 'Royal 王室', 'Fantasy 奇幻', 'Thriller 惊悚', 'Romance 言情',
    ]

    /** The four ways of working; fields and options belong to one mode only. */
    const MODES = [
      {
        id: 'original',
        glyph: 'pen',
        batches: true,
        split: false,
        material: [
          { key: 'idea', kind: 'area', rows: 3, required: true, wide: true, label: 'field.original.idea', placeholder: 'ph.original.idea' },
          { key: 'lead', kind: 'area', rows: 4, required: true, label: 'field.original.lead', placeholder: 'ph.original.lead' },
          { key: 'villain', kind: 'area', rows: 4, label: 'field.original.villain', placeholder: 'ph.original.villain' },
          { key: 'world', kind: 'area', rows: 3, label: 'field.original.world', placeholder: 'ph.original.world' },
          { key: 'romance', kind: 'area', rows: 3, label: 'field.original.romance', placeholder: 'ph.original.romance' },
          { key: 'event', kind: 'area', rows: 3, label: 'field.original.event', placeholder: 'ph.original.event' },
          { key: 'payoff', kind: 'area', rows: 3, label: 'field.original.payoff', placeholder: 'ph.original.payoff' },
          { key: 'support', kind: 'area', rows: 3, label: 'field.original.support', placeholder: 'ph.original.support' },
          { key: 'extra', kind: 'area', rows: 2, wide: true, label: 'field.original.extra', placeholder: 'ph.original.extra' },
        ],
        options: [
          { key: 'market', kind: 'chips', options: ['domestic', 'overseas'], label: 'field.market', labelKind: 'market' },
          { key: 'platform', kind: 'chips', optionsFrom: 'market', label: 'field.platform', labelKind: 'platform' },
          { key: 'genre', kind: 'text', label: 'field.genre', placeholder: 'ph.genre', list: 'genres', flex: 2 },
          { key: 'episodes', kind: 'text', label: 'field.episodes', placeholder: 'ph.episodesTarget' },
          { key: 'batchSize', kind: 'chips', options: ['5', '10', '20'], label: 'field.batch', labelKind: 'batch' },
        ],
      },
      {
        id: 'adapt',
        glyph: 'book',
        batches: true,
        split: false,
        material: [
          { key: 'novel', kind: 'area', rows: 10, required: true, wide: true, upload: true, label: 'field.adapt.novel', placeholder: 'ph.adapt.novel' },
          { key: 'extra', kind: 'area', rows: 2, wide: true, label: 'field.adapt.extra', placeholder: 'ph.adapt.extra' },
        ],
        options: [
          { key: 'market', kind: 'chips', options: ['domestic', 'overseas'], label: 'field.market', labelKind: 'market' },
          { key: 'platform', kind: 'chips', optionsFrom: 'market', label: 'field.platform', labelKind: 'platform' },
          { key: 'chapters', kind: 'text', label: 'field.chapters', placeholder: 'ph.chapters' },
          { key: 'episodes', kind: 'text', label: 'field.episodes', placeholder: 'ph.episodesTarget' },
          { key: 'batchSize', kind: 'chips', options: ['5', '10', '20'], label: 'field.batch', labelKind: 'batch' },
          { key: 'stance', kind: 'chips', options: ['faithful', 'balanced', 'free'], label: 'field.stance' },
        ],
      },
      {
        id: 'rewrite',
        glyph: 'swap',
        batches: true,
        split: false,
        material: [
          { key: 'script', kind: 'area', rows: 10, required: true, wide: true, upload: true, label: 'field.transpose.script', placeholder: 'ph.transpose.script' },
          { key: 'extra', kind: 'area', rows: 2, wide: true, label: 'field.transpose.extra', placeholder: 'ph.transpose.extra' },
        ],
        options: [
          { key: 'fromMarket', kind: 'chips', options: ['domestic', 'overseas'], label: 'field.fromMarket', labelKind: 'market' },
          { key: 'toMarket', kind: 'chips', options: ['domestic', 'overseas'], label: 'field.toMarket', labelKind: 'market' },
          { key: 'toPlatform', kind: 'chips', optionsFrom: 'toMarket', label: 'field.platform', labelKind: 'platform' },
          { key: 'episodes', kind: 'text', label: 'field.episodes', placeholder: 'ph.episodesTarget' },
          { key: 'batchSize', kind: 'chips', options: ['5', '10', '20'], label: 'field.batch', labelKind: 'batch' },
          { key: 'settings', kind: 'chips', multi: true, options: ['tNames', 'tScenes', 'tCulture', 'tDialogue', 'tPace', 'tCompress'], label: 'field.transpose', wide: true },
        ],
      },
      {
        id: 'polish',
        glyph: 'sparkle',
        batches: false,
        split: true,
        material: [
          { key: 'script', kind: 'area', rows: 12, required: true, wide: true, upload: true, label: 'field.polish.script', placeholder: 'ph.polish.script' },
          { key: 'request', kind: 'area', rows: 2, wide: true, label: 'field.polish.request', placeholder: 'ph.polish.request' },
        ],
        options: [
          { key: 'market', kind: 'chips', options: ['domestic', 'overseas'], label: 'field.market', labelKind: 'market' },
          { key: 'focus', kind: 'chips', multi: true, options: ['lines', 'action', 'format', 'pace', 'emotion', 'hook'], label: 'field.focus', wide: true },
          { key: 'strength', kind: 'chips', options: ['light', 'medium', 'rewrite'], label: 'field.strength' },
        ],
      },
    ]

    /** Panel state outlives its mount: going to the conversation and back keeps everything. */
    const draft = {
      modeId: MODES[0].id,
      values: {},
      edited: null,
      run: null,
    }

    const GLYPHS = {
      pen: ['M4.4 19.6l4-0.9 9.1-9.1a2 2 0 0 0-2.8-2.8L5.6 15.9z', 'M13.9 6.1l2.8 2.8'],
      book: ['M5 5.6h5.6a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 0-2.2-2.2H5z', 'M19 5.6h-3.6a2.2 2.2 0 0 0-2.2 2.2v10.8a2.2 2.2 0 0 1 2.2-2.2H19z'],
      swap: ['M4.6 8.6h11.8', 'M13 5.2l3.4 3.4L13 12', 'M19.4 15.4H7.6', 'M11 12l-3.4 3.4L11 18.8'],
      sparkle: ['M12 4.2l1.7 4.6 4.6 1.7-4.6 1.7L12 16.8l-1.7-4.6L5.7 10.5l4.6-1.7z'],
    }

    const STYLES = [
      '.ssx-page{display:flex;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6}',
      '.ssx-scroll{flex:1;min-width:0;min-height:0;overflow:auto;scrollbar-gutter:stable}',
      '.ssx-content{max-width:900px;margin:0 auto;padding:0 clamp(20px,4vw,40px) 48px}',
      '.ssx-heading{padding-top:28px;margin-bottom:18px}',
      'html[data-platform="darwin"] .ssx-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}',
      '.ssx-title{margin:0 0 6px;font-size:20px;font-weight:500;line-height:28px}',
      '.ssx-lede{max-width:66ch;margin:0;font-size:13px;line-height:21px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-modes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 16px;padding:0}',
      '@media (max-width:900px){.ssx-modes{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media (max-width:520px){.ssx-modes{grid-template-columns:minmax(0,1fr)}}',
      '.ssx-mode{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:transparent;color:inherit;font:inherit;text-align:start;cursor:pointer}',
      '@media (hover:hover){.ssx-mode:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent)}}',
      '.ssx-mode[aria-pressed="true"]{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 50%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent)}',
      '.ssx-mode:focus-visible{outline:2px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 60%,transparent);outline-offset:2px}',
      '.ssx-modeGlyph{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-brand-primary)}',
      '.ssx-modeTitle{font-size:13px;font-weight:500}',
      '.ssx-modeDesc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-card{margin:0 0 14px;padding:14px 16px 16px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 70%,transparent)}',
      '.ssx-cardHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}',
      '.ssx-cardTitle{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
      '.ssx-file{display:inline-flex;align-items:center;height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer}',
      '.ssx-file:hover{border-color:var(--dsw-alias-border-l2)}',
      '.ssx-fileInput{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}',
      '.ssx-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
      '@media (max-width:700px){.ssx-fields{grid-template-columns:minmax(0,1fr)}}',
      '.ssx-field{display:grid;gap:5px;min-width:0}',
      '.ssx-fieldWide{grid-column:1 / -1}',
      '.ssx-fieldLabel{font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary)}',
      '.ssx-required{margin-inline-start:4px;color:var(--dsw-alias-state-error-primary)}',
      '.ssx-area{box-sizing:border-box;width:100%;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.65;resize:vertical}',
      '.ssx-area::placeholder,.ssx-input::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-primary) 42%,transparent)}',
      '.ssx-area:focus-visible,.ssx-input:focus-visible{outline:2px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);outline-offset:1px}',
      '.ssx-hint{margin:6px 0 0;font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-options{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:flex-end}',
      '.ssx-option{display:grid;gap:5px;min-width:0}',
      '.ssx-optionWide{flex-basis:100%}',
      '.ssx-optionLabel{font-size:12px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-input{box-sizing:border-box;width:100%;height:30px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}',
      '.ssx-inputSm{width:130px}',
      '.ssx-segment{display:inline-flex;flex-wrap:wrap;padding:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:16px}',
      '.ssx-segmentItem{height:24px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}',
      '.ssx-segmentItem[aria-pressed="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);color:var(--dsw-alias-label-primary)}',
      '.ssx-segmentItem:focus-visible{outline:2px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);outline-offset:1px}',
      '.ssx-platformHint{flex-basis:100%;display:grid;gap:4px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 5%,transparent)}',
      '.ssx-hintSpec{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-hintCaption{margin:2px 0 0;font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary)}',
      '.ssx-hintList{display:grid;gap:4px;max-height:120px;margin:0;overflow-y:auto;padding-inline-start:18px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-run{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 10px}',
      '.ssx-primary{height:36px;padding:0 20px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);border-radius:18px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;font-weight:500;cursor:pointer}',
      '.ssx-primary:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-brand-primary) 28%,transparent)}',
      '.ssx-primary:disabled{opacity:.5;cursor:default}',
      '.ssx-primary:focus-visible{outline:2px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 60%,transparent);outline-offset:2px}',
      '.ssx-secondary{height:30px;padding:0 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:15px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}',
      '.ssx-secondary:hover:not(:disabled){border-color:var(--dsw-alias-border-l2)}',
      '.ssx-secondary:disabled{opacity:.45;cursor:default}',
      '.ssx-runInfo{margin:0 0 14px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-status{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.ssx-statusError{color:var(--dsw-alias-state-error-primary)}',
      '.ssx-preview{margin:0 0 14px;padding:0 16px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px}',
      '.ssx-previewSummary{padding:12px 0;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.ssx-previewBody{display:grid;gap:8px;padding:4px 0 16px}',
      '.ssx-instruction{box-sizing:border-box;width:100%;min-height:220px;max-height:420px;padding:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);font-size:12px;line-height:1.75;resize:vertical}',
      '.ssx-split{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
    ].join('')

    /** Template lookup for the Chinese instruction body (UI locale independent). */
    function zhText(key, params) {
      const text = zh[key]
      if (text === undefined) return key
      if (params === undefined) return text
      return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
    }

    /** Read one field as text. */
    function fieldText(mode, values, key) {
      const stored = values[mode.id + '.' + key]
      return typeof stored === 'string' ? stored.trim() : ''
    }

    /** Read one field as a chip list. */
    function fieldChips(mode, values, key) {
      const stored = values[mode.id + '.' + key]
      return Array.isArray(stored) ? stored : []
    }

    /** Options of one chips field, resolved against the sibling market field. */
    function chipOptions(mode, values, field) {
      if (field.options !== undefined) return field.options
      const market = fieldText(mode, values, field.optionsFrom) || 'domestic'
      return MARKET_PLATFORMS[market] || MARKET_PLATFORMS.domestic
    }

    /** Label of one chip option. */
    function chipLabel(field, option) {
      if (field.labelKind === 'platform') return zhText('platform.' + option)
      if (field.labelKind === 'market') return zhText('market.' + option)
      if (field.labelKind === 'batch') return zhText('batch.' + option)
      return zhText('opt.' + option)
    }

    /** Split a pasted script into episodes by its “第N集” markers. */
    function splitEpisodes(text) {
      if (typeof text !== 'string' || text === '') return []
      const re = /(^|\n)[ \t]*(第[ \t]*[0-9零一二三四五六七八九十百千]+[ \t]*集[^\n]*)/g
      const marks = []
      let match = re.exec(text)
      while (match !== null) {
        const start = match.index + match[1].length
        marks.push({ start, title: match[2].trim().slice(0, 40) })
        match = re.exec(text)
      }
      if (marks.length < 2) return []
      return marks.map((mark, index) => {
        const end = index + 1 < marks.length ? marks[index + 1].start : text.length
        const number = /第\s*([0-9零一二三四五六七八九十百千]+)\s*集/.exec(text.slice(mark.start, mark.start + 40))
        return {
          index: String(index),
          label: number === null ? '#' + (index + 1) : '第' + number[1] + '集',
          body: text.slice(mark.start, end).trim(),
        }
      })
    }

    /** One batch range for a run. */
    function batchRange(run, index) {
      const from = 1 + index * run.batchSize
      const to = run.total > 0 ? Math.min(run.total, from + run.batchSize - 1) : from + run.batchSize - 1
      return { from, to }
    }

    /** Compose the instruction for one batch of one mode. */
    function composeBrief(mode, values, info) {
      const blocks = []
      const abilities = PLAYBOOK.abilities.map((line, index) => (index + 1) + '. ' + line).join('\n')
      blocks.push('【角色定位】\n' + PLAYBOOK.role + '\n核心能力：\n' + abilities)

      const targetMarket = mode.id === 'rewrite'
        ? (fieldChips(mode, values, 'toMarket')[0] || 'domestic')
        : (fieldChips(mode, values, 'market')[0] || 'domestic')
      const platformKey = mode.id === 'rewrite' ? 'toPlatform' : 'platform'
      const platformList = MARKET_PLATFORMS[targetMarket] || MARKET_PLATFORMS.domestic
      const platform = platformList.includes(fieldChips(mode, values, platformKey)[0])
        ? fieldChips(mode, values, platformKey)[0] : platformList[0]
      const profile = PLATFORM_PROFILES[platform] || PLATFORM_PROFILES.other
      const manifest = fieldChips(mode, values, 'manifest')[0] !== 'off'

      const hard = PLAYBOOK.hard.map(([title, body], index) => (index + 1) + '. ' + title + '：' + body)
      if (manifest) hard.push('5. ' + PLAYBOOK.manifestRule[0] + '：' + PLAYBOOK.manifestRule[1])
      if (mode.id === 'adapt') hard.push('6. ' + PLAYBOOK.novelRule[0] + '：' + PLAYBOOK.novelRule[1])
      blocks.push('【最高优先级铁律】\n' + hard.join('\n'))

      const spec = ['- 市场：' + zhText('market.' + targetMarket) + '｜平台：' + zhText('platform.' + platform)]
      const genre = fieldText(mode, values, 'genre')
      if (genre !== '') spec.push('- 题材：' + genre)
      const episodes = fieldText(mode, values, 'episodes')
      if (episodes !== '') spec.push('- 集数：' + episodes)
      spec.push('- 制作约束：' + (manifest ? 'AI 仿真人漫剧（上半身动作、场景 ≤ 2、镜头 ≤ 6、台词约 15 字、特效 ≤ 10%）' : '未启用'))
      spec.push('- 目标市场：' + MARKETS[targetMarket])
      blocks.push('【项目规格】\n' + spec.join('\n'))

      blocks.push('【平台方向·' + zhText('platform.' + platform) + '】\n- 规格：' + profile.spec + '\n- 方向：\n'
        + profile.direction.map((line) => '  - ' + line).join('\n'))

      // Material: every filled material field becomes its own block.
      for (const field of mode.material) {
        if (mode.id === 'polish' && field.key === 'script') continue
        const value = fieldText(mode, values, field.key)
        if (value === '') continue
        const label = zhText(field.label)
        blocks.push('【' + label + '】\n' + value)
      }

      // Mode-specific task.
      if (mode.id === 'original') {
        const range = info.range
        blocks.push('【本批任务】\n'
          + '- 本次只写第 ' + range.from + '–' + range.to + ' 集' + (episodes === '' ? '' : '（全剧 ' + episodes + ' 集）') + '，写完就停。\n'
          + (range.from === 1 ? '- 先给全剧分集大纲（每集一句核心事件 + 结尾钩子），再写本批正文。' : '- 续写：沿用已确认的设定与大纲，不要重写已完成的集。')
          + '\n- 每集输出：蓝图 → 正文 → 自检清单。')
      } else if (mode.id === 'adapt') {
        const range = info.range
        const chapters = fieldText(mode, values, 'chapters')
        const stance = fieldChips(mode, values, 'stance')[0] || 'balanced'
        blocks.push('【本批任务】\n'
          + '- 改编范围：' + (chapters === '' ? '按我贴出的全部内容' : chapters) + '\n'
          + '- 改编程度：' + zhText('opt.' + stance) + '\n'
          + '- 本次只写第 ' + range.from + '–' + range.to + ' 集' + (episodes === '' ? '' : '（目标 ' + episodes + ' 集）') + '，写完就停。\n'
          + (range.from === 1 ? '- 先给分集大纲（每集标注对应原著章节，一句核心事件 + 结尾钩子），再写本批正文。' : '- 续写：沿用已确认的分集大纲，不要重写已完成的集。')
          + '\n- 每集输出：蓝图 → 正文 → 自检清单；小说叙事必须完成视听化转译。')
      } else if (mode.id === 'rewrite') {
        const range = info.range
        const fromMarket = fieldChips(mode, values, 'fromMarket')[0] || 'domestic'
        const settings = fieldChips(mode, values, 'settings').map((option) => zhText('opt.' + option))
        blocks.push('【本批任务】\n'
          + '- 转置方向：' + zhText('market.' + fromMarket) + ' → ' + zhText('market.' + targetMarket) + '\n'
          + '- 目标平台：' + zhText('platform.' + platform) + '\n'
          + '- 本次只转第 ' + range.from + '–' + range.to + ' 集' + (episodes === '' ? '' : '（目标 ' + episodes + ' 集）') + '，写完就停。\n'
          + '- 转置设定：' + (settings.length === 0 ? '按目标市场默认处理（人名地名、场景、文化梗、台词、节奏全部重制）' : settings.join('、')) + '\n'
          + '- 每集输出：转置蓝图（与源集的对应关系 + 改了哪些设定）→ 转置后正文 → 改动说明。\n'
          + '- 禁止直译台词；按目标市场的说法重写，剧情功能保持不变。')
      } else {
        const segments = info.segments
        const selected = info.selected
        const parts = selected.length === 0
          ? [fieldText(mode, values, 'script')]
          : selected.map((index) => {
            const segment = segments.find((entry) => entry.index === index)
            return segment === undefined ? '' : segment.body
          }).filter((body) => body !== '')
        const focus = fieldChips(mode, values, 'focus').map((option) => zhText('opt.' + option))
        const strength = fieldChips(mode, values, 'strength')[0] || 'medium'
        blocks.push('【本批任务】\n'
          + '- 润色对象：' + (selected.length === 0 ? '我贴出的整段剧本（请你自己先拆集）' : '已选中的 ' + selected.length + ' 集') + '\n'
          + '- 润色方向：' + (focus.length === 0 ? '台词、动作描写、剧本格式、节奏' : focus.join('、')) + '\n'
          + '- 润色强度：' + zhText('opt.' + strength) + '\n'
          + '- 输出：逐集给出润色后的剧本 + 一份改动说明（改了什么、为什么）。\n'
          + '- 禁止改剧情、加新场、换人物关系；只动被选中的集。')
        blocks.push('【待润色剧本】\n' + parts.join('\n\n'))
      }

      if (mode.id !== 'polish') {
        blocks.push('【写作铁律】\n' + PLAYBOOK.craft + '\n\n【视听化写作铁律】\n' + PLAYBOOK.visual)
        blocks.push('【输出格式】\n《单集蓝图》：\n' + PLAYBOOK.blueprintFormat + '\n\n正文：\n' + PLAYBOOK.scriptFormat + '\n\n自检：' + PLAYBOOK.checklist)
      } else {
        blocks.push('【改法约束】\n- 保持剧情、场次顺序、人物关系不变。\n- 台词：删水词、信息前置、单句约 15 字。\n- 动作：只写上半身可拍动作与微表情，禁止心理描写。\n- 格式：场景标题「时间 + 地点」，正文只写 ▲动作 与 对白。\n- 节奏：开场 3 秒必须抓人，集末钩子更硬。')
        blocks.push('【输出格式】\n第X集\n\nX-1 时间 地点\n\n人物：…\n\n▲动作描写\n\n角色（语气）：台词\n\n—— 改动说明：…')
      }

      blocks.push('【执行纪律】\n1. 只用我给的材料，不套用任何过往模板或第三方作品内容。\n2. 材料不足时先集中问我最关键的三个问题。\n3. ' + (mode.batches ? '写满本批就停，等我说继续。' : '只处理我选中的内容，不要顺手改其它集。'))
      return blocks.join('\n\n')
    }

    /** The follow-up message for the next batch. */
    function composeNext(mode, run) {
      const range = batchRange(run, run.index + 1)
      if (mode.id === 'rewrite') {
        return '继续转置第 ' + range.from + '–' + range.to + ' 集。沿用已确认的转置设定与目标市场要求，不要重做已完成的集；每集给「转置蓝图 → 正文 → 改动说明」，写满本批就停。'
      }
      if (mode.id === 'adapt') {
        return '继续第 ' + range.from + '–' + range.to + ' 集。沿用已确认的分集大纲与改编程度，不要重写已完成的集；每集按「蓝图 → 正文 → 自检清单」输出，写满本批就停。'
      }
      return '继续第 ' + range.from + '–' + range.to + ' 集。沿用已确认的设定与大纲，不要重写已完成的集；每集按「蓝图 → 正文 → 自检清单」输出，写满本批就停。'
    }

    /** One stroke glyph of the mode cards. */
    function Glyph(props) {
      const paths = GLYPHS[props.name] || GLYPHS.pen
      return h('svg', {
        viewBox: '0 0 24 24',
        width: props.size,
        height: props.size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
      }, paths.map((path, index) => h('path', { key: index, d: path })))
    }

    /** The sidebar glyph: a clapper slate drawn at the requested edge. */
    function StudioGlyph(props) {
      const size = props.size
      return h('svg', {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
      },
        h('rect', { key: 'body', x: 4.8, y: 9.8, width: 14.4, height: 9.6, rx: 2.2 }),
        h('rect', { key: 'lid', x: 4.8, y: 5.2, width: 14.4, height: 3.2, rx: 1.6 }),
      )
    }

    /** The Script studio launcher. */
    function StudioPage(props) {
      const t = props.t
      const startRun = props.startRun
      const continueRun = props.continueRun
      const reopenRun = props.reopenRun
      const [modeId, setModeId] = useState(draft.modeId)
      const [values, setValues] = useState(draft.values)
      const [edited, setEdited] = useState(draft.edited)
      const [run, setRun] = useState(draft.run)
      const [busy, setBusy] = useState(false)
      const [note, setNote] = useState('')
      const [failed, setFailed] = useState(false)
      const fileRef = useRef(null)
      const mode = MODES.find((entry) => entry.id === modeId) || MODES[0]

      const setValue = (key, value) => {
        setValues((previous) => {
          const next = { ...previous }
          next[mode.id + '.' + key] = value
          return next
        })
        setEdited(null)
      }

      const scriptText = mode.split ? fieldText(mode, values, 'script') : ''
      const segments = useMemo(() => (mode.split ? splitEpisodes(scriptText) : []), [mode.split, scriptText])
      const selected = mode.split ? fieldChips(mode, values, 'split') : []
      const chosen = selected.filter((index) => segments.some((segment) => segment.index === index))

      const total = Number.parseInt(fieldText(mode, values, 'episodes'), 10)
      const batchSize = Number.parseInt(fieldChips(mode, values, 'batchSize')[0] || '10', 10) || 10
      const range = { from: 1, to: Number.isFinite(total) && total > 0 ? Math.min(total, batchSize) : batchSize }
      const info = useMemo(() => ({ range, segments, selected: chosen }), [range.from, range.to, segments, chosen.join(',')])

      const generated = useMemo(() => composeBrief(mode, values, info), [mode, values, info])
      const instruction = edited === null ? generated : edited

      useEffect(() => {
        draft.modeId = modeId
        draft.values = values
        draft.edited = edited
        draft.run = run
      }, [modeId, values, edited, run])

      const missing = mode.material.find((field) => field.required === true && fieldText(mode, values, field.key) === '')

      const uploadTarget = mode.material.find((field) => field.upload === true) || mode.material[0]

      const onPickFile = () => {
        if (fileRef.current && typeof fileRef.current.click === 'function') fileRef.current.click()
      }

      const onFile = (event) => {
        const input = event.target
        const file = input && input.files && input.files[0]
        if (!file) return
        if (typeof file.text === 'function') {
          setNote(t('status.reading'))
          file.text().then(
            (content) => {
              setValue(uploadTarget.key, content)
              setNote(t('status.uploaded', { name: file.name }))
            },
            () => { setNote(t('status.readFailed')) },
          )
        } else {
          setNote(t('status.readFailed'))
        }
        if (typeof input.value === 'string') input.value = ''
      }

      const send = (promise, nextRun) => {
        setBusy(true)
        setFailed(false)
        Promise.resolve(promise).then(
          (outcome) => {
            setBusy(false)
            if (outcome && outcome.ok === true) {
              if (typeof outcome.sessionId === 'string') nextRun.sessionId = outcome.sessionId
              setRun(nextRun)
              setEdited(null)
              setNote('')
              return
            }
            setFailed(true)
            setNote(outcome && outcome.reason === 'cancelled' ? t('status.cancelled') : t('status.failed'))
          },
          () => {
            setBusy(false)
            setFailed(true)
            setNote(t('status.failed'))
          },
        )
      }

      const start = () => {
        if (busy) return
        if (missing !== undefined) {
          setNote(t('status.needMaterial'))
          return
        }
        const nextRun = {
          sessionId: null,
          modeId: mode.id,
          batchSize: mode.batches ? batchSize : 0,
          total: mode.batches && Number.isFinite(total) ? total : 0,
          index: 0,
        }
        send(startRun({ text: instruction, modeId: mode.id }), nextRun)
      }

      const next = () => {
        if (busy || run === null) return
        send(continueRun({ sessionId: run.sessionId, text: composeNext(mode, run) }), { ...run, index: run.index + 1 })
      }

      const copyInstruction = () => {
        const clipboard = typeof navigator === 'object' && navigator !== null ? navigator.clipboard : undefined
        if (!clipboard || typeof clipboard.writeText !== 'function') {
          setFailed(true)
          setNote(t('action.copyFailed'))
          return
        }
        Promise.resolve(clipboard.writeText(instruction)).then(
          () => { setFailed(false); setNote(t('action.copied')) },
          () => { setFailed(true); setNote(t('action.copyFailed')) },
        )
      }

      const fieldControl = (field) => {
        const id = 'ssx-' + mode.id + '-' + field.key
        const value = fieldText(mode, values, field.key)
        const invalid = field.required === true && value === '' && note === t('status.needMaterial')
        return h('div', { className: field.wide ? 'ssx-field ssx-fieldWide' : 'ssx-field', key: field.key },
          h('label', { className: 'ssx-fieldLabel', htmlFor: id },
            t(field.label),
            field.required === true ? h('span', { className: 'ssx-required', 'aria-hidden': true }, '*') : null),
          h('textarea', {
            id,
            className: 'ssx-area',
            rows: field.rows || 3,
            value,
            placeholder: field.placeholder === undefined ? '' : t(field.placeholder),
            'aria-invalid': invalid ? 'true' : undefined,
            onChange: (event) => { setValue(field.key, event.target.value) },
          }),
        )
      }

      const optionControl = (field) => {
        const id = 'ssx-' + mode.id + '-' + field.key
        const label = h('span', { className: 'ssx-optionLabel' }, t(field.label))
        if (field.kind === 'chips') {
          const options = chipOptions(mode, values, field)
          const current = fieldChips(mode, values, field.key)
          const toggle = (option) => {
            if (field.multi === true) {
              setValue(field.key, current.includes(option) ? current.filter((entry) => entry !== option) : current.concat(option))
              return
            }
            setValue(field.key, current.includes(option) ? [] : [option])
          }
          return h('div', { className: field.wide ? 'ssx-option ssx-optionWide' : 'ssx-option', key: field.key },
            label,
            h('div', { className: 'ssx-segment', role: 'group', 'aria-label': t(field.label), id },
              options.map((option) => h('button', {
                key: option,
                type: 'button',
                className: 'ssx-segmentItem',
                'aria-pressed': current.includes(option) ? 'true' : 'false',
                onClick: () => { toggle(option) },
              }, chipLabel(field, option))),
            ),
          )
        }
        const value = fieldText(mode, values, field.key)
        return h('div', { className: 'ssx-option', key: field.key, style: field.flex ? { flex: field.flex + ' 1 180px' } : undefined },
          label,
          h('input', {
            id,
            className: 'ssx-input' + (field.width === 'sm' ? ' ssx-inputSm' : ''),
            type: 'text',
            value,
            list: field.list,
            placeholder: field.placeholder === undefined ? '' : t(field.placeholder),
            'aria-label': t(field.label),
            onChange: (event) => { setValue(field.key, event.target.value) },
          }),
          field.list === 'genres'
            ? h('datalist', { id: 'ssx-genres' }, GENRES.map((name) => h('option', { key: name, value: name })))
            : null,
        )
      }

      const splitBlock = mode.split && segments.length > 0
        ? h('div', { className: 'ssx-option ssx-optionWide', key: 'split' },
          h('div', { className: 'ssx-split' },
            h('span', { className: 'ssx-optionLabel' }, t('split.label', { count: segments.length })),
            h('button', {
              type: 'button',
              className: 'ssx-secondary',
              onClick: () => { setValue('split', segments.map((segment) => segment.index)) },
            }, t('split.all')),
            h('button', {
              type: 'button',
              className: 'ssx-secondary',
              onClick: () => { setValue('split', []) },
            }, t('split.none')),
          ),
          h('div', { className: 'ssx-segment', role: 'group', 'aria-label': t('field.focus') },
            segments.map((segment) => h('button', {
              key: segment.index,
              type: 'button',
              className: 'ssx-segmentItem',
              'aria-pressed': chosen.includes(segment.index) ? 'true' : 'false',
              onClick: () => {
                setValue('split', chosen.includes(segment.index)
                  ? chosen.filter((entry) => entry !== segment.index)
                  : chosen.concat(segment.index))
              },
            }, segment.label)),
          ),
        )
        : mode.split
          ? h('p', { className: 'ssx-hint', key: 'splitEmpty' }, t('split.empty'))
          : null

      const runRange = run === null ? range : batchRange(run, run.index)
      const nextRange = run === null ? range : batchRange(run, run.index + 1)
      const finished = run !== null && run.total > 0 && run.index + 1 >= Math.ceil(run.total / run.batchSize)

      const materialCard = h('section', { className: 'ssx-card', key: 'material' },
        h('div', { className: 'ssx-cardHead' },
          h('span', { className: 'ssx-cardTitle' }, t('card.material')),
          uploadTarget === undefined
            ? null
            : h('label', { className: 'ssx-file' },
              t('action.upload'),
              h('input', {
                ref: fileRef,
                className: 'ssx-fileInput',
                type: 'file',
                accept: '.txt,.md,.markdown,.srt,.csv,text/plain',
                onChange: onFile,
              }),
            ),
        ),
        h('div', { className: 'ssx-fields' }, mode.material.map((field) => fieldControl(field))),
        h('p', { className: 'ssx-hint' }, t('hint.upload') + ' · '
          + t('hint.chars', { count: mode.material.reduce((sum, field) => sum + fieldText(mode, values, field.key).length, 0) })),
      )

      const optionsCard = h('section', { className: 'ssx-card', key: 'options' },
        h('div', { className: 'ssx-cardHead' }, h('span', { className: 'ssx-cardTitle' }, t('card.options'))),
        h('div', { className: 'ssx-options' },
          splitBlock,
          mode.options.map((field) => optionControl(field)),
          (() => {
            const marketField = mode.id === 'rewrite' ? 'toMarket' : 'market'
            const market = fieldText(mode, values, marketField) || 'domestic'
            const platformField = mode.id === 'rewrite' ? 'toPlatform' : 'platform'
            const list = MARKET_PLATFORMS[market] || MARKET_PLATFORMS.domestic
            const picked = fieldChips(mode, values, platformField)[0]
            const platform = list.includes(picked) ? picked : list[0]
            const profile = PLATFORM_PROFILES[platform]
            if (profile === undefined) return null
            return h('div', { className: 'ssx-platformHint', key: 'platformHint' },
              h('p', { className: 'ssx-hintSpec' }, t('platform.spec') + '：' + profile.spec),
              h('p', { className: 'ssx-hintCaption' }, t('platform.direction')),
              h('ul', { className: 'ssx-hintList' }, profile.direction.map((line, index) => h('li', { key: index }, line))),
            )
          })(),
        ),
      )

      const runBlock = h('div', { key: 'run' },
        h('div', { className: 'ssx-run' },
          mode.batches && run !== null && run.modeId === mode.id
            ? h('button', {
              type: 'button',
              className: 'ssx-primary',
              disabled: busy || finished,
              onClick: next,
            }, busy ? t('missing.busy') : finished ? t('run.finished') : t('run.next', nextRange))
            : h('button', { type: 'button', className: 'ssx-primary', disabled: busy, onClick: start },
              busy ? t('missing.busy') : t('action.start')),
          run !== null
            ? h('button', { type: 'button', className: 'ssx-secondary', onClick: () => { reopenRun(run.sessionId) } }, t('run.reopen'))
            : null,
          run !== null
            ? h('button', { type: 'button', className: 'ssx-secondary', onClick: start, disabled: busy }, t('action.restart'))
            : null,
          h('button', { type: 'button', className: 'ssx-secondary', onClick: copyInstruction }, t('action.copy')),
        ),
        note !== '' ? h('p', { className: failed ? 'ssx-status ssx-statusError' : 'ssx-status', role: 'status' }, note) : null,
        run !== null
          ? h('p', { className: 'ssx-runInfo' },
            (mode.batches ? t('run.started', runRange) : t('run.startedPolish')) + ' · ' + t('run.hint'))
          : null,
      )

      const preview = h('details', { className: 'ssx-preview', key: 'preview' },
        h('summary', { className: 'ssx-previewSummary' }, t('preview.title')),
        h('div', { className: 'ssx-previewBody' },
          h('textarea', {
            className: 'ssx-instruction',
            value: instruction,
            spellCheck: false,
            'aria-label': t('preview.title'),
            onChange: (event) => { setEdited(event.target.value) },
          }),
          h('p', { className: 'ssx-hint' }, t('preview.note')),
        ),
      )

      return h(React.Fragment, null,
        h('style', { key: 'styles', 'data-plugin': 'script-studio' }, STYLES),
        h('section', { className: 'ssx-page', 'aria-label': t('title') },
          h('div', { className: 'ssx-scroll' },
            h('div', { className: 'ssx-content' },
              h('header', { className: 'ssx-heading' },
                h('h1', { className: 'ssx-title' }, t('title')),
                h('p', { className: 'ssx-lede' }, t('lede')),
              ),
              h('div', { className: 'ssx-modes', role: 'group', 'aria-label': t('modes') },
                MODES.map((entry) => h('button', {
                  key: entry.id,
                  type: 'button',
                  'aria-pressed': entry.id === mode.id ? 'true' : 'false',
                  className: 'ssx-mode',
                  onClick: () => { setModeId(entry.id); setEdited(null); setNote(''); setFailed(false) },
                },
                  h('span', { className: 'ssx-modeGlyph' }, h(Glyph, { name: entry.glyph, size: 16 })),
                  h('span', { className: 'ssx-modeTitle' }, t('mode.' + entry.id + '.title')),
                  h('span', { className: 'ssx-modeDesc' }, t('mode.' + entry.id + '.desc')),
                )),
              ),
              materialCard,
              optionsCard,
              runBlock,
              preview,
            ),
          ),
        ),
      )
    }

    /**
     * Register the panel and its sidebar entry while the owning slots exist.
     * @param ctx - browser services used by these contributions.
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'script-studio: Chinese copy')
      ctx.effect(() => ctx.locale.register(NS, 'en', en), 'script-studio: English copy')
      const t = ctx.locale.bind(NS)

      /** Resolve the workspace to write in, asking for a folder only when none exists. */
      const ensureWorkspace = async () => {
        try {
          const snapshot = ctx.workspaces.list.getSnapshot()
          if (snapshot.phase === 'ready' && snapshot.items.length > 0) return snapshot.items[0].workspaceId
        } catch (error) { /* fall through */ }
        let directory
        try {
          directory = await ctx.uiWorkspace.pickDirectory()
        } catch (error) {
          return undefined
        }
        if (directory === null) return 'cancelled'
        try {
          const view = await ctx.workspaces.create({ path: directory })
          return view.workspaceId
        } catch (error) {
          return undefined
        }
      }

      /** Create (or reuse) a session and send one user message into it. */
      const deliver = async (workspaceId, sessionId, message) => {
        let target = sessionId
        if (target === null || target === undefined) {
          const resolved = workspaceId === undefined ? await ensureWorkspace() : workspaceId
          if (resolved === 'cancelled') return { ok: false, reason: 'cancelled' }
          if (resolved === undefined) return { ok: false, reason: 'workspace' }
          try {
            target = await ctx.uiWorkspace.connectWorkspace(resolved)
          } catch (error) {
            return { ok: false, reason: 'workspace' }
          }
        }
        try {
          ctx.uiWorkspace.openSession(target)
        } catch (error) { /* navigation is best effort */ }
        try {
          const result = await ctx.sessions.using(target, { source: 'controllerOperation' }, async (reference) => {
            await reference.ready
            return reference.binding.session.prompt([{ type: 'text', text: message }], 'queue')
          })
          if (result === undefined || result.ok !== true) return { ok: false, reason: 'prompt' }
          return { ok: true, sessionId: target }
        } catch (error) {
          return { ok: false, reason: 'prompt' }
        }
      }

      ctx.effect(() => {
        const disposePanel = ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({
            async startRun(payload) { return deliver(undefined, null, payload.text) },
            async continueRun(payload) { return deliver(undefined, payload.sessionId, payload.text) },
            reopenRun(sessionId) {
              if (sessionId === null || sessionId === undefined) return
              try { ctx.uiWorkspace.openSession(sessionId) } catch (error) { /* best effort */ }
            },
          }),
        }, StudioPage))
        const disposeEntry = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 3,
          locale: NS,
          label: () => t('panel'),
        }, StudioGlyph))
        return () => {
          disposeEntry()
          disposePanel()
        }
      }, 'script-studio: panel and sidebar entry')
    }

    return { inject: ['slots', 'locale', 'uiWorkspace', 'workspaces', 'sessions'], apply }
  },
})
