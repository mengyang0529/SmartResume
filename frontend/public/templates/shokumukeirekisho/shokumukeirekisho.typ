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
  block(sticky: true, above: 1.2em, below: 0.5em)[
    #set text(size: 12pt, weight: "bold")
    #title
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

#let company-summary-block(
  date: "",
  company: "",
  title: "",
) = {
  block(
    width: 100%,
    stroke: 0.5pt + black,
    radius: 0pt,
    clip: true,
    above: 1em,
    below: 0.5em,
  )[
    #stack(
      dir: ttb,
      // Row 1: Date and Company
      rect(
        width: 100%,
        fill: white,
        stroke: (bottom: 0.5pt + black),
        inset: (x: 8pt, y: 6pt),
      )[
        #set text(size: 9pt)
        #date #h(2em) #text(size: 10pt, weight: "bold")[#company]
      ],
      // Row 2: Main Job Title
      rect(
        width: 100%,
        stroke: (bottom: (dash: "dotted", paint: black, thickness: 0.5pt)),
        inset: (x: 8pt, y: 6pt),
      )[
        #set text(size: 9.5pt)
        #title
      ]
    )
  ]
}

#let project-block(
  company: "",
  role: "",
  body: [],
) = {
  block(
    width: 100%,
    stroke: 0.5pt + black,
    radius: 0pt,
    clip: true,
    above: 0.5em,
    below: 1em,
  )[
    #stack(
      dir: ttb,
      // Row 1: Company (Gray header)
      rect(
        width: 100%,
        fill: luma(245),
        stroke: (bottom: 0.5pt + black),
        inset: (x: 8pt, y: 6pt),
      )[
        #set text(size: 10pt, weight: "bold")
        #company
      ],
      // Row 2: Project Role / Subtitle
      rect(
        width: 100%,
        stroke: (bottom: (dash: "dotted", paint: black, thickness: 0.5pt)),
        inset: (x: 8pt, y: 6pt),
      )[
        #set text(size: 9.5pt)
        #role
      ],
      // Row 3: Content Body
      pad(x: 8pt, y: 8pt)[
        #set text(size: 9pt)
        #set par(spacing: 0.6em)
        #body
      ]
    )
  ]
}
