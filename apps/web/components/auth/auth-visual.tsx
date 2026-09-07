import {
  ArrowUpRight,
  Check,
  Clock3,
  Eye,
  FileText,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface AuthVisualProps {
  mode: 'login' | 'register';
}

export function AuthVisual({
  mode,
}: AuthVisualProps) {
  const isRegister = mode === 'register';

  return (
    <section
      className="
        relative
        hidden
        overflow-hidden
        bg-[#080d1a]
        text-white

        lg:flex
        lg:h-screen
        lg:min-h-0
        lg:flex-col
      "
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[90px] h-[420px] w-[420px] rounded-full bg-[#5b5bf7]/18 blur-[120px]" />
        <div className="absolute right-[-140px] bottom-[40px] h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(91,91,247,0.08),transparent_24%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div
        className="
          relative
          z-10
          flex
          h-full
          min-h-0
          flex-col
          px-12
          py-8
          xl:px-16
        "
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b5bf7] text-sm font-semibold shadow-lg shadow-[#5b5bf7]/30">
            ↗
          </div>

          <div>
            <p className="text-[18px] font-semibold tracking-[-0.5px]">
              ClientFlow
            </p>
            <p className="text-[11px] text-slate-400">
              Turn opportunities into revenue
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="mt-16 max-w-[540px]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
            {isRegister
              ? 'AI-powered client acquisition'
              : 'Welcome back'}
          </p>

          <h1 className="max-w-[520px] text-[50px] font-semibold leading-[1.03] tracking-[-2.2px] xl:text-[56px]">
            {isRegister ? (
              <>
                Build a sales
                <br />
                system your
                <br />
                future self
                <br />
                will thank you
                <br />
                for.
              </>
            ) : (
              <>
                Great work
                <br />
                happens here.
              </>
            )}
          </h1>

          <p className="mt-5 max-w-[430px] text-[15px] leading-7 text-slate-400">
            {isRegister
              ? 'Capture leads, qualify opportunities, track proposal engagement and know exactly what action can move revenue forward.'
              : 'Sign in to continue managing opportunities, proposals and next-best actions from one focused revenue workspace.'}
          </p>
        </div>

        {/* 3D Scene */}
        <div
          className="
            cf-auth-perspective
            relative
            mt-7
            min-h-0
            flex-1
          "
        >
          {/* Main board */}
          <div className="cf-auth-board cf-page-enter relative mt-1 w-[560px] max-w-full rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,28,48,0.96),rgba(12,18,32,0.96))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-5 flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Open pipeline
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="text-[38px] font-semibold tracking-[-1.8px]">
                    €24,500
                  </p>
                  <div className="mb-1 flex items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                    <TrendingUp size={13} />
                    +12%
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  Active leads
                </p>
                <p className="mt-1 text-[20px] font-semibold">18</p>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium text-white">
                    Revenue momentum
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Opportunities that need attention today
                  </p>
                </div>

                <div className="rounded-md bg-indigo-400/10 px-2.5 py-1 text-[10px] font-medium text-indigo-200">
                  This week
                </div>
              </div>

              <div className="relative h-[140px]">
                <svg
                  viewBox="0 0 520 140"
                  className="h-full w-full"
                  aria-hidden
                >
                  <defs>
                    <linearGradient
                      id="cf-auth-area"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#7167ff"
                        stopOpacity="0.48"
                      />
                      <stop
                        offset="100%"
                        stopColor="#7167ff"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="
                      M10 116
                      C45 108, 60 92, 95 90
                      C130 88, 150 100, 185 84
                      C225 66, 250 70, 290 58
                      C325 48, 350 62, 392 40
                      C430 20, 462 22, 510 10
                      L510 136
                      L10 136
                      Z
                    "
                    fill="url(#cf-auth-area)"
                  />

                  <path
                    d="
                      M10 116
                      C45 108, 60 92, 95 90
                      C130 88, 150 100, 185 84
                      C225 66, 250 70, 290 58
                      C325 48, 350 62, 392 40
                      C430 20, 462 22, 510 10
                    "
                    fill="none"
                    stroke="#7c73ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <circle cx="392" cy="40" r="5" fill="#ffffff" />
                  <circle cx="392" cy="40" r="10" fill="#7c73ff" fillOpacity="0.25" />
                </svg>
              </div>
            </div>

            {/* Bottom insights row */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ['High intent', '6 leads'],
                ['Proposal stage', '4 active'],
                ['Reply needed', '3 today'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Floating card 1 */}
          <div className="cf-auth-card cf-auth-card-one absolute right-[-6px] top-[18px] w-[260px] rounded-[18px] border border-white/10 bg-[rgba(28,39,64,0.92)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Next best action
                </p>
                <p className="mt-1 text-[15px] font-semibold text-white">
                  Follow up with Acme
                </p>
              </div>

              <div className="rounded-lg bg-amber-300/10 p-2 text-amber-300">
                <Clock3 size={15} />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <Eye size={13} className="text-indigo-300" />
                Proposal opened 3 times
              </div>

              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-300" />
                No reply for 4 days
              </div>
            </div>

            <button className="mt-4 flex items-center gap-2 text-[12px] font-medium text-white">
              Review follow-up
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Floating card 2 */}
          <div className="cf-auth-card cf-auth-card-two absolute left-[28px] bottom-[70px] w-[230px] rounded-[18px] border border-white/10 bg-[rgba(19,28,47,0.92)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Proposal activity
                </p>
                <p className="mt-1 text-[15px] font-semibold text-white">
                  TechCorp
                </p>
              </div>

              <div className="rounded-lg bg-cyan-300/10 p-2 text-cyan-300">
                <FileText size={15} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Views</span>
                <span className="font-medium text-white">4</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                <span>Pricing interest</span>
                <span className="font-medium text-white">High</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                <span>Last open</span>
                <span className="font-medium text-white">20 min ago</span>
              </div>
            </div>
          </div>

          {/* Floating card 3 */}
          <div className="cf-auth-card cf-auth-card-three absolute bottom-[-6px] right-[78px] w-[250px] rounded-[18px] border border-white/10 bg-[rgba(20,30,48,0.92)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
              Why this matters
            </p>

            <ul className="mt-3 space-y-2.5 text-[12px] text-slate-200">
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 text-emerald-300" />
                High-value opportunity with recent engagement
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 text-emerald-300" />
                Clear next action instead of manual guesswork
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom trust line */}
        <div className="relative z-10 mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-400">
          {[
            isRegister
              ? 'Free to get started'
              : 'Your workspace is protected',
            isRegister
              ? 'No credit card required'
              : 'Pick up where you left off',
            isRegister
              ? 'Setup focused on real businesses'
              : 'Built for freelancers and agencies',
          ].map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5"
            >
              <Check size={12} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}