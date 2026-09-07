'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useForm,
} from 'react-hook-form';
import type {
  UseFormRegisterReturn,
} from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AuthShell } from '@/components/auth/auth-shell';
import { useAuth } from '@/components/providers/auth-provider';
import { getErrorMessage } from '@/lib/api';

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .max(
        50,
        'Maximum 50 characters.',
      ),

    lastName: z
      .string()
      .trim()
      .max(
        50,
        'Maximum 50 characters.',
      ),

    businessName: z
      .string()
      .trim()
      .min(
        2,
        'Enter your business name.',
      )
      .max(
        100,
        'Maximum 100 characters.',
      ),

    email: z
      .string()
      .trim()
      .email(
        'Enter a valid email address.',
      ),

    password: z
      .string()
      .min(
        8,
        'Use at least 8 characters.',
      )
      .max(
        128,
        'Maximum 128 characters.',
      ),

    confirmPassword:
      z.string(),

    terms:
      z.boolean().refine(
        (value) => value,
        {
          message:
            'Please accept the terms to continue.',
        },
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        'Passwords do not match.',
      path: [
        'confirmPassword',
      ],
    },
  );

type RegisterForm =
  z.infer<
    typeof registerSchema
  >;

export default function RegisterPage() {
  const router =
    useRouter();

  const {
    registerAccount,
    status,
  } = useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    serverError,
    setServerError,
  ] =
    useState<string | null>(
      null,
    );

  const {
    register,
    handleSubmit,
    watch,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<RegisterForm>({
      resolver:
        zodResolver(
          registerSchema,
        ),

      defaultValues: {
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false,
      },
    });

  const password =
    watch('password');

  const passwordStrength =
    useMemo(() => {
      let score = 0;

      if (
        password.length >= 8
      ) {
        score++;
      }

      if (
        /[A-Z]/.test(
          password,
        )
      ) {
        score++;
      }

      if (
        /[0-9]/.test(
          password,
        )
      ) {
        score++;
      }

      if (
        /[^A-Za-z0-9]/.test(
          password,
        )
      ) {
        score++;
      }

      return score;
    }, [password]);

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
    values: RegisterForm,
  ) {
    setServerError(null);

    try {
      await registerAccount({
        firstName:
          values.firstName ||
          undefined,

        lastName:
          values.lastName ||
          undefined,

        businessName:
          values.businessName,

        email:
          values.email,

        password:
          values.password,
      });

      toast.success(
        'Your ClientFlow workspace is ready.',
      );

      router.replace(
        '/dashboard',
      );
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
        ),
      );
    }
  }

  return (
    <AuthShell mode="register">
      <div className="cf-auth-form-register">
        {/* Header */}
        <div className="mb-5">
          <div
            className="
              mb-2
              flex
              items-center
              gap-2
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-[#5b5bf7]
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#5b5bf7]
              "
            />

            Start free
          </div>

          <h1
            className="
              text-[30px]
              font-semibold
              leading-tight
              tracking-[-1px]
              text-[#101729]
            "
          >
            Create your
            workspace
          </h1>

          <p
            className="
              mt-2
              max-w-[360px]
              text-[13px]
              leading-5
              text-[var(--cf-text-secondary)]
            "
          >
            Give every
            opportunity a clear
            next step and keep
            revenue moving.
          </p>
        </div>

        {/* API error */}
        {serverError && (
          <div
            role="alert"
            className="
              mb-4
              rounded-md
              border
              border-[#f1ccd2]
              bg-[#fbecef]
              px-3
              py-2.5
              text-[12px]
              leading-5
              text-[#b33340]
            "
          >
            {serverError}
          </div>
        )}

        <form
          noValidate
          onSubmit={
            handleSubmit(
              onSubmit,
            )
          }
          className="space-y-3.5"
        >
          {/* Name */}
          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            <Field
              id="firstName"
              label="First name"
              error={
                errors.firstName
                  ?.message
              }
            >
              <input
                id="firstName"
                autoComplete="given-name"
                placeholder="Haitam"
                aria-invalid={
                  !!errors.firstName
                }
                {...register(
                  'firstName',
                )}
                className="cf-auth-input"
              />
            </Field>

            <Field
              id="lastName"
              label="Last name"
              error={
                errors.lastName
                  ?.message
              }
            >
              <input
                id="lastName"
                autoComplete="family-name"
                placeholder="Jebari"
                aria-invalid={
                  !!errors.lastName
                }
                {...register(
                  'lastName',
                )}
                className="cf-auth-input"
              />
            </Field>
          </div>

          {/* Business */}
          <Field
            id="businessName"
            label="Business name"
            error={
              errors.businessName
                ?.message
            }
          >
            <input
              id="businessName"
              autoComplete="organization"
              placeholder="Haitam Studio"
              aria-invalid={
                !!errors.businessName
              }
              {...register(
                'businessName',
              )}
              className="cf-auth-input"
            />
          </Field>

          {/* Email */}
          <Field
            id="registerEmail"
            label="Work email"
            error={
              errors.email
                ?.message
            }
          >
            <input
              id="registerEmail"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={
                !!errors.email
              }
              {...register(
                'email',
              )}
              className="cf-auth-input"
            />
          </Field>

          {/* Password */}
          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
            "
          >
            <Field
              id="registerPassword"
              label="Password"
              error={
                errors.password
                  ?.message
              }
            >
              <PasswordField
                id="registerPassword"
                visible={
                  showPassword
                }
                toggle={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                autoComplete="new-password"
                registration={
                  register(
                    'password',
                  )
                }
                invalid={
                  !!errors.password
                }
              />
            </Field>

            <Field
              id="confirmPassword"
              label="Confirm password"
              error={
                errors
                  .confirmPassword
                  ?.message
              }
            >
              <PasswordField
                id="confirmPassword"
                visible={
                  showConfirmPassword
                }
                toggle={() =>
                  setShowConfirmPassword(
                    (current) =>
                      !current,
                  )
                }
                autoComplete="new-password"
                registration={
                  register(
                    'confirmPassword',
                  )
                }
                invalid={
                  !!errors
                    .confirmPassword
                }
              />
            </Field>
          </div>

          {/* Password strength */}
          {password.length > 0 && (
            <PasswordStrength
              score={
                passwordStrength
              }
            />
          )}

          {/* Terms */}
          <div>
            <label
              className="
                flex
                cursor-pointer
                items-start
                gap-2.5
                text-[11px]
                leading-[18px]
                text-[var(--cf-text-secondary)]
              "
            >
              <input
                type="checkbox"
                {...register(
                  'terms',
                )}
                className="
                  mt-[2px]
                  h-4
                  w-4
                  shrink-0
                  accent-[#5b5bf7]
                "
              />

              <span>
                I agree to
                ClientFlow&apos;s{' '}

                <span
                  className="
                    font-medium
                    text-[#5b5bf7]
                  "
                >
                  Terms of Service
                </span>

                {' '}and{' '}

                <span
                  className="
                    font-medium
                    text-[#5b5bf7]
                  "
                >
                  Privacy Policy
                </span>
                .
              </span>
            </label>

            {errors.terms && (
              <p
                className="
                  mt-1
                  text-[11px]
                  text-[#b33340]
                "
              >
                {
                  errors.terms
                    .message
                }
              </p>
            )}
          </div>

          {/* CTA */}
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
              shadow-[0_4px_12px_rgba(91,91,247,0.18)]
              transition
              hover:-translate-y-[1px]
              hover:bg-[#4d4ddd]
              hover:shadow-[0_7px_18px_rgba(91,91,247,0.24)]
              active:translate-y-0
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Creating
                workspace...
              </>
            ) : (
              <>
                Create workspace

                <ArrowRight
                  size={15}
                />
              </>
            )}
          </button>
        </form>

        {/* Trust */}
        <div
          className="
            mt-4
            flex
            items-center
            justify-center
            gap-2
            text-[10px]
            text-[#7b8799]
          "
        >
          <ShieldCheck
            size={13}
            className="
              text-[#17664e]
            "
          />

          No credit card
          required · Your
          workspace stays
          private
        </div>

        {/* Sign in */}
        <p
          className="
            mt-5
            text-center
            text-xs
            text-[var(--cf-text-secondary)]
          "
        >
          Already using
          ClientFlow?{' '}

          <Link
            href="/login"
            className="
              font-medium
              text-[#5b5bf7]
              transition
              hover:text-[#4d4ddd]
              hover:underline
            "
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-1.5
          block
          text-[12px]
          font-medium
          text-[#354156]
        "
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          className="
            mt-1
            text-[11px]
            leading-4
            text-[#b33340]
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  id,
  visible,
  toggle,
  autoComplete,
  registration,
  invalid,
}: {
  id: string;
  visible: boolean;
  toggle: () => void;
  autoComplete: string;
  registration:
    UseFormRegisterReturn;
  invalid?: boolean;
}) {
  return (
    <div
      className={`
        flex
        h-11
        items-center
        overflow-hidden
        rounded-md
        border
        bg-white
        transition

        ${
          invalid
            ? `
              border-[#d85b67]
              ring-4
              ring-[#b33340]/5
            `
            : `
              border-[#cbd3df]
              focus-within:border-[#5b5bf7]
              focus-within:ring-4
              focus-within:ring-[#5b5bf7]/10
            `
        }
      `}
    >
      <input
        id={id}
        type={
          visible
            ? 'text'
            : 'password'
        }
        autoComplete={
          autoComplete
        }
        aria-invalid={
          invalid
        }
        {...registration}
        className="
          h-full
          min-w-0
          flex-1
          border-0
          bg-transparent
          px-3
          text-sm
          text-[#101729]
          outline-none
        "
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={
          visible
            ? 'Hide password'
            : 'Show password'
        }
        className="
          mr-1.5
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-md
          text-[#7b8799]
          transition
          hover:bg-[var(--cf-page)]
          hover:text-[#354156]
        "
      >
        {visible ? (
          <EyeOff size={15} />
        ) : (
          <Eye size={15} />
        )}
      </button>
    </div>
  );
}

function PasswordStrength({
  score,
}: {
  score: number;
}) {
  const data =
    [
      {
        label:
          'Very weak',
        className:
          'bg-[#b33340]',
      },
      {
        label: 'Weak',
        className:
          'bg-[#d37632]',
      },
      {
        label: 'Good',
        className:
          'bg-[#c09628]',
      },
      {
        label: 'Strong',
        className:
          'bg-[#17664e]',
      },
    ][
      Math.max(
        score - 1,
        0,
      )
    ];

  return (
    <div>
      <div
        className="
          grid
          grid-cols-4
          gap-1
        "
      >
        {[
          1,
          2,
          3,
          4,
        ].map(
          (item) => (
            <span
              key={item}
              className={`
                h-1
                rounded-full
                transition

                ${
                  item <= score
                    ? data.className
                    : 'bg-[#e7eaf0]'
                }
              `}
            />
          ),
        )}
      </div>

      <div
        className="
          mt-1.5
          flex
          items-center
          justify-between
          text-[10px]
          text-[#7b8799]
        "
      >
        <span>
          {data.label}
        </span>

        <span>
          8+ chars · uppercase
          · number · symbol
        </span>
      </div>
    </div>
  );
}