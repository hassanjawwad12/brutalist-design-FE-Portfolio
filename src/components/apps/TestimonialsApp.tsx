"use client";

import { useState } from "react";
import { testimonials } from "@/data/testimonials";

export function TestimonialsApp() {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];
  const go = (delta: number) =>
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);

  return (
    <div className="app quotes">
      <blockquote className="quote" key={t.id}>
        <p className="quote__mark" aria-hidden="true">
          &ldquo;
        </p>
        <p className="quote__text">{t.quote}</p>
        <footer className="quote__by">
          <span className="quote__author">{t.author}</span>
          <span className="quote__role">{t.role}</span>
        </footer>
      </blockquote>

      <div className="quotes__nav">
        <button
          type="button"
          className="quotes__btn"
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
        >
          ‹
        </button>
        <div className="quotes__dots">
          {testimonials.map((tt, i) => (
            <button
              key={tt.id}
              type="button"
              className="quotes__dot"
              data-on={i === index || undefined}
              aria-label={`Testimonial ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="quotes__btn"
          onClick={() => go(1)}
          aria-label="Next testimonial"
        >
          ›
        </button>
      </div>
    </div>
  );
}
