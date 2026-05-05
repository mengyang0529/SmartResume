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
    margin: (left: 10mm, right: 10mm, top: 10mm, bottom: 10mm),
  )
  set par(spacing: 0.3em, leading: 4pt)

  // 1. Header with Name and Photo
  grid(
    columns: (1fr, 3.4cm),
    column-gutter: 5mm,
    [
      // Date row
      #align(right)[#text(size: 9pt)[#datetime.today().display("[year]年[month]月[day]日") 现在]]
      #v(2pt)
      
      // Name Box
      #table(
        columns: (1fr),
        rows: (0.8cm, 2.2cm),
        inset: (x: 8pt, y: 4pt),
        stroke: 0.5pt,
        [#set align(left + horizon); #text(size: 7pt)[ふりがな] #h(1em) #text(size: 9pt)[#personal.furigana]],
        [#set align(center + horizon); #text(size: 18pt, weight: "bold")[#personal.name]]
      )
      
      // Birth and Sex
      #v(-0.5pt) // Overlap borders
      #table(
        columns: (1fr, 80pt),
        inset: (x: 8pt, y: 4pt),
        stroke: 0.5pt,
        [#text(size: 10pt)[#personal.birth 生] (满 #h(2em) 岁)],
        [#set align(center); #text(size: 10pt)[男 ・ 女]]
      )
    ],
    [
      #v(1.15cm) // Align with name box
      #if photo != none {
        rect(width: 3.4cm, height: 4.5cm, stroke: 0.5pt, padding: 0pt)[#photo]
      } else {
        rect(width: 3.4cm, height: 4.5cm, stroke: 0.5pt + gray, fill: gray.lighten(90%))[
          #set align(center + horizon)
          #text(size: 8pt, fill: gray)[
            写真を贴る位置 \
            (纵 36~40mm \ 横 24~30mm)
          ]
        ]
      }
    ]
  )

  // 2. Address and Contact
  #v(-0.5pt)
  #table(
    columns: (1fr),
    inset: (x: 8pt, y: 4pt),
    stroke: 0.5pt,
    [#text(size: 7pt)[ふりがな] #h(1em) #text(size: 8pt)[#personal.address-kana]],
    [
      #grid(
        columns: (2.5em, 1fr),
        [#text(size: 8pt)[住所]],
        [#text(size: 10pt)[〒 #personal.zipcode] \ #v(2pt) #text(size: 10pt)[#personal.address]]
      )
    ],
    [
      #grid(
        columns: (1fr, 1fr),
        [#text(size: 8pt)[电话] #h(1em) #text(size: 10pt)[#personal.phone]],
        [#text(size: 8pt)[E-mail] #h(0.5em) #text(size: 9pt)[#personal.email]]
      )
    ]
  )

  v(0.5em)
  body
}

// Section title with lines that look like part of a table
#let section-title(title) = {
  table(
    columns: (1fr),
    inset: (y: 3pt),
    stroke: (bottom: 0.5pt),
    fill: gray.lighten(95%),
    [#set align(center); #text(size: 10pt, weight: "bold", spacing: 1em)[#title]]
  )
  v(-0.5pt)
}

#let rireki-table(..items) = {
  table(
    columns: (3cm, 1fr),
    rows: (1.2em),
    inset: (x: 8pt, y: 6pt),
    stroke: 0.5pt,
    align: (center + horizon, left + horizon),
    ..items
  )
  v(0.5em)
}

#let license-table(..items) = {
  section-title("免 許 ・ 資 格")
  rireki-table(..items)
}

#let motivation-block(content) = {
  section-title("志望動機・特技・好きな学科・アピールポイントなど")
  rect(width: 100%, stroke: 0.5pt, inset: 10pt, min-height: 4cm)[
    #set text(size: 9pt)
    #set par(leading: 6pt)
    #content
  ]
  v(0.5em)
}

#let hopes-block(content) = {
  section-title("本人希望記入欄（特に給料・職種・勤務時間・勤務地等に対して希望があれば記入）")
  rect(width: 100%, stroke: 0.5pt, inset: 10pt, min-height: 2cm)[
    #set text(size: 9pt)
    #set par(leading: 6pt)
    #content
  ]
}
