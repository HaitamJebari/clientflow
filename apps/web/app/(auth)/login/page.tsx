'use client';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import {
  useEffect,
  useState,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  toast,
} from 'sonner';

import {
  z,
} from 'zod';

import {
  AuthShell,
} from '@/components/auth/auth-shell';

import {
  useAuth,
} from '@/components/providers/auth-provider';

import {
  getErrorMessage,
} from '@/lib/api';

const loginSchema =
  z.object({
    email:
      z
        .string()
        .email(
          'Enter a valid email address.',
        ),

    password:
      z
        .string()
        .min(
          8,
          'Password must contain at least 8 characters.',
        ),

    remember:
      z.boolean(),
  });

type LoginForm =
  z.infer<
    typeof loginSchema
  >;

export default function LoginPage() {
  const router =
    useRouter();

  const {
    login,
    status,
  } =
    useAuth();

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<LoginForm>({
      resolver:
        zodResolver(
          loginSchema,
        ),

      defaultValues: {
        email: '',
        password: '',
        remember: true,
      },
    });

  useEffect(() => {
    if (
      status ===
      'authenticated'
    ) {
      router.replace(
        '/dashboard',
      );
    }
  }, [
    router,
    status,
  ]);

  async function onSubmit(
    values: LoginForm,
  ) {
    try {
      await login({
        email:
          values.email,

        password:
          values.password,
      });

      toast.success(
        'Welcome back.',
      );

      router.replace(
        '/dashboard',
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error),
      );
    }
  }

  return (
    <AuthShell mode="login">
      <div
        className="
          cf-page-enter
        "
      >
        <div
          className="
            mb-8
          "
        >
          <p
            className="
              mb-2
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-[#5b5bf7]
            "
          >
            Welcome back
          </p>

          <h1
            className="
              text-[30px]
              font-semibold
              tracking-[-1px]
              text-[#101729]
            "
          >
            Sign in to
            ClientFlow
          </h1>

          <p
            className="
              mt-3
              text-[13px]
              leading-6
              text-[#596579]
            "
          >
            Welcome back.
            Let&apos;s move
            your business
            forward.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit(
              onSubmit,
            )
          }
          className="
            space-y-5
          "
        >
          <div>
            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-xs
                font-medium
                text-[#354156]
              "
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register(
                'email',
              )}
              className="
                h-11
                w-full
                rounded-md
                border
                border-[#cbd3df]
                bg-white
                px-3
                text-sm
                text-[#101729]
                outline-none
                transition
                focus:border-[#5b5bf7]
                focus:ring-4
                focus:ring-[#5b5bf7]/10
              "
            />

            {errors.email && (
              <p
                className="
                  mt-1.5
                  text-xs
                  text-[#b33340]
                "
              >
                {
                  errors.email
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
              "
            >
              <label
                htmlFor="password"
                className="
                  text-xs
                  font-medium
                  text-[#354156]
                "
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="
                  text-xs
                  font-medium
                  text-[#5b5bf7]
                  hover:underline
                "
              >
                Forgot password?
              </Link>
            </div>

            <div
              className="
                flex
                h-11
                items-center
                rounded-md
                border
                border-[#cbd3df]
                bg-white
                transition
                focus-within:border-[#5b5bf7]
                focus-within:ring-4
                focus-within:ring-[#5b5bf7]/10
              "
            >
              <input
                id="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                {...register(
                  'password',
                )}
                className="
                  h-full
                  min-w-0
                  flex-1
                  border-0
                  bg-transparent
                  px-3
                  text-sm
                  outline-none
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                className="
                  mr-2
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-md
                  text-[#7b8799]
                  hover:bg-[#f5f7fb]
                "
              >
                {showPassword ? (
                  <EyeOff
                    size={16}
                  />
                ) : (
                  <Eye
                    size={16}
                  />
                )}
              </button>
            </div>

            {errors.password && (
              <p
                className="
                  mt-1.5
                  text-xs
                  text-[#b33340]
                "
              >
                {
                  errors.password
                    .message
                }
              </p>
            )}
          </div>

          <label
            className="
              flex
              items-center
              gap-2
              text-xs
              text-[#596579]
            "
          >
            <input
              type="checkbox"
              {...register(
                'remember',
              )}
              className="
                accent-[#5b5bf7]
              "
            />

            Remember me
          </label>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-md
              bg-[#5b5bf7]
              px-4
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[#4d4ddd]
              disabled:opacity-50
            "
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Signing in...
              </>
            ) : (
              <>
                Sign in

                <ArrowRight
                  size={15}
                />
              </>
            )}
          </button>
        </form>

        <div
          className="
            my-6
            flex
            items-center
            gap-3
            text-[11px]
            text-[#7b8799]
          "
        >
          <span
            className="
              h-px
              flex-1
              bg-[#dce2eb]
            "
          />

          or continue with

          <span
            className="
              h-px
              flex-1
              bg-[#dce2eb]
            "
          />
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <button
            type="button"
            className="
              h-10
              rounded-md
              border
              border-[#dce2eb]
              bg-white
              text-xs
              font-medium
              transition
              hover:bg-[#f8fafc]
            "
          >
            Google
          </button>

          <button
            type="button"
            className="
              h-10
              rounded-md
              border
              border-[#dce2eb]
              bg-white
              text-xs
              font-medium
              transition
              hover:bg-[#f8fafc]
            "
          >
            Microsoft
          </button>
        </div>

        <p
          className="
            mt-7
            text-center
            text-xs
            text-[#596579]
          "
        >
          New to
          ClientFlow?{' '}

          <Link
            href="/register"
            className="
              font-medium
              text-[#5b5bf7]
              hover:underline
            "
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}