// === Doc primitives (used by the spec section) ===
const DocSection = ({ n, title, children, id }) => (
  <section id={id} className="mb-14">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="num text-[12px] text-brand-cyan">{n}</span>
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
    </div>
    <div className="border-l border-line2/60 pl-5 ml-1">{children}</div>
  </section>
);

const DocH3 = ({ children }) => (
  <h3 className="text-[15px] font-semibold tracking-tight text-fg mt-6 mb-2.5">{children}</h3>
);
const DocP = ({ children }) => (
  <p className="text-[13.5px] text-fg-dim leading-relaxed mb-2.5">{children}</p>
);
const DocList = ({ items }) => (
  <ul className="text-[13.5px] text-fg-dim leading-relaxed list-disc pl-5 mb-3 marker:text-fg-faint">
    {items.map((it, i) => <li key={i} className="mb-1">{it}</li>)}
  </ul>
);
const Code = ({ children }) => (
  <pre className="bg-ink-800 border border-line2/50 rounded-lg p-4 text-[12.5px] num text-fg-dim overflow-x-auto leading-relaxed whitespace-pre">{children}</pre>
);
const Kbd = ({ children }) => (
  <code className="px-1.5 py-0.5 rounded bg-ink-800 border border-line2/60 text-fg num text-[12px]">{children}</code>
);
const SpecTable = ({ head, rows }) => (
  <div className="overflow-hidden rounded-xl border border-line2/60 bg-ink-800 mb-4">
    <table className="w-full text-[13px]">
      <thead className="bg-ink-700">
        <tr>{head.map((h,i) => (
          <th key={i} className="text-left font-medium text-fg-dim px-3.5 py-2.5 border-b border-line2/60">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i} className="border-b border-line2/30 last:border-0 align-top">
            {r.map((c,j) => (
              <td key={j} className={`px-3.5 py-2.5 ${j===0 ? 'font-medium text-fg' : 'text-fg-dim'}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

window.DocSection = DocSection;
window.DocH3 = DocH3;
window.DocP = DocP;
window.DocList = DocList;
window.Code = Code;
window.Kbd = Kbd;
window.SpecTable = SpecTable;
