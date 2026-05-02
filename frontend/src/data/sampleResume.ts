import type { ResumeData } from '../types/resume'

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    firstName: 'Smart',
    lastName: 'Resume',
    position: 'Senior Interdimensional Systems Architect',
    email: 'smart.resume@kakuti.io',
    mobile: '+99 800-1234-5678',
    address: '404 Nebula Drive, Aether City, Zephyrus Province',
    homepage: 'www.smartresume-vault.fake',
  },
  education: [
    {
      id: 'edu-phd',
      school: 'Institute of Theoretical Chronodynamics',
      degree: 'Ph.D. in Multimodal Logic & Synthetics',
      startDate: 'Sept 2015',
      endDate: 'June 2019',
      description: 'Recipient of the "Mobius Strip" Medal for Theoretical Excellence.\nDissertation: "Temporal Deadlock Resolution via Recursive Self-Optimization in Simulated Multiverses."',
    },
    {
      id: 'edu-ms',
      school: 'Academy of Applied Absurdities',
      degree: 'M.S. in Pervasive System Design',
      startDate: 'Sept 2013',
      endDate: 'June 2015',
      description: 'Thesis: "Edge-Case Exploitation for Non-Deterministic Reward Shaping in Gamified Workflows."\nDeveloped a probabilistic failure simulator that reduced real-world anomalies by 42%.',
    },
    {
      id: 'edu-bs',
      school: 'University of Common Sense (Springfield Campus)',
      degree: 'B.S. in Digital Epistemology',
      startDate: 'Sept 2009',
      endDate: 'June 2013',
      description: 'Dean\'s List: 6 consecutive semesters of "Exceeds Unreasonable Expectations."\nCapstone: "A Framework for Verifying the Unverifiable through Circular Reasoning."',
    },
  ],
  sections: [
    {
      id: 'sec-exp',
      title: 'Professional Experience',
      entries: [
        {
          id: 'entry-exp-1',
          title: 'kakuti Technologies',
          subtitle: 'Lead Systems Architect',
          location: '',
          startDate: 'March 2021',
          endDate: 'Present',
          description: 'Spearheaded the design of the "Eternal Flame" framework, boosting data throughput efficiency by 350%.\nEngineered an automated bias-correction protocol that successfully stabilized three major logical fluctuations across production timelines.\nManaged a distributed team of 50 virtual entities, achieving a 100% zero-latency delivery rate across disparate quantum clusters.',
        },
        {
          id: 'entry-exp-2',
          title: 'Paradox Solutions Inc.',
          subtitle: 'Senior Infrastructure Alchemist',
          location: '',
          startDate: 'June 2018',
          endDate: 'Feb 2021',
          description: 'Architected a self-healing mesh network that autonomously rerouted traffic around causality violations, reducing unplanned outages by 87%.\nLed the migration of 200+ legacy monoliths into a serverless function fabric, cutting operational costs by 63%.\nMentored 12 junior engineers through the "Chaos-Engineering Immersion Program," achieving a 100% retention rate.',
        },
        {
          id: 'entry-exp-3',
          title: 'Binary & Baelog Consulting',
          subtitle: 'Systems Engineer (Level III)',
          location: '',
          startDate: 'Jan 2016',
          endDate: 'May 2018',
          description: 'Designed a real-time anomaly detection pipeline capable of identifying 15 distinct classes of logic paradox with 99.7% recall.\nReduced cross-service communication latency by 40% through the implementation of a priority-inheritance message bus.\nAuthored internal RFC "Zero-Trust for Non-Human Identities," later adopted as the department standard for service-to-service authentication.',
        },
      ],
    },
  ],
  skills: [
    { id: 'sk-lang', category: 'Languages', name: 'Lumina+, VoidScript, Neo-Python, BinaryFlow' },
    { id: 'sk-fw', category: 'Frameworks', name: 'Ethereal Framework, Ghost-V, DeepCore 9.0' },
    { id: 'sk-expert', category: 'Expertise', name: 'Quantum State Simulation, Neural Weaving, Multi-dimensional Visualization, Logic Provenance' },
  ],
}
