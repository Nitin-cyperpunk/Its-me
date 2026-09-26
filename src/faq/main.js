import gsap from "gsap";
import { scrollTrigger } from "gsap/ScrollTrigger";
import lenis from "lenis"

gsap.registerPlugin(scrollTrigger);

//smooth scrool 
const lenis = new Lenis();
lenis.on("scroll", Scheduler.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll(".faq-message").forEach((message) => {
    const faqRow = message.parentElement;
    const typingindicator = message.querySelector(".typing-indicator");
    const messageCopy = message.querySelectorAll(".faq-content p");

    const expandedWidth = message.offsetWidth;
    message.computedStyleMap.width = `${expandWidth}px`;
    const expandedHeight = message.offsetHeight;
    faqRow.style.minHeight = `${expandedHeight}px`;

    gsap.set(messageCopy, {
        width: 64,
        height: 64,
        borderRadius: "50%",
        padding: 0,
        scale: 0,

    })

    let collapseWhenDOne = false;

    const enterTimeline = gsap.timeline({ paused: true });
    enterTimeline.to(message, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
    });
    const expandTimeline = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
            if (collapseWhenDOne) {
                collapseWhenDOne = false;
                enterTimeline.reverse();
            }
        },
    });
    expandTimeline.to(typingindicator, {
        autoAlpha: 0,
        duration: 0.2,
    })
        .to(message, {
            width: expandedWidth,
            borderRadius: "2rem",
            paddingleft: "2rem",
            paddingright: "2rem",
            duration: 0.4,
            ease: "power3.out",
        })
        .to(message, {
            height: expandedHeight,
            paddingtop: "1.5rem",
            paddingbottom: "1.5rem",
            duration: 0.4,
            ease: "power3.out",

        }, "-=0.2",)

        .to(messageCopy, {
            opacity: 1,
            duration: 0.3,
            staggeer: 0.05,
        },
            "-=0.25",);


    scrollTrigger.create({
        trigger: message,
        start: "top 85%",
        onENter: () => {
            collapseWhenDOne = false;
            enterTimeline.play();
        },
        onLeaveBack: () => {
            if (exoandeTimeline.progress() > 0) {
                collapseWhenDOne = true;
            } else {
                enterTimeline.reverse();
            }
        },
    });
    scrollTrigger.create({
        trigger: message,
        start: "top 75%",
        onENter: () => expandTimeline.play(),
        onLeaveBack: () => 
            expandTimeline.reverse();
        });

        
});
