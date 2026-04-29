const steps = [
  {
    n: "01",
    label: "Stake",
    title: "Smart account posts an ETH bond.",
    body: "Every agent is an ERC-4337 smart account. Before it can execute a single op, the operator locks at least 0.1 ETH into the bond vault.",
  },
  {
    n: "02",
    label: "Attest",
    title: "Every action becomes an EAS attestation.",
    body: "Validation runs four checks — signature, registered, bonded, not slashed. The post-execution hook writes a permanent EAS attestation against the agent's identity.",
  },
  {
    n: "03",
    label: "Slash",
    title: "Misbehaviour is reported on-chain.",
    body: "Anyone files a slash report. The agent's owner has 48 hours to dispute. After that, any keeper calls executeSlash and the bond moves to the protocol treasury.",
  },
];

export function ProtocolSteps() {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          The protocol
        </div>

        <div className="grid grid-cols-1 gap-px bg-hairline md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.n} className="bg-background p-8">
              <div className="mb-5 flex items-baseline gap-3">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  {s.label}
                </span>
              </div>

              <h3 className="mb-3 text-xl font-medium leading-snug tracking-tight">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
