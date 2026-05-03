#import "../public/templates/shokumukeirekisho/shokumukeirekisho.typ": *

#show: resume.with(
  author: (
    firstname: "太郎",
    lastname: "山田",
  ),
  date: "2026年5月3日",
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
)

// Document Header
#align(center)[#text(size: 15pt, weight: "bold")[職務経歴書]]
#v(2pt)
#align(right)[
  #text(size: 9pt)[2026年5月3日現在]
  #linebreak()
  #text(size: 9pt)[氏名 山田 太郎]
]

#v(10pt)

// ── Summary ──
#section-title[職務要約]
大学卒業後、広告代理店および人材紹介会社において提案営業に従事。新規開拓から既存顧客に対する深耕営業まで幅広く経験。現在はマネージャーとしてメンバーの育成・指導および業績マネジメントを行っている。

// ── Work Experience ──
#section-title[職務経歴]
#work-header("綜合印刷株式会社", "2018年4月 ～ 2023年3月")
#table(
  columns: (3cm, 1fr),
  inset: (x: 5pt, y: 6pt),
  stroke: 0.5pt + black,
  table.cell(fill: luma(220))[#align(center)[*期間*]],
  table.cell(fill: luma(220))[#align(center)[*業務内容*]],
  [2021年4月 ～ 2023年3月],
  [#text(size: 9pt)[
    営業マネージャー
    #linebreak()
    #list(
      marker: [・],
      [営業マネージャーとしてグループメンバー12名を統括。業績管理および行動管理を担当],
      [メンバー一人ひとりの目標設定と進捗管理を徹底。四半期ごとのレビューを実施し、達成に向けた改善策を立案],
      [グループ全体の売上目標達成に向けた戦略立案と実行をリード],
    )
  ]],
  [2018年4月 ～ 2021年3月],
  [#text(size: 9pt)[
    営業
    #linebreak()
    #list(
      marker: [・],
      [SF事業部第一グループに配属。新規開拓営業（テレアポ、HP問い合わせ対応）を担当。既存顧客への深耕営業も経験（既存顧客比率80%）],
      [担当エリア：首都圏エリア。大手法人約3社（担当店舗数120店）を担当],
      [大型ショッピングモール内スーパーのイベント情報を本部広告担当者から入手。店舗責任者へのアプローチを実施し、店頭POP（パネル、チラシなど）の製作・印刷契約を獲得],
    )
  ]],
)

#work-header("キャリアデザイン株式会社", "2023年4月 ～ 現在")
#table(
  columns: (3cm, 1fr),
  inset: (x: 5pt, y: 6pt),
  stroke: 0.5pt + black,
  table.cell(fill: luma(220))[#align(center)[*期間*]],
  table.cell(fill: luma(220))[#align(center)[*業務内容*]],
  [2024年4月 ～ 現在],
  [#text(size: 9pt)[
    マネージャー
    #linebreak()
    #list(
      marker: [・],
      [マネージャーとして売上管理、目標設定、メンバー育成、および自社の採用面接（1次面接権）などを担当],
      [担当エリア：都内各地。グループ全体で100社〜200社（教育産業、アウトソース産業向け）],
      [徹底した顧客管理を実施。特に取引実績の大きいクライアントに対する深耕営業を半年にわたって徹底。既存客への売上が対前年比130%を達成],
      [部全体の売上に貢献し、首都圏エリアのベストグループ賞を獲得],
      [マネージャーとしてメンバー7名（営業5名、アシスタント3名）を統括],
    )
  ]],
  [2023年4月 ～ 2024年3月],
  [#text(size: 9pt)[
    人材紹介コンサルタント
    #linebreak()
    #list(
      marker: [・],
      [人材採用に関する提案営業を実施。店長・SV職・店舗統括・店舗開発職などの採用支援を担当],
      [担当エリア：都内各地。取引先は常時約20社（主に外食産業、サービス業）],
      [担当企業の魅力を伝える説明会を定期的に開催。加えて転職希望者の反応やイメージなどの情報を収集し企業側に共有。採用コンセプトや採用手法の改善を提案・実施],
    )
  ]],
)

#section-divider

// ── Skills ──
#section-title[活かせるスキル・知識]
#list(
  marker: [・],
  [Excel : 入力・集計、表・グラフ、関数計算],
  [PowerPoint : 文字入力、図版作成、アニメーション],
  [Word : 文書作成、差し込み印刷],
)

// ── Certifications ──
#section-title[資格]
#list(
  marker: [・],
  [普通自動車免許: 20XX年XX月取得],
  [TOEIC: 730点（20XX年XX月取得）],
)

// ── Self PR ──
#section-title[自己PR]
企画提案力：仮説検証型の営業スタイルを心掛けている。ヒアリング→仮説構築→課題解決法の提案といった一連の流れをクライアントに対して行っている。情報収集に注力することで顧客自身も気づいていない潜在ニーズを探り当て提案に活かしてきた。

マネジメントスキル：マネージャー就任後、グループの業績やモチベーションの最大化を常に意識。メンバーの行動管理を徹底しながらも健康管理やモチベーションの維持にも配慮。グループ独自の「ノー残業制度」の導入や部内表彰制度への「グッドプラクティス賞」の追加を提案し、競争の激しい首都圏エリアにおいて高い達成率を実現した。

#align(right + bottom)[#text(size: 10pt)[以上]]
