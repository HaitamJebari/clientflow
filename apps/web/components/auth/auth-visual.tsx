import {
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
  const isRegister =
    mode === 'register';

  return (
    <section
      className="
        relative
        hidden
        h-screen
        min-h-0
        overflow-hidden
        bg-[#080d1a]
        text-white

        lg:flex
        lg:flex-col
      "
    >
      {/* ===============================
          BACKGROUND
      ================================ */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-[180px]
            top-[100px]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#5b5bf7]/15
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            -right-[170px]
            bottom-[-120px]
            h-[480px]
            w-[480px]
            rounded-full
            bg-cyan-400/10
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.035]

            [background-image:
              linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),
              linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)
            ]

            [background-size:38px_38px]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[220px]
            bg-gradient-to-t
            from-[#080d1a]
            to-transparent
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          flex
          h-full
          min-h-0
          flex-col
          px-10
          py-8

          xl:px-14
        "
      >
        {/* ===============================
            BRAND
        ================================ */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#5b5bf7]
              text-[15px]
              font-semibold

              shadow-[0_10px_30px_rgba(91,91,247,.32)]
            "
          >
            ↗
          </div>

          <div>
            <div
              className="
                text-[18px]
                font-semibold
                tracking-[-0.6px]
              "
            >
              ClientFlow
            </div>

            <div
              className="
                mt-[1px]
                text-[10px]
                text-slate-400
              "
            >
              Turn opportunities
              into revenue
            </div>
          </div>
        </div>

        {/* ===============================
            PAGE COPY
        ================================ */}

        <div
          className="
            mt-10
            shrink-0

            xl:mt-12
          "
        >
          <div
            className="
              mb-3
              flex
              items-center
              gap-2

              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-indigo-300
            "
          >
            <Sparkles size={12} />

            {isRegister
              ? 'AI-powered client acquisition'
              : 'Your revenue workspace'}
          </div>

          <h1
            className="
              max-w-[520px]

              text-[43px]
              font-semibold
              leading-[1.03]
              tracking-[-2px]

              xl:text-[48px]
            "
          >
            {isRegister ? (
              <>
                Turn more
                <br />
                opportunities
                <br />
                into clients.
              </>
            ) : (
              <>
                Great work
                <br />
                happens here.
              </>
            )}
          </h1>

          <p
            className="
              mt-4
              max-w-[430px]

              text-[13px]
              leading-6
              text-slate-400

              xl:text-[14px]
            "
          >
            {isRegister
              ? 'Capture, qualify and follow through with every opportunity from one focused workspace.'
              : 'Pick up where you left off and keep your strongest opportunities moving forward.'}
          </p>
        </div>

        {/* ===============================
            SHARED 3D PRODUCT SCENE

            EXACT SAME CARDS FOR:
            LOGIN + REGISTER
        ================================ */}

        <div
          className="
            cf-register-scene

            relative
            mt-6
            min-h-0
            flex-1

            xl:mt-7
          "
        >
          {/* Ambient glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-[10%]
              top-[35%]

              h-[170px]
              w-[75%]

              rounded-[50%]

              bg-[#5b5bf7]/12
              blur-[65px]
            "
          />

          {/* =============================
              MAIN PRODUCT BOARD
          ============================== */}

          <div
            className="
              cf-register-board

              absolute
              left-[5%]
              top-[10px]

              w-[83%]
              max-w-[530px]

              rounded-[20px]

              border
              border-white/10

              bg-[linear-gradient(145deg,#172138_0%,#111a2c_50%,#0d1525_100%)]

              p-5

              shadow-[0_40px_100px_rgba(0,0,0,.48)]
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-slate-500
                  "
                >
                  Open pipeline
                </p>

                <div
                  className="
                    mt-1.5
                    flex
                    items-end
                    gap-2
                  "
                >
                  <strong
                    className="
                      text-[30px]
                      font-semibold
                      tracking-[-1.3px]
                    "
                  >
                    €24,500
                  </strong>

                  <span
                    className="
                      mb-1
                      flex
                      items-center
                      gap-1

                      rounded-md

                      bg-emerald-400/10

                      px-2
                      py-1

                      text-[9px]
                      font-medium
                      text-emerald-300
                    "
                  >
                    <TrendingUp
                      size={11}
                    />

                    +12%
                  </span>
                </div>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-white/[0.04]

                  px-3
                  py-2
                "
              >
                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.15em]
                    text-slate-500
                  "
                >
                  Active leads
                </p>

                <p
                  className="
                    mt-1
                    text-right
                    text-[20px]
                    font-semibold
                  "
                >
                  18
                </p>
              </div>
            </div>

            {/* Compact pipeline graphic */}

            <div
              className="
                relative
                mt-5
                h-[85px]
                overflow-hidden

                rounded-xl

                border
                border-white/[0.07]

                bg-white/[0.025]
              "
            >
              <svg
                viewBox="0 0 500 90"
                className="
                  h-full
                  w-full
                "
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="cf-auth-shared-area"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#7167ff"
                      stopOpacity="0.38"
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
                    M0 77
                    C55 72 82 54 126 58
                    C175 64 202 51 247 48
                    C295 45 330 31 371 34
                    C417 37 448 17 500 11
                    L500 90
                    L0 90
                    Z
                  "
                  fill="url(#cf-auth-shared-area)"
                />

                <path
                  d="
                    M0 77
                    C55 72 82 54 126 58
                    C175 64 202 51 247 48
                    C295 45 330 31 371 34
                    C417 37 448 17 500 11
                  "
                  fill="none"
                  stroke="#7167ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <circle
                  cx="371"
                  cy="34"
                  r="4"
                  fill="#ffffff"
                />

                <circle
                  cx="371"
                  cy="34"
                  r="9"
                  fill="#7167ff"
                  fillOpacity=".22"
                />
              </svg>
            </div>

            {/* Bottom metrics */}

            <div
              className="
                mt-3
                grid
                grid-cols-3
                gap-2
              "
            >
              <MiniMetric
                label="Qualified"
                value="6"
              />

              <MiniMetric
                label="Proposal"
                value="4"
              />

              <MiniMetric
                label="Reply needed"
                value="3"
              />
            </div>
          </div>

          {/* =============================
              CARD 1
              PROPOSAL ACTIVITY
          ============================== */}

          <div
            className="
              cf-register-float-two

              absolute
              bottom-[40px]
              left-[1%]

              w-[215px]

              rounded-[15px]

              border
              border-white/10

              bg-[#152136]/95

              p-3.5

              shadow-[0_20px_55px_rgba(0,0,0,.45)]

              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-2
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-slate-500
                  "
                >
                  Proposal activity
                </p>

                <p
                  className="
                    mt-1
                    text-[12px]
                    font-semibold
                  "
                >
                  TechCorp
                </p>
              </div>

              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center

                  rounded-lg

                  bg-cyan-400/10
                  text-cyan-300
                "
              >
                <FileText
                  size={13}
                />
              </div>
            </div>

            <div
              className="
                mt-3
                space-y-2
              "
            >
              <ActivityRow
                label="Views"
                value="4"
              />

              <ActivityRow
                label="Pricing interest"
                value="High"
              />

              <ActivityRow
                label="Last open"
                value="20 min ago"
              />
            </div>
          </div>

          {/* =============================
              CARD 2
              NEXT BEST ACTION
          ============================== */}

          <div
            className="
              cf-register-float-one

              absolute
              right-[0]
              top-[25px]

              w-[220px]

              rounded-[15px]

              border
              border-white/10

              bg-[#1b2740]/95

              p-3.5

              shadow-[0_20px_55px_rgba(0,0,0,.45)]

              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-slate-500
                  "
                >
                  Next best action
                </p>

                <p
                  className="
                    mt-1
                    text-[12px]
                    font-semibold
                  "
                >
                  Follow up with Acme
                </p>
              </div>

              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center

                  rounded-lg

                  bg-amber-300/10
                  text-amber-300
                "
              >
                <Clock3
                  size={13}
                />
              </div>
            </div>

            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-1.5
              "
            >
              <Signal>
                €8,500
              </Signal>

              <Signal>
                Viewed 3×
              </Signal>

              <Signal>
                4 days
              </Signal>
            </div>
          </div>

          {/* =============================
              CARD 3
              WHY THIS MATTERS
          ============================== */}

          <div
            className="
              cf-register-float-three

              absolute
              bottom-[10px]
              right-[8%]

              w-[235px]

              rounded-[15px]

              border
              border-white/10

              bg-[#111c2f]/95

              p-3.5

              shadow-[0_20px_55px_rgba(0,0,0,.42)]

              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-2

                text-[8px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-indigo-300
              "
            >
              <Sparkles
                size={11}
              />

              Why this matters
            </div>

            <div
              className="
                mt-3
                space-y-2
              "
            >
              <Reason>
                High-value opportunity
                with recent engagement
              </Reason>

              <Reason>
                Clear next action instead
                of manual guesswork
              </Reason>
            </div>
          </div>
        </div>

        {/* ===============================
            FOOTER
        ================================ */}

        <div
          className="
            relative
            z-20
            mt-3

            flex
            shrink-0
            flex-wrap

            gap-x-5
            gap-y-1.5

            text-[9px]
            text-slate-500
          "
        >
          {(isRegister
            ? [
                'Free to get started',
                'No credit card required',
                'Setup focused on real businesses',
              ]
            : [
                'Your workspace is protected',
                'Private by default',
                'Pick up where you left off',
              ]
          ).map(
            (item) => (
              <span
                key={item}
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <Check
                  size={10}
                  className="
                    text-slate-400
                  "
                />

                {item}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-white/[0.07]
        bg-white/[0.035]
        px-2.5
        py-2
      "
    >
      <p
        className="
          truncate
          text-[8px]
          text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-[12px]
          font-semibold
          text-white
        "
      >
        {value}
      </p>
    </div>
  );
}

function ActivityRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        text-[9px]
      "
    >
      <span
        className="
          text-slate-400
        "
      >
        {label}
      </span>

      <strong
        className="
          font-medium
          text-slate-200
        "
      >
        {value}
      </strong>
    </div>
  );
}

function Signal({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span
      className="
        rounded-md

        border
        border-white/[0.08]

        bg-white/[0.05]

        px-2
        py-1

        text-[8px]
        text-slate-300
      "
    >
      {children}
    </span>
  );
}

function Reason({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-2

        text-[9px]
        leading-4
        text-slate-300
      "
    >
      <Check
        size={11}
        className="
          mt-[2px]
          shrink-0
          text-emerald-400
        "
      />

      <span>
        {children}
      </span>
    </div>
  );
}