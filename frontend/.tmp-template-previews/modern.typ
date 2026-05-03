#import "../public/templates/awesome-cv/awesome-cv-modern.typ": *

#show: resume.with(
  author: (
    firstname: "Smart",
    lastname: "Resume",
    positions: ("Senior Interdimensional Systems Architect",),
    email: "smart.resume@kakuti.io",
    phone: "+99 800-1234-5678",
    address: "404 Nebula Drive, Aether City, Zephyrus Province",
    homepage: "www.smartresume-vault.fake",
  ),
  profile-picture: none,
  date: datetime.today().display(),
  paper-size: "a4",
  accent-color: "#DC3522",
  colored-headers: true,
  language: "en",
  font: ("Noto Sans CJK SC", "Noto Sans CJK JP", "Source Sans 3"),
)

= Education

#resume-entry(
  title: "Institute of Theoretical Chronodynamics",
  location: "",
  date: "Sept 2015 -- June 2019",
  description: "Ph.D. in Multimodal Logic & Synthetics",
)
#resume-item[
  - Recipient of the "Mobius Strip" Medal for Theoretical Excellence.
  - Dissertation: "Temporal Deadlock Resolution via Recursive Self-Optimization in Simulated Multiverses."
]

#resume-entry(
  title: "Academy of Applied Absurdities",
  location: "",
  date: "Sept 2013 -- June 2015",
  description: "M.S. in Pervasive System Design",
)
#resume-item[
  - Thesis: "Edge-Case Exploitation for Non-Deterministic Reward Shaping in Gamified Workflows."
  - Developed a probabilistic failure simulator that reduced real-world anomalies by 42%.
]

#resume-entry(
  title: "University of Common Sense (Springfield Campus)",
  location: "",
  date: "Sept 2009 -- June 2013",
  description: "B.S. in Digital Epistemology",
)
#resume-item[
  - Dean's List: 6 consecutive semesters of "Exceeds Unreasonable Expectations."
  - Capstone: "A Framework for Verifying the Unverifiable through Circular Reasoning."
]

= Professional Experience

#resume-entry(
  title: "kakuti Technologies",
  location: "",
  date: "March 2021 -- Present",
  description: "Lead Systems Architect",
)
#resume-item[
  - Spearheaded the design of the "Eternal Flame" framework, boosting data throughput efficiency by 350%.
  - Engineered an automated bias-correction protocol that successfully stabilized three major logical fluctuations across production timelines.
  - Managed a distributed team of 50 virtual entities, achieving a 100% zero-latency delivery rate across disparate quantum clusters.
]

#resume-entry(
  title: "Paradox Solutions Inc.",
  location: "",
  date: "June 2018 -- Feb 2021",
  description: "Senior Infrastructure Alchemist",
)
#resume-item[
  - Architected a self-healing mesh network that autonomously rerouted traffic around causality violations, reducing unplanned outages by 87%.
  - Led the migration of 200+ legacy monoliths into a serverless function fabric, cutting operational costs by 63%.
  - Mentored 12 junior engineers through the "Chaos-Engineering Immersion Program," achieving a 100% retention rate.
]

#resume-entry(
  title: "Binary & Baelog Consulting",
  location: "",
  date: "Jan 2016 -- May 2018",
  description: "Systems Engineer (Level III)",
)
#resume-item[
  - Designed a real-time anomaly detection pipeline capable of identifying 15 distinct classes of logic paradox with 99.7% recall.
  - Reduced cross-service communication latency by 40% through the implementation of a priority-inheritance message bus.
  - Authored internal RFC "Zero-Trust for Non-Human Identities," later adopted as the department standard for service-to-service authentication.
]

= Skills

#resume-skill-item("Languages", ("Lumina+", "VoidScript", "Neo-Python", "BinaryFlow"))
#resume-skill-item("Frameworks", ("Ethereal Framework", "Ghost-V", "DeepCore 9.0"))
#resume-skill-item("Expertise", ("Quantum State Simulation", "Neural Weaving", "Multi-dimensional Visualization", "Logic Provenance"))

