#import "@preview/fontawesome:0.6.0": *
#import "@preview/linguify:0.5.0": *

// const colors
#let color-darknight = rgb("#131A28")
#let color-darkgray = rgb("#333333")
#let color-gray = rgb("#5d5d5d")
#let color-lightgray = rgb("#e8e8e8")
#let color-white = rgb("#ffffff")
#let default-accent-color = rgb("#2b5797")
#let accent_color = default-accent-color

// const icons
#let phone-icon = box(fa-icon("square-phone", fill: white))
#let email-icon = box(fa-icon("envelope", fill: white))
#let github-icon = box(fa-icon("github", fill: white))
#let linkedin-icon = box(fa-icon("linkedin", fill: white))
#let address-icon = box(fa-icon("location-crosshairs", fill: white))
#let homepage-icon = box(fa-icon("globe", fill: white))

/// --- Modern Resume Template ---
/// Two-column layout with dark sidebar

#let resume(
  author: (:),
  profile-picture: none,
  date: datetime.today().display("[month repr:long] [day], [year]"),
  accent-color: default-accent-color,
  colored-headers: true,
  show-footer: true,
  language: "en",
  font: ("Noto Sans CJK SC", "Noto Sans CJK JP", "Source Sans 3"),
  header-font: "Noto Sans CJK SC",
  paper-size: "a4",
  use-smallcaps: true,
  body,
) = {
  if type(accent-color) == str {
    accent-color = rgb(accent-color)
  }

  let lang_data = toml("lang.toml")

  let sidebar-width = 7.5cm

  show: body => context {
    set document(
      author: author.firstname + " " + author.lastname,
      title: "Resume",
    )
    body
  }

  set text(
    font: font,
    lang: language,
    size: 10pt,
    fill: color-darkgray,
    fallback: true,
  )

  set page(
    paper: paper-size,
    margin: (left: 0mm, right: 0mm, top: 0mm, bottom: 0mm),
  )

  set heading(numbering: none, outlined: false)

  show heading.where(level: 1): it => block(sticky: true, above: 1em)[
    #set text(size: 14pt, weight: "bold")
    #set align(left)
    #text(accent-color)[#it.body]
    #box(width: 1fr, line(length: 100%, stroke: 0.4pt + accent-color))
  ]

  // Sidebar block
  let sidebar-body = {
    set text(fill: white, size: 9.5pt)
    set par(justify: false)

    pad(left: 6mm, right: 6mm, top: 8mm, bottom: 8mm)[

      // Name
      #align(center)[
        #set text(size: 22pt, weight: "bold", font: header-font)
        #if language == "zh" or language == "ja" [
          #text(fill: accent-color)[#author.lastname]#text(fill: white)[#author.firstname]
        ] else [
          #text(fill: accent-color)[#author.firstname]#text(fill: white)[#author.lastname]
        ]
      ]

      #v(3mm)

      // Position
      #if "positions" in author and author.positions.len() > 0 [
        #set text(size: 9pt, fill: rgb("#cccccc"))
        #align(center)[
          #author.positions.join(", ")
        ]
      ]

      #v(5mm)
      #line(length: 100%, stroke: 0.5pt + white)
      #v(4mm)

      // Contact
      #set text(size: 9pt, fill: white)
      #let contact-icon(icon) = box(
        inset: (right: 4pt),
        icon,
      )
      #if "email" in author [
        #contact-icon(email-icon)#link("mailto:" + author.email)[#author.email] \
      ]
      #if "phone" in author [
        #contact-icon(phone-icon)#link("tel:" + author.phone)[#author.phone] \
      ]
      #if "address" in author [
        #contact-icon(address-icon)#author.address \
      ]
      #if "github" in author [
        #contact-icon(github-icon)#link("https://github.com/" + author.github)[#author.github] \
      ]
      #if "linkedin" in author [
        #contact-icon(linkedin-icon)#link("https://linkedin.com/in/" + author.linkedin)[LinkedIn] \
      ]
      #if "homepage" in author [
        #contact-icon(homepage-icon)#link(author.homepage)[#author.homepage] \
      ]
    ]
  }

  // Horizontal grid: sidebar (left) + content (right)
  grid(
    columns: (sidebar-width, 1fr),
    rows: 100%,
    gutter: 0pt,
    // Sidebar
    block(
      fill: accent-color,
      height: 100%,
      width: 100%,
      sidebar-body,
    ),
    // Content area
    pad(left: 8mm, right: 8mm, top: 6mm, bottom: 6mm)[
      #body
    ],
  )
}

/// Resume entry with modern minimal style
#let resume-entry(
  title: none,
  location: "",
  date: "",
  description: "",
  title-link: none,
  accent-color: default-accent-color,
  location-color: color-gray,
) = {
  let title-content
  if type(title-link) == str {
    title-content = link(title-link)[#title]
  } else {
    title-content = title
  }
  block(above: 0.8em, below: 0.3em)[
    #grid(
      columns: (1fr, auto),
      rows: auto,
      gutter: 4pt,
      [
        #set text(size: 11pt, weight: "bold", fill: color-darknight)
        #title-content
      ],
      [
        #set text(size: 9pt, fill: location-color)
        #align(right)[#location]
      ],
    )
    #if date != "" or description != "" [
      #grid(
        columns: (auto, 1fr),
        gutter: 4pt,
        [
          #set text(size: 9pt, fill: accent-color)
          #date
        ],
        [
          #set text(size: 9.5pt, fill: color-gray)
          #description
        ],
      )
    ]
  ]
}

/// Resume item for bullet points
#let resume-item(body) = {
  set text(size: 9.5pt, fill: color-darknight)
  set block(above: 0.3em, below: 0.5em)
  set par(leading: 0.5em)
  block[
    #body
  ]
}

/// Skill category header
#let resume-skill-category(category) = {
  set text(size: 10pt, weight: "bold", fill: accent_color)
  category
}

/// Skill values
#let resume-skill-values(values) = {
  set text(size: 10pt, fill: color-darkgray)
  values.join(text[  #sym.bar  ])
}

/// Skill item with category and tags
#let resume-skill-item(category, items) = {
  set block(below: 0.5em)
  grid(
    columns: (3.5cm, 1fr),
    gutter: 6pt,
    align: left + top,
    resume-skill-category(category),
    resume-skill-values(items),
  )
}

/// Skill grid
#let resume-skill-grid(categories-with-values: (:)) = {
  set block(below: 1em)
  grid(
    columns: (auto, auto),
    gutter: 10pt,
    align: left + top,
    ..categories-with-values
      .pairs()
      .map(((key, value)) => (
        resume-skill-category(key),
        resume-skill-values(value),
      ))
      .flatten()
  )
}
