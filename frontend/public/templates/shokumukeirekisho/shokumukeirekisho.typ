// Shokumu Keirekisho (職務経歴書) Template
// Traditional Japanese career history document format

#let resume(
  author: (:),
  date: "",
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
  set par(spacing: 0.7em, justify: true)
  set heading(numbering: none, outlined: false)

  body
}

#let section-title(title) = {
  block(sticky: true, above: 1.5em, below: 0.8em)[
    #set text(size: 11pt, weight: "bold")
    ■ #title
  ]
}

#let work-header(company, right-content) = {
  block(above: 0.8em, below: 0.3em)[
    #text(size: 10.5pt, weight: "bold")[#company]
    #h(1fr)
    #text(size: 9pt, weight: "regular")[#right-content]
  ]
}

#let section-divider = {
  block(above: 1.2em, below: 0.5em)[
    #line(length: 100%, stroke: 0.5pt + black)
  ]
}

