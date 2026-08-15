import { useEffect } from "react";

export default function ScrollAnimations() {
  useEffect(() => {
    // ------------------------------------------
    // Scroll progress
    // ------------------------------------------
    const updateProgress = () => {
      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        documentHeight > 0
          ? (scrollTop / documentHeight) * 100
          : 0;

      document.documentElement.style.setProperty(
        "--scroll-progress",
        `${progress}%`
      );
    };

    // ------------------------------------------
    // Reveal elements
    // ------------------------------------------
    const elements = document.querySelectorAll(
      ".dashboard-card, .task-card, .project-card, .stat-card, .section-card"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "taskflow-scroll-visible"
            );

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elements.forEach((element, index) => {
      element.classList.add("taskflow-scroll-element");

      element.style.setProperty(
        "--scroll-delay",
        `${Math.min(index * 0.06, 0.35)}s`
      );

      observer.observe(element);
    });

    // ------------------------------------------
    // Scroll listener
    // ------------------------------------------
    window.addEventListener(
      "scroll",
      updateProgress,
      { passive: true }
    );

    updateProgress();

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "scroll",
        updateProgress
      );
    };
  }, []);

  return (
    <>
      {/* Top progress bar */}
      <div className="taskflow-scroll-progress">
        <div className="taskflow-scroll-progress-bar" />
      </div>

      {/* Side glow */}
      <div className="taskflow-scroll-glow" />
    </>
  );
}