// Shokumu Keirekisho (職務経歴書) Template
// Japanese-style career history document with detailed project experience

#let resume(
  author: (:),
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
  paper-size: "a4",
  body,
) = {
  set text(font: font, lang: language, size: 10pt, fill: black, fallback: true)
  set page(
    paper: paper-size,
    margin: (left: 15mm, right: 15mm, top: 15mm, bottom: 15mm),
  )
  set par(spacing: 0.6em, justify: true)
  set heading(numbering: none, outlined: false)

  body
}

#let section-title(title) = {
  block(sticky: true, above: 1.2em, below: 0.6em)[
    #set text(size: 13pt, weight: "bold")
    #align(left)[#title]
    #line(length: 100%, stroke: 0.5pt + black)
  ]
}

#let exp-header(company, period) = {
  block(above: 0.8em, below: 0.2em)[
    #grid(
      columns: (1fr, auto),
      [#text(size: 11pt, weight: "bold")[#company]],
      [#text(size: 9pt, weight: "regular")[#period]],
    )
  ]
}

#let exp-row(label, value) = {
  if value != "" {
    grid(
      columns: (auto, 1fr),
      gutter: 4pt,
      [#text(size: 9pt, weight: "bold")[#label]],
      [#text(size: 9pt)[#value]],
    )
  }
}

#let skill-category(category, items) = {
  grid(
    columns: (auto, 1fr),
    gutter: 8pt,
    [#text(size: 10pt, weight: "bold")[#category]],
    [#text(size: 10pt)[#items]],
  )
}

#let bullet-items(..items) = {
  list(
    indent: 1.5em,
    body-indent: 0.5em,
    marker: [— ],
    ..items,
  )
}

#let block-separator = {
  block(above: 0.3em, below: 0.3em)
}
