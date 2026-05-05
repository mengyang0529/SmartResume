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
    margin: (left: 12mm, right: 12mm, top: 10mm, bottom: 10mm),
  )
  set par(spacing: 0.3em, leading: 4pt)
  
  let line-thickness = 0.4pt
  let section-gap = 1.0em

  // --- 1. Header with Name and Photo ---
  grid(
    columns: (1fr, 3.4cm),
    column-gutter: 8mm,
    [
      #align(right)[
        #text(size: 9pt)[#datetime.today().display("[year]年[month]月[day]日") 现在]
      ]
      #v(1pt)
      
      #table(
        columns: (1fr),
        rows: (0.7cm, 2.1cm),
        inset: (x: 8pt, y: 0pt),
        stroke: line-thickness,
        [
          #set align(left + horizon)
          #text(size: 7pt)[ふりがな] #h(1.5em) #text(size: 8.5pt)[#personal.furigana]
        ],
        [
          #set align(center + horizon)
          #text(size: 20pt, weight: "bold", tracking: 0.2em)[#personal.name]
        ]
      )
      
      #v(-line-thickness)
      #table(
        columns: (1fr, 80pt),
        rows: (1.1cm),
        inset: (x: 8pt, y: 0pt),
        stroke: line-thickness,
        [
          #set align(left + horizon)
          #text(size: 10pt)[#personal.birth 生] #h(1em) #text(size: 9pt)[(满 #h(2em) 岁)]
        ],
        [
          #set align(center + horizon)
          #text(size: 10pt)[男 ・ 女]
        ]
      )
    ],
    [
      #v(1.2cm)
      #if photo != none {
        rect(width: 3.4cm, height: 4.5cm, stroke: line-thickness, padding: 0pt)[#photo]
      } else {
        rect(width: 3.4cm, height: 4.5cm, stroke: line-thickness + gray, fill: gray.lighten(90%))[
          #set align(center + horizon)
          #text(size: 8pt, fill: gray)[
            写真を贴る位置 \
            (纵 36~40mm \ 横 24~30mm)
          ]
        ]
      }
    ]
  )

  // --- 2. Address and Contact ---
  v(section-gap)
  table(
    columns: (1fr),
    rows: (0.6cm, 1.2cm, 1.1cm),
    inset: (x: 8pt, y: 0pt),
    stroke: line-thickness,
    [
      #set align(left + horizon)
      #text(size: 7pt)[ふりがな] #h(1.5em) #text(size: 8.5pt)[#personal.address-kana]
    ],
    [
      #set align(left + horizon)
      #grid(
        columns: (3em, 1fr),
        [#text(size: 8pt)[住所]],
        [#text(size: 10pt)[〒 #personal.zipcode] #h(1em) #text(size: 10pt)[#personal.address]]
      )
    ],
    [
      #set align(left + horizon)
      #grid(
        columns: (1fr, 1fr),
        [#text(size: 8.5pt)[电话] #h(1.5em) #text(size: 10pt)[#personal.phone]],
        [#text(size: 8.5pt)[E-mail] #h(1.2em) #text(size: 9pt)[#personal.email]]
      )
    ]
  )

  v(section-gap)
  body
}

// Section Header logic
#let section-title(title) = {
  table(
    columns: (1fr),
    inset: (y: 6pt),
    stroke: 0.4pt,
    fill: gray.lighten(96%),
    [
      #set align(center)
      #text(size: 10pt, weight: "bold", spacing: 0.8em)[#title]
    ]
  )
  v(-0.4pt)
}

#let rireki-table(..items) = {
  table(
    columns: (3cm, 1fr),
    inset: (x: 8pt, y: 8pt),
    stroke: 0.4pt,
    align: (center + horizon, left + horizon),
    ..items
  )
  v(1.0em)
}

// Generic content block for non-date sections (like Motivation, Hopes, etc.)
#let content-block(content) = {
  block(width: 100%, stroke: 0.4pt, inset: 10pt, breakable: true)[
    #set text(size: 9.5pt)
    #set par(leading: 6pt)
    #content
  ]
  v(1.0em)
}
