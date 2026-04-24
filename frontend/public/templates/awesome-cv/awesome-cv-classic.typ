#import "@preview/fontawesome:0.6.0": *
#import "@preview/linguify:0.5.0": *

#fa-version("6")

#let color-darknight = rgb("#131A28")
#let color-darkgray = rgb("#333333")
#let color-gray = rgb("#5d5d5d")
#let default-accent-color = rgb("#262F99")
#let default-location-color = rgb("#333333")

#let linkedin-icon = box(fa-icon("linkedin", fill: color-darknight))
#let github-icon = box(fa-icon("github", fill: color-darknight))
#let gitlab-icon = box(fa-icon("gitlab", fill: color-darknight))
#let bitbucket-icon = box(fa-icon("bitbucket", fill: color-darknight))
#let twitter-icon = box(fa-icon("twitter", fill: color-darknight))
#let bluesky-icon = box(fa-icon("bluesky", fill: color-darknight))
#let mastodon-icon = box(fa-icon("mastodon", fill: color-darknight))
#let google-scholar-icon = box(fa-icon("google-scholar", fill: color-darknight))
#let orcid-icon = box(fa-icon("orcid", fill: color-darknight))
#let phone-icon = box(fa-icon("square-phone", fill: color-darknight))
#let email-icon = box(fa-icon("envelope", fill: color-darknight))
#let birth-icon = box(fa-icon("cake", fill: color-darknight))
#let homepage-icon = box(fa-icon("home", fill: color-darknight))
#let website-icon = box(fa-icon("globe", fill: color-darknight))
#let address-icon = box(fa-icon("location-crosshairs", fill: color-darknight))

#let __format_author_name(author, language) = {
  if language == "zh" or language == "ja" {
    str(author.lastname) + str(author.firstname)
  } else {
    str(author.firstname) + " " + str(author.lastname)
  }
}

#let __apply_smallcaps(content, use-smallcaps) = {
  if use-smallcaps {
    smallcaps(content)
  } else {
    content
  }
}

#let __justify_align(left_body, right_body) = {
  block[
    #left_body
    #box(width: 1fr)[
      #align(right)[
        #right_body
      ]
    ]
  ]
}

#let __justify_align_3(left_body, mid_body, right_body) = {
  block[
    #box(width: 1fr)[
      #align(left)[
        #left_body
      ]
    ]
    #box(width: 1fr)[
      #align(center)[
        #mid_body
      ]
    ]
    #box(width: 1fr)[
      #align(right)[
        #right_body
      ]
    ]
  ]
}

#let __resume_footer(author, language, lang_data, date, use-smallcaps: true) = {
  set text(fill: gray, size: 8pt)
  __justify_align_3[
    #__apply_smallcaps(date, use-smallcaps)
  ][
    #__apply_smallcaps(
      {
        let name = __format_author_name(author, language)
        name + " · " + linguify("resume", from: lang_data)
      },
      use-smallcaps,
    )
  ][
    #context {
      counter(page).display()
    }
  ]
}

#let __contact_item(item, link-prefix: "", inset: (:)) = {
  box[
    #set align(bottom)
    #if ("icon" in item) {
      [#item.icon]
    }
    #box(inset: inset)[
      #if ("link" in item) {
        link(link-prefix + item.link)[#item.text]
      } else {
        item.text
      }
    ]
  ]
}

#let __format_contact_items(author, item-inset: (:)) = {
  let contact-item(item, link-prefix: "") = {
    __contact_item(item, link-prefix: link-prefix, inset: item-inset)
  }

  let items = ()

  if "birth" in author {
    items.push(
      contact-item(
        (text: author.birth, icon: birth-icon),
      ),
    )
  }
  if "phone" in author {
    items.push(
      contact-item(
        (text: author.phone, icon: phone-icon, link: author.phone),
        link-prefix: "tel:",
      ),
    )
  }
  if "email" in author {
    items.push(
      contact-item(
        (text: author.email, icon: email-icon, link: author.email),
        link-prefix: "mailto:",
      ),
    )
  }
  if "homepage" in author {
    items.push(
      contact-item(
        (text: author.homepage, icon: homepage-icon, link: author.homepage),
      ),
    )
  }
  if "github" in author {
    items.push(
      contact-item(
        (text: author.github, icon: github-icon, link: author.github),
        link-prefix: "https://github.com/",
      ),
    )
  }
  if "gitlab" in author {
    items.push(
      contact-item(
        (text: author.gitlab, icon: gitlab-icon, link: author.gitlab),
        link-prefix: "https://gitlab.com/",
      ),
    )
  }
  if "bitbucket" in author {
    items.push(
      contact-item(
        (text: author.bitbucket, icon: bitbucket-icon, link: author.bitbucket),
        link-prefix: "https://bitbucket.org/",
      ),
    )
  }
  if "linkedin" in author {
    items.push(
      contact-item(
        (
          text: author.firstname + " " + author.lastname,
          icon: linkedin-icon,
          link: author.linkedin,
        ),
        link-prefix: "https://www.linkedin.com/in/",
      ),
    )
  }
  if "twitter" in author {
    items.push(
      contact-item(
        (text: "@" + author.twitter, icon: twitter-icon, link: author.twitter),
        link-prefix: "https://twitter.com/",
      ),
    )
  }
  if "bluesky" in author {
    items.push(
      contact-item(
        (text: "@" + author.bluesky, icon: bluesky-icon, link: author.bluesky),
        link-prefix: "https://bsky.app/profile/",
      ),
    )
  }
  if "mastodon" in author {
    items.push(
      contact-item(
        (
          text: "@" + author.mastodon,
          icon: mastodon-icon,
          link: author.mastodon,
        ),
        link-prefix: "https://mastodon.social/@",
      ),
    )
  }
  if "scholar" in author {
    let fullname = str(author.firstname + " " + author.lastname)
    items.push(
      contact-item(
        (text: fullname, icon: google-scholar-icon, link: author.scholar),
        link-prefix: "https://scholar.google.com/citations?user=",
      ),
    )
  }
  if "orcid" in author {
    items.push(
      contact-item(
        (text: author.orcid, icon: orcid-icon, link: author.orcid),
        link-prefix: "https://orcid.org/",
      ),
    )
  }
  if "website" in author {
    items.push(
      contact-item(
        (text: author.website, icon: website-icon, link: author.website),
      ),
    )
  }
  if "custom" in author and type(author.custom) == array {
    for item in author.custom {
      if "text" in item {
        items.push(
          contact-item(
            (
              text: item.text,
              icon: if ("icon" in item) {
                box(fa-icon(item.icon, fill: color-darknight))
              } else {
                none
              },
              link: if ("link" in item) {
                item.link
              } else {
                none
              },
            ),
            link-prefix: "",
          ),
        )
      }
    }
  }

  items
}

#let github-link(github-path) = {
  set box(height: 11pt)

  align(right + horizon)[
    #fa-icon("github", fill: color-darkgray) #h(2pt) #link(
      "https://github.com/" + github-path,
      github-path,
    )
  ]
}

#let secondary-right-header(body) = {
  set text(size: 11pt, weight: "medium")
  body
}

#let tertiary-right-header(body) = {
  set text(weight: "light", size: 9pt)
  body
}

#let justified-header(primary, secondary) = {
  set block(above: 0.7em, below: 0.7em)
  pad[
    #__justify_align[
      == #primary
    ][
      #secondary-right-header[#secondary]
    ]
  ]
}

#let secondary-justified-header(primary, secondary) = {
  __justify_align[
    === #primary
  ][
    #tertiary-right-header[#secondary]
  ]
}

/// ---- Resume Template ----

/// Inspired by https://github.com/posquit0/Awesome-CV
#let resume(
  author: (:),
  profile-picture: none,
  contact-items-separator: h(10pt),
  contact-items-inset: (left: 4pt),
  date: datetime.today().display("[month repr:long] [day], [year]"),
  accent-color: default-accent-color,
  colored-headers: true,
  show-footer: true,
  language: "en",
  font: ("Source Sans 3", "Source Sans Pro"),
  header-font: "Noto Sans CJK SC",
  paper-size: "a4",
  use-smallcaps: true,
  show-address-icon: false,
  description: none,
  keywords: (),
  body,
) = {
  if type(accent-color) == str {
    accent-color = rgb(accent-color)
  }

  let lang_data = toml("lang.toml")

  let desc = if description == none {
    (
      lflib._linguify("resume", lang: language, from: lang_data).ok
        + " "
        + author.firstname
        + " "
        + author.lastname
    )
  } else {
    description
  }

  show: body => context {
    set document(
      author: author.firstname + " " + author.lastname,
      title: lflib._linguify("resume", lang: language, from: lang_data).ok,
      description: desc,
      keywords: keywords,
    )
    body
  }

  set text(
    font: font,
    lang: language,
    size: 11pt,
    fill: color-darkgray,
    fallback: true,
  )

  set page(
    paper: paper-size,
    margin: (
      left: 15mm,
      right: 15mm,
      top: 10mm,
      bottom: if show-footer { 20mm } else { 10mm },
    ),
    footer: if show-footer [#__resume_footer(
      author,
      language,
      lang_data,
      date,
      use-smallcaps: use-smallcaps,
    )] else [],
    footer-descent: 35%,
  )

  set par(spacing: 0.75em, justify: true)

  set heading(numbering: none, outlined: false)

  show heading.where(level: 1): it => block(sticky: true)[
    #set text(size: 16pt, weight: "regular")
    #set align(left)
    #set block(above: 1em)
    #text[#strong[#text(black)[#it.body]]]
    #box(width: 1fr, line(length: 100%))
  ]

  show heading.where(level: 2): it => {
    set text(color-darkgray, size: 12pt, style: "normal", weight: "bold")
    it.body
  }

  show heading.where(level: 3): it => {
    set text(size: 10pt, weight: "regular")
    __apply_smallcaps(it.body, use-smallcaps)
  }

  let name = {
    align(center)[
      #pad(bottom: 5pt)[
        #block[
          #set text(size: 32pt, style: "normal", font: header-font, fill: black)
          #if language == "zh" or language == "ja" [
            #text(weight: "bold")[#author.lastname]#text(
              weight: "thin",
            )[#author.firstname]
          ] else [
            #text(weight: "thin")[#author.firstname]
            #text(weight: "bold")[#author.lastname]
          ]
        ]
      ]
    ]
  }

  let positions-block = {
    set text(fill: black, size: 9pt, weight: "regular")
    align(center)[
      #__apply_smallcaps(
        author.positions.join(text[#"  "#sym.dot.c#"  "]),
        use-smallcaps,
      )
    ]
  }

  let address = {
    set text(size: 9pt, weight: "regular")
    align(center)[
      #if ("address" in author) [
        #if show-address-icon [
          #__contact_item(
            (
              icon: address-icon,
              text: text(author.address),
            ),
            inset: contact-items-inset,
          )
        ] else [
          #text(author.address)
        ]
      ]
    ]
  }

  let contacts = {
    set box(height: 9pt)
    set text(size: 9pt, weight: "regular", style: "normal")

    let items = __format_contact_items(author, item-inset: contact-items-inset)
    align(center, items.join(contact-items-separator))
  }

  if profile-picture != none {
    grid(
      columns: (100% - 4cm, 4cm),
      rows: 100pt,
      gutter: 10pt,
      [
        #name
        #positions-block
        #address
        #contacts
      ],
      align(left + horizon)[
        #block(
          clip: true,
          stroke: 0pt,
          radius: 2cm,
          width: 4cm,
          height: 4cm,
          align(center + horizon, profile-picture),
        )
      ],
    )
  } else {
    name
    positions-block
    address
    contacts
  }

  body
}

#let resume-item(body) = {
  set text(size: 10pt, style: "normal", weight: "light", fill: color-darknight)
  set block(above: 0.75em, below: 1.25em)
  set par(leading: 0.65em)
  block(above: 0.5em)[
    #body
  ]
}

#let resume-entry(
  title: none,
  location: "",
  date: "",
  description: "",
  title-link: none,
  accent-color: default-accent-color,
  location-color: default-location-color,
) = {
  let title-content
  if type(title-link) == str {
    title-content = link(title-link)[#title]
  } else {
    title-content = title
  }
  block(above: 1em, below: 0.65em, sticky: true)[
    #pad[
      #justified-header(title-content, location)
      #if description != "" or date != "" [
        #secondary-justified-header(description, date)
      ]
    ]
  ]
}

#let resume-gpa(numerator, denominator) = {
  set text(size: 12pt, style: "italic", weight: "light")
  text[Cumulative GPA: #box[#strong[#numerator] / #denominator]]
}

#let resume-certification(certification, date) = {
  justified-header(certification, date)
}

#let resume-skill-category(category) = {
  set text(size: 11pt, style: "normal", weight: "bold", hyphenate: false)
  category
}

#let resume-skill-values(values) = {
  set text(size: 11pt, style: "normal", weight: "light")
  values.join(", ")
}

#let resume-skill-item(category, items) = {
  set block(below: 0.65em)
  set pad(top: 2pt)

  pad[
    #grid(
      columns: (3fr, 8fr),
      gutter: 10pt,
      align: left + top,
      resume-skill-category(category), resume-skill-values(items),
    )
  ]
}

#let resume-skill-grid(categories-with-values: (:)) = {
  set block(below: 1.25em)
  set pad(top: 2pt)

  pad[
    #grid(
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
  ]
}

/// ---- End of Resume Template ----
