const steps = [
  {
    n: "01",
    label: "Stake",
    title: "Smart account posts an ETH bond.",
    body: "Every agent is an ERC-4337 smart account. Before it can execute a single op, the operator locks at least 0.1 ETH into the bond vault.",
    meta: "Capital at risk before first execution",
  },
  {
    n: "02",
    label: "Attest",
    title: "Every action becomes an EAS attestation.",
    body: "Validation runs four checks — signature, registered, bonded, not slashed. The post-execution hook writes a permanent EAS attestation against the agent's identity.",
    meta: "Evidence is written into the protocol surface",
  },
  {
    n: "03",
    label: "Slash",
    title: "Misbehaviour is reported on-chain.",
    body: "Anyone files a slash report. The agent's owner has 48 hours to dispute. After that, any keeper calls executeSlash and the bond moves to the protocol treasury.",
    meta: "Dispute flow stays visible and enforceable",
  },
];

export function ProtocolSteps() {
  return (
    <section id="protocol" className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            The protocol
          </div>
          <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.04em] md:text-5xl">
            Three steps, one clean accountability loop.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
            The flow stays intentionally legible: bond the agent, attest what it
            does, then enforce slashing if behavior crosses the line. No black
            box trust assumptions required.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.n} className="landing-card rounded-[2rem] p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                </div>
                <span className="rounded-full border border-hairline-strong bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  {s.label}
                </span>
              </div>

              <h3 className="mb-4 text-xl font-medium leading-snug tracking-tight md:text-2xl">
                {s.title}
              </h3>
              <p className="text-sm leading-7 text-muted-foreground">{s.body}</p>

              <div className="my-6 h-px w-full landing-rule" />

              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/80">
                {s.meta}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
