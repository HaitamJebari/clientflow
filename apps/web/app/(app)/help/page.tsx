'use client';

import {
  BookOpen,
  CircleHelp,
  FileText,
  MessageSquareText,
  Search,
  Settings,
  Sparkles,
  UsersRound,
} from 'lucide-react';

import Link from 'next/link';

import {
  useMemo,
  useState,
} from 'react';

const articles = [
  {
    title:
      'How ClientFlow organizes a lead',
    body:
      'A lead is an opportunity. Contacts are people or companies, while pipeline stages describe the commercial progress of each opportunity.',
    href:
      '/leads',
    icon:
      FileText,
  },
  {
    title:
      'How proposals and follow-ups work together',
    body:
      'Proposals capture the offer. Follow-ups capture the next planned touchpoint so active opportunities do not go quiet.',
    href:
      '/follow-ups',
    icon:
      MessageSquareText,
  },
  {
    title:
      'Workspace members and roles',
    body:
      'Members belong to the current organization and have Owner, Admin or Member roles.',
    href:
      '/members',
    icon:
      UsersRound,
  },
  {
    title:
      'Profile and workspace settings',
    body:
      'Update your profile and organization information from the Settings page.',
    href:
      '/settings',
    icon:
      Settings,
  },
];

const faqs = [
  {
    question:
      'Why do I not see real email messages in Conversations?',
    answer:
      'The Conversations page does not invent communication history. Real messages will appear only after an email provider is connected and synchronized.',
  },
  {
    question:
      'Why is AI generation unavailable?',
    answer:
      'The AI architecture can remain installed while generation is disabled. ClientFlow still works with deterministic lead, proposal and follow-up logic.',
  },
  {
    question:
      'What does the Follow-ups badge mean?',
    answer:
      'It represents actionable follow-ups such as overdue items and items due in the next 24 hours, rather than a hardcoded number.',
  },
  {
    question:
      'Can I invite team members already?',
    answer:
      'The Members page lists real workspace memberships. Invitation email delivery and role management are intentionally deferred until the invitation workflow is implemented.',
  },
];

export default function HelpPage() {
  const [
    query,
    setQuery,
  ] =
    useState('');

  const filteredFaqs =
    useMemo(
      () => {
        const value =
          query
            .trim()
            .toLowerCase();

        if (!value) {
          return faqs;
        }

        return faqs.filter(
          (
            item,
          ) =>
            item.question
              .toLowerCase()
              .includes(
                value,
              ) ||
            item.answer
              .toLowerCase()
              .includes(
                value,
              ),
        );
      },
      [query],
    );

  return (
    <div
      className="
        min-w-0
        text-[var(--cf-text)]
      "
    >
      <div
        className="
          rounded-[20px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          px-5
          py-8
          shadow-[var(--cf-shadow)]

          sm:px-8
          sm:py-10
        "
      >
        <div
          className="
            mx-auto
            max-w-[760px]
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-[var(--cf-primary-soft)]
              text-[var(--cf-primary)]
            "
          >
            <CircleHelp
              size={21}
            />
          </div>

          <p
            className="
              mt-4
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[var(--cf-text-muted)]
            "
          >
            Help & support
          </p>

          <h1
            className="
              mt-2
              text-[30px]
              font-semibold
              tracking-[-1px]

              sm:text-[38px]
            "
          >
            Find your way around ClientFlow
          </h1>

          <p
            className="
              mt-3
              text-[14px]
              leading-6
              text-[var(--cf-text-secondary)]

              sm:text-[15px]
            "
          >
            Product guidance for the current MVP. No fake support
            contact is shown until a real support channel is configured.
          </p>

          <label
            className="
              mx-auto
              mt-6
              flex
              h-12
              max-w-[560px]
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface-soft)]
              px-4
            "
          >
            <Search
              size={16}
              className="
                text-[var(--cf-text-muted)]
              "
            />

            <input
              value={
                query
              }
              onChange={(
                event,
              ) =>
                setQuery(
                  event.target
                    .value,
                )
              }
              placeholder="Search help"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[14px]
                outline-none
              "
            />
          </label>
        </div>
      </div>

      <div
        className="
          mt-6
          grid
          gap-4

          md:grid-cols-2
        "
      >
        {articles.map(
          (
            article,
          ) => {
            const Icon =
              article.icon;

            return (
              <Link
                key={
                  article.title
                }
                href={
                  article.href
                }
                className="
                  rounded-[16px]
                  border
                  border-[var(--cf-border)]
                  bg-[var(--cf-surface)]
                  p-5
                  shadow-[var(--cf-shadow)]
                  transition
                  hover:-translate-y-[1px]
                  hover:border-[var(--cf-primary)]/25
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
                    bg-[var(--cf-primary-soft)]
                    text-[var(--cf-primary)]
                  "
                >
                  <Icon
                    size={17}
                  />
                </div>

                <h2
                  className="
                    mt-4
                    text-[15px]
                    font-semibold
                  "
                >
                  {article.title}
                </h2>

                <p
                  className="
                    mt-2
                    text-[12px]
                    leading-5
                    text-[var(--cf-text-secondary)]
                  "
                >
                  {article.body}
                </p>
              </Link>
            );
          },
        )}
      </div>

      <section
        className="
          mt-6
          rounded-[16px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          p-5
          shadow-[var(--cf-shadow)]

          sm:p-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <BookOpen
            size={17}
            className="
              text-[var(--cf-primary)]
            "
          />

          <h2
            className="
              text-[17px]
              font-semibold
            "
          >
            Frequently asked questions
          </h2>
        </div>

        <div
          className="
            mt-5
            space-y-3
          "
        >
          {filteredFaqs.length ===
          0 ? (
            <div
              className="
                rounded-xl
                border
                border-[var(--cf-border-soft)]
                bg-[var(--cf-surface-soft)]
                p-4
                text-[13px]
                text-[var(--cf-text-secondary)]
              "
            >
              No help articles match “{query}”.
            </div>
          ) : (
            filteredFaqs.map(
              (
                item,
              ) => (
                <details
                  key={
                    item.question
                  }
                  className="
                    group
                    rounded-xl
                    border
                    border-[var(--cf-border-soft)]
                    bg-[var(--cf-surface-soft)]
                    p-4
                  "
                >
                  <summary
                    className="
                      cursor-pointer
                      list-none
                      text-[13px]
                      font-semibold
                    "
                  >
                    {item.question}
                  </summary>

                  <p
                    className="
                      mt-3
                      text-[12px]
                      leading-6
                      text-[var(--cf-text-secondary)]
                    "
                  >
                    {item.answer}
                  </p>
                </details>
              ),
            )
          )}
        </div>
      </section>

      <div
        className="
          mt-6
          rounded-[16px]
          border
          border-[var(--cf-primary)]/15
          bg-[var(--cf-primary-soft)]
          p-5
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <Sparkles
            size={17}
            className="
              mt-0.5
              text-[var(--cf-primary)]
            "
          />

          <div>
            <p
              className="
                text-[13px]
                font-semibold
              "
            >
              Support channel comes after the core product pages
            </p>

            <p
              className="
                mt-1
                text-[12px]
                leading-5
                text-[var(--cf-text-secondary)]
              "
            >
              When you choose a real support email, ticket system or
              chat provider, this page can connect to it without
              changing the rest of the workspace UX.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
