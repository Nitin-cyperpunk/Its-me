import { faqItems, type FaqItem } from "./faq-data";
import FaqConversation from "./FaqConversation";
import styles from "./faq.module.css";

// Class names inside the conversation (faq-row, faq-message, typing-indicator,
// faq-content) are selected by FaqConversation's animation — keep them.
export default function Faq({ items = faqItems }: { items?: FaqItem[] }) {
  return (
    <section
      aria-labelledby="faq-title"
      className={styles.faq}
    >
      <h2 id="faq-title" className={styles.title}>
        Your questions, <span>answered</span>
      </h2>

      <FaqConversation className="faq-container">
        {items.map((item) => (
          <div className="faq-item" key={item.question}>
            <div className="faq-row faq-question-slot">
              <div className="faq-question faq-message">
                <div className="typing-indicator" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="faq-content">
                  <p>{item.question}</p>
                </div>
              </div>
              <span className="faq-avatar faq-avatar-you" aria-hidden="true">
                You
              </span>
            </div>

            <div className="faq-row faq-answer-slot">
              <span className="faq-avatar faq-avatar-me" aria-hidden="true">
                N
              </span>
              <div className="faq-answer faq-message">
                <div className="typing-indicator" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="faq-content">
                  {item.answer.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </FaqConversation>
    </section>
  );
}
