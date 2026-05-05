// Rirekisho (履歴書) Template
// Japanese-style resume following the standard JIS format

#let resume(
  personal: (:),
  photo: none,
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
  paper-size: "a4",
  body,
) = {
  set text(font: font, lang: language, size: 10pt, fill: black, fallback: true)
  set page(
    paper: paper-size,
    margin: (left: 6mm, right: 6mm, top: 6mm, bottom: 6mm),
  )
  set table(inset: (x: 4pt, y: 8pt))
  set par(spacing: 0.3em, leading: 4pt)
  show table.cell: set par(leading: 8pt)

  // Header Section
  grid(
    columns: (1fr, 4cm),
    column-gutter: 1cm,
    [
      #text(size: 8pt)[#personal.furigana] \
      #v(-6pt)
      #text(size: 20pt, weight: "bold")[#personal.name]
      #h(2em)
      #text(size: 10pt)[#personal.birth 生]
      #v(8pt)
      #line(length: 100%, stroke: 0.5pt)
      #v(4pt)
      #text(size: 8pt)[住所] \
      #text(size: 10pt)[#personal.address]
      #v(4pt)
      #line(length: 100%, stroke: 0.5pt)
      #v(4pt)
      #grid(
        columns: (1fr, 1fr),
        [#text(size: 8pt)[電話番号] \ #text(size: 10pt)[#personal.phone]],
        [#text(size: 8pt)[メールアドレス] \ #text(size: 10pt)[#personal.email]]
      )
    ],
    [
      #if photo != none {
        photo
      } else {
        rect(width: 100%, height: 4cm, stroke: 0.5pt + gray, fill: gray.lighten(80%))[
          #align(center + horizon)[写真贴付]
        ]
      }
    ]
  )

  v(1em)
  body
}

#let section-title(title) = {
  block(above: 1.5em, below: 1em)[
    #set text(size: 11pt, weight: "bold")
    #align(center)[#title]
    #v(-0.5em)
    #line(length: 100%, stroke: 0.5pt)
  ]
}

#let rireki-table(..items) = {
  table(
    columns: (3.5cm, 1fr),
    stroke: (x, y) => if y == 0 { (top: 0.5pt, bottom: 0.5pt) } else { (bottom: 0.5pt) },
    fill: none,
    ..items
  )
}

#let license-table(..items) = {
  section-title("免許・資格")
  rireki-table(..items)
}

#let motivation-block(content) = {
  section-title("志望動機・特技・好きな学科・アピールポイントなど")
  rect(width: 100%, stroke: 0.5pt, inset: 1em)[
    #set par(leading: 6pt)
    #content
  ]
}

#let hopes-block(content) = {
  section-title("本人希望記入欄（特に給料・職種・勤務時間・勤務地等に対して希望があれば記入）")
  rect(width: 100%, stroke: 0.5pt, inset: 1em)[
    #set par(leading: 6pt)
    #content
  ]
}
