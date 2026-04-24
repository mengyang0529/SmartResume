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
  education: [],
  sections: [{
      id: 'sec-edu',
      title: 'Education',
      entries: [
        {
          id: 'entry-edu-1',
          title: 'Caelum University of Synergy',
          subtitle: 'Ph.D. in Multimodal Logic & Synthetics',
          location: '',
          startDate: 'Sept 2015',
          endDate: 'June 2019',
          description:
            'Recipient of the "Mobius Strip" Medal for Theoretical Excellence.',
        },
      ],
    },
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
          description: [
            'Spearheaded the design of the "Eternal Flame" framework, boosting data throughput efficiency by 350%.',
            'Engineered an automated bias-correction protocol that successfully stabilized three major logical fluctuations.',
            'Managed a distributed team of 50 virtual entities, achieving a 100% zero-latency delivery rate across disparate timelines.',
          ].join('\n'),
        },
      ],
    },
  ],
  skills: [
    {
      id: 'sk-lang',
      category: 'Languages',
      name: 'Lumina+, VoidScript, Neo-Python, BinaryFlow',
    },
    {
      id: 'sk-fw',
      category: 'Frameworks',
      name: 'Ethereal Framework, Ghost-V, DeepCore 9.0',
    },
    {
      id: 'sk-expert',
      category: 'Expertise',
      name: 'Quantum State Simulation, Neural Weaving, Multi-dimensional Visualization, Logic Provenance',
    },
  ],
}
