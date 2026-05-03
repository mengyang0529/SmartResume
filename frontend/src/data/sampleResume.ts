import type { ResumeData } from '../types/resume'

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    firstName: 'Smart',
    lastName: 'Resume',
    furiganaFirstName: 'すまーと',
    furiganaLastName: 'りじゅーむ',
    position: 'Senior Interdimensional Systems Architect',
    birth: '1990年3月15日',
    email: 'smart.resume@kakuti.io',
    mobile: '+99 800-1234-5678',
    address: '404 Nebula Drive, Aether City, Zephyrus Province',
    homepage: 'www.smartresume-vault.fake',
  },
  education: [
    {
      id: 'edu-phd',
      school: 'Institute of Theoretical Chronodynamics',
      degree: 'Ph.D. in Multimodal Logic & Synthetics',
      startDate: 'Sept 2015',
      endDate: 'June 2019',
      description: 'Recipient of the "Mobius Strip" Medal for Theoretical Excellence.\nDissertation: "Temporal Deadlock Resolution via Recursive Self-Optimization in Simulated Multiverses."',
    },
    {
      id: 'edu-ms',
      school: 'Academy of Applied Absurdities',
      degree: 'M.S. in Pervasive System Design',
      startDate: 'Sept 2013',
      endDate: 'June 2015',
      description: 'Thesis: "Edge-Case Exploitation for Non-Deterministic Reward Shaping in Gamified Workflows."\nDeveloped a probabilistic failure simulator that reduced real-world anomalies by 42%.',
    },
    {
      id: 'edu-bs',
      school: 'University of Common Sense (Springfield Campus)',
      degree: 'B.S. in Digital Epistemology',
      startDate: 'Sept 2009',
      endDate: 'June 2013',
      description: 'Dean\'s List: 6 consecutive semesters of "Exceeds Unreasonable Expectations."\nCapstone: "A Framework for Verifying the Unverifiable through Circular Reasoning."',
    },
  ],
  sections: [
    {
      id: 'sec-exp',
      title: 'Professional Experience',
      entries: [
        {
          id: 'entry-exp-1',
          title: 'kakuti Technologies',
          subtitle: 'Lead Systems Architect',
          location: '',
          startDate: 'March 2021',
          endDate: 'Present',
          description: 'Spearheaded the design of the "Eternal Flame" framework, boosting data throughput efficiency by 350%.\nEngineered an automated bias-correction protocol that successfully stabilized three major logical fluctuations across production timelines.\nManaged a distributed team of 50 virtual entities, achieving a 100% zero-latency delivery rate across disparate quantum clusters.',
        },
        {
          id: 'entry-exp-2',
          title: 'Paradox Solutions Inc.',
          subtitle: 'Senior Infrastructure Alchemist',
          location: '',
          startDate: 'June 2018',
          endDate: 'Feb 2021',
          description: 'Architected a self-healing mesh network that autonomously rerouted traffic around causality violations, reducing unplanned outages by 87%.\nLed the migration of 200+ legacy monoliths into a serverless function fabric, cutting operational costs by 63%.\nMentored 12 junior engineers through the "Chaos-Engineering Immersion Program," achieving a 100% retention rate.',
        },
        {
          id: 'entry-exp-3',
          title: 'Binary & Baelog Consulting',
          subtitle: 'Systems Engineer (Level III)',
          location: '',
          startDate: 'Jan 2016',
          endDate: 'May 2018',
          description: 'Designed a real-time anomaly detection pipeline capable of identifying 15 distinct classes of logic paradox with 99.7% recall.\nReduced cross-service communication latency by 40% through the implementation of a priority-inheritance message bus.\nAuthored internal RFC "Zero-Trust for Non-Human Identities," later adopted as the department standard for service-to-service authentication.',
        },
      ],
    },
  ],
  skills: [
    { id: 'sk-lang', category: 'Languages', name: 'Lumina+, VoidScript, Neo-Python, BinaryFlow' },
    { id: 'sk-fw', category: 'Frameworks', name: 'Ethereal Framework, Ghost-V, DeepCore 9.0' },
    { id: 'sk-expert', category: 'Expertise', name: 'Quantum State Simulation, Neural Weaving, Multi-dimensional Visualization, Logic Provenance' },
  ],
}

export const RIREKISHO_SAMPLE_DATA: ResumeData = {
  personal: {
    firstName: '太郎',
    lastName: '山田',
    furiganaFirstName: 'たろう',
    furiganaLastName: 'やまだ',
    position: 'システムエンジニア',
    birth: '1995年6月10日',
    email: 'taro.yamada@example.com',
    mobile: '090-1234-5678',
    address: '東京都渋谷区神宮前1-2-3',
    homepage: 'github.com/taro-yamada',
  },
  education: [],
  sections: [
    {
      id: 'sec-gakureki',
      title: '学歴・職歴',
      entries: [
        {
          id: 'entry-edu-1',
          title: '東京理科大学',
          subtitle: '工学部情報工学科',
          location: '',
          startDate: '2014年4月',
          endDate: '2018年3月',
          description: '情報セキュリティ研究室に所属\n卒業研究: 「IoT機器における機械学習を用いた異常検知システムの提案」',
        },
        {
          id: 'entry-edu-2',
          title: '都立青山高等学校',
          subtitle: '普通科',
          location: '',
          startDate: '2011年4月',
          endDate: '2014年3月',
          description: '',
        },
        {
          id: 'entry-work-1',
          title: '株式会社テックイノベーション',
          subtitle: 'システムエンジニア',
          location: '',
          startDate: '2021年4月',
          endDate: '現在',
          description: '大手金融機関向け顧客管理システムの開発、Java/Spring BootによるAPI開発を担当\nAPIレスポンスタイムを平均800msから200msに改善、キャッシュ戦略とDBインデックスを最適化\n5名チームでスクラム開発を推進、JiraとConfluenceを活用したタスク管理を導入',
        },
        {
          id: 'entry-work-2',
          title: '株式会社未来システム',
          subtitle: 'プログラマ',
          location: '',
          startDate: '2018年4月',
          endDate: '2021年3月',
          description: '社内勤怠管理システムのリプレイス、PHP(Laravel)からPython(Django)への移行を主導\nPostgreSQLを用いたDB設計とRESTful APIの開発を担当\n既存バッチ処理をAWS Lambdaに移行し運用コストを30%削減',
        },
      ],
    },
    {
      id: 'sec-cert',
      title: '免許・資格',
      entries: [
        { id: 'cert-1', title: '情報処理', subtitle: '', location: '', startDate: '', endDate: '', description: '基本情報技術者試験' },
        { id: 'cert-2', title: 'AWS', subtitle: '', location: '', startDate: '', endDate: '', description: 'AWS ソリューションアーキテクト アソシエイト' },
        { id: 'cert-3', title: 'Java', subtitle: '', location: '', startDate: '', endDate: '', description: 'Oracle Certified Java Programmer Gold' },
        { id: 'cert-4', title: '語学', subtitle: '', location: '', startDate: '', endDate: '', description: '実用英語技能検定2級' },
      ],
    },
    {
      id: 'sec-motivation',
      title: '志望の動機、自己PR、趣味など',
      entries: [
        {
          id: 'motivation-1', title: '', subtitle: '', location: '', startDate: '', endDate: '',
          description: '学生時代からものづくりに興味を持ち、大学では情報セキュリティを専攻。新卒で株式会社未来システムに入社し、Webシステムの開発に従事。株式会社テックイノベーションでは金融系システムの開発を通じて、高品質なソフトウェアを提供することの重要性を学びました。\n\n自己PRとしては、課題に対して原因を根本から追求し、持続可能な解決策を提案できる点です。前職ではレガシーシステムの移行プロジェクトにおいて、単なる移行ではなく、プロセス改善やコスト削減にも貢献しました。\n\n趣味はランニングと読書です。週に3回程度ランニングを続けており、フルマラソンにも挑戦した経験があります。',
        },
      ],
    },
    {
      id: 'sec-requests',
      title: '本人希望記入欄',
      entries: [
        {
          id: 'request-1', title: '', subtitle: '', location: '', startDate: '', endDate: '',
          description: '貴社の事業内容に強く共感し、これまで培ってきたシステム開発の経験を活かして貢献したいと考えています。通勤時間は1時間以内を希望します。リモートワークの可否については面接時にご相談させていただきたく存じます。',
        },
      ],
    },
  ],
  skills: [],
}

export const SHOKUMU_SAMPLE_DATA: ResumeData = {
  personal: {
    firstName: '太郎',
    lastName: '山田',
    position: '営業マネージャー',
    birth: '1985年6月10日',
    email: 'taro.yamada@example.com',
    mobile: '090-1234-5678',
    address: '東京都新宿区西新宿1-2-3',
  },
  education: [],
  sections: [
    {
      id: 'sec-summary',
      title: '職務要約',
      entries: [
        {
          id: 'entry-summary',
          title: '',
          subtitle: '',
          startDate: '',
          endDate: '',
          description: '大学卒業後、広告代理店および人材紹介会社において提案営業に従事。新規開拓から既存顧客に対する深耕営業まで幅広く経験。現在はマネージャーとしてメンバーの育成・指導および業績マネジメントを行っている。',
        },
      ],
    },
    {
      id: 'sec-work',
      title: '職務経歴',
      entries: [
        {
          id: 'entry-work-1',
          title: '綜合印刷株式会社',
          subtitle: '営業',
          startDate: '2018年4月',
          endDate: '2021年3月',
          description: '事業内容：総合印刷・総合広告代理店業\nSF事業部第一グループに配属。新規開拓営業（テレアポ、HP問い合わせ対応）を担当。既存顧客への深耕営業も経験（既存顧客比率80%）\n担当エリア：首都圏エリア。大手法人約3社（担当店舗数120店）を担当\n大型ショッピングモール内スーパーのイベント情報を本部広告担当者から入手。店舗責任者へのアプローチを実施し、店頭POP（パネル、チラシなど）の製作・印刷契約を獲得',
        },
        {
          id: 'entry-work-2',
          title: '綜合印刷株式会社',
          subtitle: '営業マネージャー',
          startDate: '2021年4月',
          endDate: '2023年3月',
          description: '営業マネージャーとしてグループメンバー12名を統括。業績管理および行動管理を担当\nメンバー一人ひとりの目標設定と進捗管理を徹底。四半期ごとのレビューを実施し、達成に向けた改善策を立案\nグループ全体の売上目標達成に向けた戦略立案と実行をリード',
        },
        {
          id: 'entry-work-3',
          title: 'キャリアデザイン株式会社',
          subtitle: '人材紹介コンサルタント',
          startDate: '2023年4月',
          endDate: '2024年3月',
          description: '事業内容：人材紹介業\n人材採用に関する提案営業を実施。店長・SV職・店舗統括・店舗開発職などの採用支援を担当\n担当エリア：都内各地。取引先は常時約20社（主に外食産業、サービス業）\n担当企業の魅力を伝える説明会を定期的に開催。加えて転職希望者の反応やイメージなどの情報を収集し企業側に共有。採用コンセプトや採用手法の改善を提案・実施',
        },
        {
          id: 'entry-work-4',
          title: 'キャリアデザイン株式会社',
          subtitle: 'マネージャー',
          startDate: '2024年4月',
          endDate: '現在',
          description: 'マネージャーとして売上管理、目標設定、メンバー育成、および自社の採用面接（1次面接権）などを担当\n担当エリア：都内各地。グループ全体で100社〜200社（教育産業、アウトソース産業向け）\n徹底した顧客管理を実施。特に取引実績の大きいクライアントに対する深耕営業を半年にわたって徹底。既存客への売上が対前年比130%を達成\n部全体の売上に貢献し、首都圏エリアのベストグループ賞を獲得\nマネージャーとしてメンバー7名（営業5名、アシスタント3名）を統括',
        },
      ],
    },
  ],
  skills: [
    { id: 'sk-1', category: 'Excel', name: '入力・集計、表・グラフ、関数計算' },
    { id: 'sk-2', category: 'PowerPoint', name: '文字入力、図版作成、アニメーション' },
    { id: 'sk-3', category: 'Word', name: '文書作成、差し込み印刷' },
  ],
  summary: '大学卒業後、広告代理店および人材紹介会社において提案営業に従事。新規開拓から既存顧客に対する深耕営業まで幅広く経験。現在はマネージャーとしてメンバーの育成・指導および業績マネジメントを行っている。',
}

export const EMPTY_RESUME_DATA: ResumeData = {
  personal: {
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    mobile: '',
    address: '',
    homepage: '',
  },
  education: [],
  sections: [],
  skills: [],
}
