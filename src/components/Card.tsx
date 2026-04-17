import { ReactNode } from "react";

type CardProps = {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
};

/**
 * Shared card shell for panels across the app.
 * Provides consistent padding, border, and optional header actions.
 */
export default function Card({ title, right, children }: CardProps) {
  return (
    <section
      style={{
        width: "100%",
        padding: 16,
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "radial-gradient(120% 120% at 0% 0%, rgba(96,165,250,0.06), transparent 45%), var(--panel)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        display: "grid",
        gap: 12
      }}
    >
      {(title || right) && (
        <div className="row" style={{ justifyContent: "space-between" }}>
          {title ? <div className="h2">{title}</div> : <span />}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
