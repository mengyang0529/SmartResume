// Rirekisho (履歴書) Template
// Japanese-style resume following the standard JIS format

#let resume(
  author: (:),
  profile-picture: none,
  date: datetime.today().display("[year]年[month]月[day]日"),
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

  body
}
