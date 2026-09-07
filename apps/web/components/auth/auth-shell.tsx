import {
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

import {
  AuthVisual,
} from './auth-visual';

interface AuthShellProps {
  mode:
    | 'login'
    | 'register';

  children:
    React.ReactNode;
}

export function AuthShell({
  mode,
  children,
}: AuthShellProps) {
  const isRegister =
    mode === 'register';

  return (
    <main
      className="
        min-h-screen
        bg-white

        lg:h-screen
        lg:min-h-0
        lg:overflow-hidden
      "
    >
      <div
        className="
          grid
          min-h-screen

          lg:h-screen
          lg:min-h-0
          lg:grid-cols-[53%_47%]
          lg:overflow-hidden
        "
      >
        <AuthVisual
          mode={mode}
        />

        <section
          className="
            relative
            bg-white

            lg:flex
            lg:h-screen
            lg:min-h-0
            lg:items-center
            lg:justify-center
            lg:overflow-hidden
            lg:px-14
            lg:py-6

            xl:px-20
          "
        >
          {/* Mobile brand story */}
          <div
            className="
              relative
              overflow-hidden
              bg-[#080d1a]
              px-6
              pb-7
              pt-6
              text-white

              lg:hidden
            "
          >
            {/* Glows */}
            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-20
                h-56
                w-56
                rounded-full
                bg-[#5b5bf7]/25
                blur-[70px]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-20
                h-56
                w-56
                rounded-full
                bg-cyan-400/10
                blur-[80px]
              "
            />

            {/* Mobile logo */}
            <div
              className="
                relative
                z-10
                flex
                items-center
                gap-2.5
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#5b5bf7]
                  text-sm
                  font-semibold
                  shadow-lg
                  shadow-[#5b5bf7]/25
                "
              >
                ↗
              </div>

              <span
                className="
                  font-semibold
                  tracking-[-0.4px]
                "
              >
                ClientFlow
              </span>
            </div>

            {/* Copy */}
            <div
              className="
                relative
                z-10
                mt-7
                max-w-[350px]
              "
            >
              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-indigo-300
                "
              >
                <Sparkles
                  size={11}
                />

                Client acquisition,
                focused
              </div>

              <h2
                className="
                  text-[27px]
                  font-semibold
                  leading-[1.07]
                  tracking-[-1px]
                "
              >
                {isRegister
                  ? 'Turn more opportunities into clients.'
                  : 'Your next opportunity is still in view.'}
              </h2>

              <p
                className="
                  mt-3
                  max-w-[320px]
                  text-[12px]
                  leading-5
                  text-slate-400
                "
              >
                {isRegister
                  ? 'Capture, qualify and follow through without losing track of the next step.'
                  : 'Pick up exactly where you left off and keep revenue moving.'}
              </p>
            </div>

            {/* Mobile product card */}
            <div
              className="
                relative
                z-10
                mt-5
                max-w-[330px]
                rotate-[-1deg]
                rounded-xl
                border
                border-white/10
                bg-white/[0.06]
                p-3
                shadow-2xl
                backdrop-blur
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.14em]
                      text-slate-400
                    "
                  >
                    Next best action
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      font-medium
                      text-white
                    "
                  >
                    Follow up with
                    Acme Studio
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-indigo-400/10
                    text-indigo-300
                  "
                >
                  <ArrowUpRight
                    size={15}
                  />
                </div>
              </div>

              <div
                className="
                  mt-3
                  flex
                  gap-2
                  text-[9px]
                  text-slate-400
                "
              >
                <span
                  className="
                    rounded
                    border
                    border-white/10
                    bg-white/5
                    px-2
                    py-1
                  "
                >
                  €8,500
                </span>

                <span
                  className="
                    rounded
                    border
                    border-white/10
                    bg-white/5
                    px-2
                    py-1
                  "
                >
                  Viewed 3×
                </span>

                <span
                  className="
                    rounded
                    border
                    border-white/10
                    bg-white/5
                    px-2
                    py-1
                  "
                >
                  Follow up
                </span>
              </div>
            </div>
          </div>

          {/* Desktop/mobile form */}
          <div
            className="
              w-full
              px-6
              py-7

              sm:px-10

              lg:max-w-[390px]
              lg:px-0
              lg:py-0
            "
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}