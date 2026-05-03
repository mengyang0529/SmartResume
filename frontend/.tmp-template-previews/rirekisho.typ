#import "../public/templates/rirekisho/rirekisho.typ": *

#show: resume.with(
  author: (
    firstname: "太郎",
    lastname: "山田",
    furigana-first: "たろう",
    furigana-last: "やまだ",
    birth: "1995年6月10日",
    address: "東京都渋谷区神宮前1-2-3",
    phone: "090-1234-5678",
    email: "taro.yamada@example.com",
  ),
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
)

// Header section
#table(
  columns: (2cm, 1fr, 4cm),
  stroke: 0.5pt + black,
  rows: (auto, auto, auto, auto),
  [#align(center)[*氏名*]],
  [#align(left)[
    #grid(
      columns: (auto, auto),
      row-gutter: 2pt,
      text(size: 9pt, weight: "regular")[やまだ],
      text(size: 9pt, weight: "regular")[たろう],
      text(size: 14pt, weight: "bold")[山田],
      text(size: 14pt, weight: "bold")[太郎],
    )
  ]],
  table.cell(rowspan: 4)[#align(center + horizon)[
    #block(height: 4.5cm, stroke: 0.5pt + black, width: 100%, inset: 4pt)[
      #text(fill: luma(160), size: 8pt)[写真]
      #linebreak()
      #text(size: 7pt)[4cm×3cm]
    ]
  ]],
  [#align(center)[*生年月日*]],
  [#text(size: 9pt)[1995年6月10日]],
  [#align(center)[*現住所*]],
  [
    #text(size: 9pt)[
      東京都渋谷区神宮前1-2-3
      #linebreak()
      TEL: 090-1234-5678
      #linebreak()
      Email: taro.yamada\@example.com
    ]
  ],
  table.cell(colspan: 2)[#text(size: 8pt)[連絡先に○をつけてください（　　現住所　　・　　連絡先　　）]],
)
// Education & Work History
#table(
  columns: (2.5cm, 1fr),
  stroke: 0.5pt + black,
  [#align(center)[*年　月*]], [#align(center)[*学歴・職歴*]],
  [2014年4月], [東京理科大学 工学部情報工学科],
  [2011年4月], [都立青山高等学校 普通科],
  [2021年4月], [株式会社テックイノベーション システムエンジニア],
  [2018年4月], [株式会社未来システム プログラマ],
)

// Certifications
#table(
  columns: (2.5cm, 1fr),
  stroke: 0.5pt + black,
  [#align(center)[*年　月*]], [#align(center)[*免許・資格*]],
  [], [情報処理: 基本情報技術者試験],
  [], [AWS: AWS ソリューションアーキテクト アソシエイト],
  [], [Java: Oracle Certified Java Programmer Gold],
  [], [語学: 実用英語技能検定2級],
)

// Motivation
#table(
  columns: (1fr),
  stroke: 0.5pt + black,
  table.cell(colspan: 1)[#align(center)[*志望の動機、自己PR、趣味など*]],
  [#text(size: 9pt)[学生時代からものづくりに興味を持ち、大学では情報セキュリティを専攻。新卒で株式会社未来システムに入社し、Webシステムの開発に従事。株式会社テックイノベーションでは金融系システムの開発を通じて、高品質なソフトウェアを提供することの重要性を学びました。
自己PRとしては、課題に対して原因を根本から追求し、持続可能な解決策を提案できる点です。前職ではレガシーシステムの移行プロジェクトにおいて、単なる移行ではなく、プロセス改善やコスト削減にも貢献しました。
趣味はランニングと読書です。週に3回程度ランニングを続けており、フルマラソンにも挑戦した経験があります。]],
)
// Requests
#table(
  columns: (1fr),
  stroke: 0.5pt + black,
  table.cell(colspan: 1)[#align(center)[*本人希望記入欄*]],
  [#text(size: 9pt)[貴社の事業内容に強く共感し、これまで培ってきたシステム開発の経験を活かして貢献したいと考えています。通勤時間は1時間以内を希望します。リモートワークの可否については面接時にご相談させていただきたく存じます。]],
)
