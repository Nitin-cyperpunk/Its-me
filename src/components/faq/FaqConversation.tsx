"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Ported from the original vanilla prototype — same timelines, triggers and timings.
// Only typos were fixed; additions are marked "port:".
function animateMessages(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".faq-message").forEach((message) => {
    const faqRow = message.parentElement!;
    const typingIndicator = message.querySelector(".typing-indicator");
    const messageCopy = message.querySelectorAll(".faq-content p");
    const avatar = faqRow.querySelector(".faq-avatar"); // port: avatar sits beside the message

    const expandedWidth = message.offsetWidth;
    message.style.width = `${expandedWidth}px`;
    const expandedHeight = message.offsetHeight;
    faqRow.style.minHeight = `${expandedHeight}px`;

    gsap.set(message, {
      width: 64,
      height: 64,
      borderRadius: "50%",
      padding: 0,
      scale: 0,
    });
    // port: copy starts hidden so the final fade-in has something to reveal
    gsap.set(messageCopy, { opacity: 0 });
    if (avatar) gsap.set(avatar, { autoAlpha: 0 });

    let collapseWhenDone = false;

    const enterTimeline = gsap.timeline({ paused: true });
    enterTimeline.to(message, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
    // port: avatar appears together with its message
    if (avatar) enterTimeline.to(avatar, { autoAlpha: 1, duration: 0.3 }, 0);

    const expandTimeline = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        if (collapseWhenDone) {
          collapseWhenDone = false;
          enterTimeline.reverse();
        }
      },
    });
    expandTimeline
      .to(typingIndicator, {
        autoAlpha: 0,
        duration: 0.2,
      })
      .to(message, {
        width: expandedWidth,
        borderRadius: "2rem",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        duration: 0.4,
        ease: "power3.out",
      })
      .to(
        message,
        {
          height: expandedHeight,
          paddingTop: "1.5rem",
          paddingBottom: "1.5rem",
          duration: 0.4,
          ease: "power3.out",
        },
        "-=0.2",
      )
      .to(
        messageCopy,
        {
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
        },
        "-=0.25",
      );

    ScrollTrigger.create({
      trigger: message,
      start: "top 85%",
      onEnter: () => {
        collapseWhenDone = false;
        enterTimeline.play();
      },
      onLeaveBack: () => {
        if (expandTimeline.progress() > 0) {
          collapseWhenDone = true;
        } else {
          enterTimeline.reverse();
        }
      },
    });
    ScrollTrigger.create({
      trigger: message,
      start: "top 75%",
      onEnter: () => expandTimeline.play(),
      onLeaveBack: () => expandTimeline.reverse(),
    });
  });
}

export default function FaqConversation({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // port: respect reduced motion — the conversation stays fully expanded
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    const setup = () => {
      ctx = gsap.context(() => animateMessages(root), root);
      root.classList.add("is-ready");
    };
    // port: undo everything (GSAP styles + the two manual inline styles)
    const teardown = () => {
      ctx?.revert();
      root.querySelectorAll<HTMLElement>(".faq-message").forEach((message) => {
        message.style.width = "";
        message.parentElement!.style.minHeight = "";
      });
    };

    // port: measure only after web fonts load, otherwise bubble sizes are wrong
    document.fonts.ready.then(() => {
      if (!cancelled) setup();
    });

    // port: sizes are measured once, so re-measure when the viewport width changes
    let lastWidth = window.innerWidth;
    let resizeTimer: number | undefined;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        teardown();
        setup();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      teardown();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
