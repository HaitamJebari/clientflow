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
            flex
            min-h-screen
            items-center
            justify-center
            bg-white
            px-6
            py-12

            sm:px-10

            lg:h-screen
            lg:min-h-0
            lg:overflow-hidden
            lg:px-14
            lg:py-8

            xl:px-20
          "
        >
          <div
            className="
              absolute
              left-6
              top-6
              flex
              items-center
              gap-2
              lg:hidden
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
                text-white
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

          <div
            className="
              w-full
              max-w-[390px]
            "
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}