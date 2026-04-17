import type { ReactNode } from "react";

export default function Card(props: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="cardHeader">
        <div>
          <h3 className="cardTitle">{props.title}</h3>
          {props.subtitle && <div className="cardMeta">{props.subtitle}</div>}
        </div>
        {props.right}
      </div>
      {props.children}
    </section>
  );
}
