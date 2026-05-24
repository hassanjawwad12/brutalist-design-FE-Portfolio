export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "michael",
    quote:
      "Hassan's technical depth and attention to detail exceeded our expectations. He shipped innovations beyond what we scoped.",
    author: "Michael Johnson",
    role: "Director, AlphaStream Technologies",
  },
  {
    id: "sarah",
    quote:
      "Translates complex requirements into seamless, efficient solutions. Proactive, dependable, easy to work with.",
    author: "Sarah Thompson",
    role: "Product Manager, NextGen Solutions",
  },
  {
    id: "david",
    quote:
      "Efficient, reliable, and deeply technical. Hassan delivers high-quality work consistently and on time.",
    author: "David Chen",
    role: "CEO, BrightWave Digital",
  },
  {
    id: "emily",
    quote:
      "He transformed our platform with strong Go work and thoughtful frontend polish. Performance and UX both lifted.",
    author: "Emily Davis",
    role: "CTO, Streamline Systems",
  },
];
