// 'use client';

// import {
//   ArrowRight,
//   CheckCircle2,
//   LoaderCircle,
//   LockKeyhole,
//   Mail,
//   ShieldCheck,
//   UsersRound,
// } from 'lucide-react';

// import {
//   useParams,
// } from 'next/navigation';

// import {
//   FormEvent,
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';

// import {
//   useAuth,
// } from '@/components/providers/auth-provider';

// import {
//   apiRequest,
// } from '@/lib/api';

// import {
//   clientFlowSwal,
// } from '@/lib/swal';

// type InvitationRole =
//   | 'OWNER'
//   | 'ADMIN'
//   | 'MEMBER';

// interface InvitationPreview {
//   email: string;
//   role: InvitationRole;
//   expiresAt: string;
//   accountExists: boolean;

//   organization: {
//     id: string;
//     name: string;
//     slug: string;
//   };

//   invitedBy?: {
//     firstName?: string | null;
//     lastName?: string | null;
//     email: string;
//   } | null;
// }

// interface AuthInvitationResponse {
//   accessToken: string;

//   user: {
//     id: string;
//     email: string;
//     firstName?: string | null;
//     lastName?: string | null;
//   };

//   organization: {
//     id: string;
//     name: string;
//     slug: string;
//     role: InvitationRole;
//   };
// }

// function roleLabel(
//   role:
//     InvitationRole,
// ) {
//   if (
//     role ===
//     'OWNER'
//   ) {
//     return 'Owner';
//   }

//   if (
//     role ===
//     'ADMIN'
//   ) {
//     return 'Admin';
//   }

//   return 'Member';
// }

// function inviterLabel(
//   invitation:
//     InvitationPreview,
// ) {
//   const invitedBy =
//     invitation.invitedBy;

//   if (
//     !invitedBy
//   ) {
//     return 'A workspace administrator';
//   }

//   const name =
//     [
//       invitedBy.firstName,
//       invitedBy.lastName,
//     ]
//       .filter(
//         Boolean,
//       )
//       .join(
//         ' ',
//       )
//       .trim();

//   return (
//     name ||
//     invitedBy.email
//   );
// }

// function formatExpiry(
//   value:
//     string,
// ) {
//   const date =
//     new Date(
//       value,
//     );

//   if (
//     Number.isNaN(
//       date.getTime(),
//     )
//   ) {
//     return 'soon';
//   }

//   return new Intl.DateTimeFormat(
//     'en',
//     {
//       dateStyle:
//         'medium',

//       timeStyle:
//         'short',
//     },
//   ).format(
//     date,
//   );
// }

// export default function InvitationPage() {
//   const params =
//     useParams();

//   const token =
//     Array.isArray(
//       params.token,
//     )
//       ? params.token[0]
//       : params.token;

//   const {
//     user,
//     status,
//     request,
//     logout,
//   } =
//     useAuth();

//   const [
//     invitation,
//     setInvitation,
//   ] =
//     useState<
//       InvitationPreview | null
//     >(null);

//   const [
//     loading,
//     setLoading,
//   ] =
//     useState(
//       true,
//     );

//   const [
//     submitting,
//     setSubmitting,
//   ] =
//     useState(
//       false,
//     );

//   const [
//     error,
//     setError,
//   ] =
//     useState<
//       string | null
//     >(null);

//   const [
//     email,
//     setEmail,
//   ] =
//     useState(
//       '',
//     );

//   const [
//     password,
//     setPassword,
//   ] =
//     useState(
//       '',
//     );

//   const [
//     firstName,
//     setFirstName,
//   ] =
//     useState(
//       '',
//     );

//   const [
//     lastName,
//     setLastName,
//   ] =
//     useState(
//       '',
//     );

//   const [
//     confirmPassword,
//     setConfirmPassword,
//   ] =
//     useState(
//       '',
//     );

//   const loadInvitation =
//     useCallback(
//       async () => {
//         if (
//           !token ||
//           typeof token !==
//             'string'
//         ) {
//           setError(
//             'Invitation not found.',
//           );

//           setLoading(
//             false,
//           );

//           return;
//         }

//         setLoading(
//           true,
//         );

//         setError(
//           null,
//         );

//         try {
//           const response =
//             await apiRequest<
//               InvitationPreview
//             >(
//               `/auth/invitations/${encodeURIComponent(token)}`,
//               {
//                 cache:
//                   'no-store',

//                 dedupe:
//                   false,
//               },
//             );

//           setInvitation(
//             response,
//           );

//           setEmail(
//             response.email,
//           );
//         } catch (
//           loadError
//         ) {
//           setInvitation(
//             null,
//           );

//           setError(
//             loadError instanceof
//               Error
//               ? loadError.message
//               : 'This invitation is unavailable.',
//           );
//         } finally {
//           setLoading(
//             false,
//           );
//         }
//       },
//       [token],
//     );

//   useEffect(() => {
//     void loadInvitation();
//   }, [loadInvitation]);

//   const authenticatedEmailMatches =
//     useMemo(
//       () =>
//         Boolean(
//           invitation &&
//           user?.email &&
//           user.email
//             .trim()
//             .toLowerCase() ===
//             invitation.email
//               .trim()
//               .toLowerCase(),
//         ),
//       [
//         invitation,
//         user,
//       ],
//     );

//   async function finishAcceptance(
//     message:
//       string,
//   ) {
//     await clientFlowSwal.fire({
//       title:
//         'Welcome to the workspace',

//       text:
//         message,

//       icon:
//         'success',

//       confirmButtonText:
//         'Open ClientFlow',

//       allowOutsideClick:
//         false,
//     });

//     window.location.assign(
//       '/dashboard',
//     );
//   }

//   async function acceptAsCurrentUser() {
//     if (
//       !invitation ||
//       !token ||
//       typeof token !==
//         'string'
//     ) {
//       return;
//     }

//     setSubmitting(
//       true,
//     );

//     setError(
//       null,
//     );

//     try {
//       await request<
//         AuthInvitationResponse
//       >(
//         `/auth/invitations/${encodeURIComponent(token)}/accept`,
//         {
//           method:
//             'POST',
//         },
//       );

//       await finishAcceptance(
//         `You joined ${invitation.organization.name}.`,
//       );
//     } catch (
//       acceptError
//     ) {
//       setError(
//         acceptError instanceof
//           Error
//           ? acceptError.message
//           : 'Unable to accept invitation.',
//       );
//     } finally {
//       setSubmitting(
//         false,
//       );
//     }
//   }

//   async function signInAndAccept(
//     event:
//       FormEvent<HTMLFormElement>,
//   ) {
//     event.preventDefault();

//     if (
//       !invitation ||
//       !token ||
//       typeof token !==
//         'string'
//     ) {
//       return;
//     }

//     setSubmitting(
//       true,
//     );

//     setError(
//       null,
//     );

//     try {
//       await apiRequest<
//         AuthInvitationResponse
//       >(
//         `/auth/invitations/${encodeURIComponent(token)}/login`,
//         {
//           method:
//             'POST',

//           cache:
//             'no-store',

//           body:
//             JSON.stringify({
//               email,
//               password,
//             }),
//         },
//       );

//       await finishAcceptance(
//         `You joined ${invitation.organization.name}.`,
//       );
//     } catch (
//       loginError
//     ) {
//       setError(
//         loginError instanceof
//           Error
//           ? loginError.message
//           : 'Unable to sign in and accept invitation.',
//       );
//     } finally {
//       setSubmitting(
//         false,
//       );
//     }
//   }

//   async function registerAndAccept(
//     event:
//       FormEvent<HTMLFormElement>,
//   ) {
//     event.preventDefault();

//     if (
//       !invitation ||
//       !token ||
//       typeof token !==
//         'string'
//     ) {
//       return;
//     }

//     if (
//       password !==
//       confirmPassword
//     ) {
//       setError(
//         'Passwords do not match.',
//       );

//       return;
//     }

//     if (
//       password.length <
//       12
//     ) {
//       setError(
//         'Password must contain at least 12 characters.',
//       );

//       return;
//     }

//     setSubmitting(
//       true,
//     );

//     setError(
//       null,
//     );

//     try {
//       await apiRequest<
//         AuthInvitationResponse
//       >(
//         `/auth/invitations/${encodeURIComponent(token)}/register`,
//         {
//           method:
//             'POST',

//           cache:
//             'no-store',

//           body:
//             JSON.stringify({
//               firstName,
//               lastName:
//                 lastName.trim() ||
//                 undefined,

//               password,
//             }),
//         },
//       );

//       await finishAcceptance(
//         `Your account was created and you joined ${invitation.organization.name}.`,
//       );
//     } catch (
//       registerError
//     ) {
//       setError(
//         registerError instanceof
//           Error
//           ? registerError.message
//           : 'Unable to create your account.',
//       );
//     } finally {
//       setSubmitting(
//         false,
//       );
//     }
//   }

//   return (
//     <main
//       className="
//         min-h-screen
//         bg-[#f6f7fb]
//         px-4
//         py-8
//         text-[#17191d]

//         sm:px-6
//         sm:py-12
//       "
//     >
//       <div
//         className="
//           mx-auto
//           grid
//           w-full
//           max-w-[1080px]
//           overflow-hidden
//           rounded-[24px]
//           border
//           border-black/5
//           bg-white
//           shadow-[0_28px_90px_rgba(20,24,40,.12)]

//           lg:grid-cols-[.95fr_1.05fr]
//         "
//       >
//         <section
//           className="
//             relative
//             overflow-hidden
//             bg-[#11131a]
//             p-7
//             text-white

//             sm:p-10
//             lg:min-h-[650px]
//           "
//         >
//           <div
//             className="
//               absolute
//               inset-0
//               bg-[radial-gradient(circle_at_20%_10%,rgba(99,91,255,.32),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(90,210,180,.12),transparent_34%)]
//             "
//           />

//           <div
//             className="
//               relative
//               z-10
//               flex
//               h-full
//               flex-col
//             "
//           >
//             <div
//               className="
//                 text-[18px]
//                 font-semibold
//                 tracking-[-.4px]
//               "
//             >
//               ClientFlow
//             </div>

//             <div
//               className="
//                 my-auto
//                 py-12
//               "
//             >
//               <div
//                 className="
//                   inline-flex
//                   items-center
//                   gap-2
//                   rounded-full
//                   border
//                   border-white/10
//                   bg-white/5
//                   px-3
//                   py-1.5
//                   text-[11px]
//                   font-semibold
//                   text-white/70
//                 "
//               >
//                 <UsersRound
//                   size={14}
//                 />

//                 Workspace invitation
//               </div>

//               <h1
//                 className="
//                   mt-5
//                   max-w-[480px]
//                   text-[34px]
//                   font-semibold
//                   leading-[1.08]
//                   tracking-[-1.2px]

//                   sm:text-[45px]
//                 "
//               >
//                 Work together without losing the sales context.
//               </h1>

//               <p
//                 className="
//                   mt-5
//                   max-w-[480px]
//                   text-[14px]
//                   leading-7
//                   text-white/60

//                   sm:text-[15px]
//                 "
//               >
//                 Join the workspace to collaborate on leads, proposals,
//                 follow-ups and the next actions that move opportunities forward.
//               </p>
//             </div>

//             <div
//               className="
//                 grid
//                 gap-3
//                 text-[12px]
//                 text-white/60
//               "
//             >
//               <div
//                 className="
//                   flex
//                   items-center
//                   gap-2
//                 "
//               >
//                 <ShieldCheck
//                   size={15}
//                   className="
//                     text-[#8f87ff]
//                   "
//                 />

//                 Invitation tokens are single-use and expire automatically.
//               </div>

//               <div
//                 className="
//                   flex
//                   items-center
//                   gap-2
//                 "
//               >
//                 <LockKeyhole
//                   size={15}
//                   className="
//                     text-[#8f87ff]
//                   "
//                 />

//                 Access is restricted to the email address that was invited.
//               </div>
//             </div>
//           </div>
//         </section>

//         <section
//           className="
//             p-6

//             sm:p-10
//             lg:p-12
//           "
//         >
//           {loading ||
//           status ===
//             'loading' ? (
//             <div
//               className="
//                 flex
//                 min-h-[430px]
//                 items-center
//                 justify-center
//                 gap-2
//                 text-[14px]
//                 text-slate-500
//               "
//             >
//               <LoaderCircle
//                 size={18}
//                 className="
//                   animate-spin
//                 "
//               />

//               Checking invitation…
//             </div>
//           ) : !invitation ? (
//             <div
//               className="
//                 flex
//                 min-h-[430px]
//                 flex-col
//                 items-center
//                 justify-center
//                 text-center
//               "
//             >
//               <div
//                 className="
//                   flex
//                   h-12
//                   w-12
//                   items-center
//                   justify-center
//                   rounded-full
//                   bg-red-50
//                   text-red-600
//                 "
//               >
//                 <LockKeyhole
//                   size={20}
//                 />
//               </div>

//               <h2
//                 className="
//                   mt-5
//                   text-[22px]
//                   font-semibold
//                   tracking-[-.5px]
//                 "
//               >
//                 Invitation unavailable
//               </h2>

//               <p
//                 className="
//                   mt-2
//                   max-w-[420px]
//                   text-[14px]
//                   leading-6
//                   text-slate-500
//                 "
//               >
//                 {error ||
//                   'This invitation is invalid, expired, cancelled or already accepted.'}
//               </p>
//             </div>
//           ) : (
//             <>
//               <div
//                 className="
//                   rounded-[16px]
//                   border
//                   border-slate-200
//                   bg-slate-50
//                   p-4
//                 "
//               >
//                 <p
//                   className="
//                     text-[11px]
//                     font-semibold
//                     uppercase
//                     tracking-[.1em]
//                     text-slate-400
//                   "
//                 >
//                   You were invited to
//                 </p>

//                 <div
//                   className="
//                     mt-3
//                     flex
//                     items-center
//                     justify-between
//                     gap-4
//                   "
//                 >
//                   <div
//                     className="
//                       min-w-0
//                     "
//                   >
//                     <p
//                       className="
//                         truncate
//                         text-[17px]
//                         font-semibold
//                       "
//                     >
//                       {invitation.organization.name}
//                     </p>

//                     <p
//                       className="
//                         mt-1
//                         text-[12px]
//                         text-slate-500
//                       "
//                     >
//                       {inviterLabel(
//                         invitation,
//                       )}{' '}
//                       invited you as{' '}
//                       {roleLabel(
//                         invitation.role,
//                       )}
//                     </p>
//                   </div>

//                   <span
//                     className="
//                       shrink-0
//                       rounded-full
//                       bg-[#635bff]/10
//                       px-3
//                       py-1.5
//                       text-[10px]
//                       font-semibold
//                       text-[#635bff]
//                     "
//                   >
//                     {roleLabel(
//                       invitation.role,
//                     )}
//                   </span>
//                 </div>

//                 <div
//                   className="
//                     mt-4
//                     flex
//                     items-center
//                     gap-2
//                     border-t
//                     border-slate-200
//                     pt-3
//                     text-[11px]
//                     text-slate-500
//                   "
//                 >
//                   <Mail
//                     size={13}
//                   />

//                   {invitation.email}

//                   <span>
//                     ·
//                   </span>

//                   Expires{' '}
//                   {formatExpiry(
//                     invitation.expiresAt,
//                   )}
//                 </div>
//               </div>

//               {error && (
//                 <div
//                   className="
//                     mt-5
//                     rounded-xl
//                     border
//                     border-red-200
//                     bg-red-50
//                     px-4
//                     py-3
//                     text-[13px]
//                     leading-5
//                     text-red-700
//                   "
//                 >
//                   {error}
//                 </div>
//               )}

//               {status ===
//                 'authenticated' ? (
//                 <div
//                   className="
//                     mt-7
//                   "
//                 >
//                   {authenticatedEmailMatches ? (
//                     <>
//                       <div
//                         className="
//                           flex
//                           items-start
//                           gap-3
//                           rounded-xl
//                           border
//                           border-emerald-200
//                           bg-emerald-50
//                           p-4
//                         "
//                       >
//                         <CheckCircle2
//                           size={18}
//                           className="
//                             mt-[1px]
//                             shrink-0
//                             text-emerald-600
//                           "
//                         />

//                         <div>
//                           <p
//                             className="
//                               text-[13px]
//                               font-semibold
//                               text-emerald-900
//                             "
//                           >
//                             Signed in as {user?.email}
//                           </p>

//                           <p
//                             className="
//                               mt-1
//                               text-[12px]
//                               leading-5
//                               text-emerald-700
//                             "
//                           >
//                             Accepting will add this workspace to your account
//                             and switch your active ClientFlow session to it.
//                           </p>
//                         </div>
//                       </div>

//                       <button
//                         type="button"
//                         disabled={
//                           submitting
//                         }
//                         onClick={() =>
//                           void acceptAsCurrentUser()
//                         }
//                         className="
//                           mt-5
//                           inline-flex
//                           h-12
//                           w-full
//                           items-center
//                           justify-center
//                           gap-2
//                           rounded-xl
//                           bg-[#635bff]
//                           px-5
//                           text-[14px]
//                           font-semibold
//                           text-white
//                           transition
//                           hover:bg-[#554df0]
//                           disabled:cursor-not-allowed
//                           disabled:opacity-60
//                         "
//                       >
//                         {submitting ? (
//                           <LoaderCircle
//                             size={16}
//                             className="
//                               animate-spin
//                             "
//                           />
//                         ) : (
//                           <ArrowRight
//                             size={16}
//                           />
//                         )}

//                         Accept and open workspace
//                       </button>
//                     </>
//                   ) : (
//                     <div
//                       className="
//                         rounded-xl
//                         border
//                         border-amber-200
//                         bg-amber-50
//                         p-4
//                       "
//                     >
//                       <p
//                         className="
//                           text-[13px]
//                           font-semibold
//                           text-amber-900
//                         "
//                       >
//                         This invitation belongs to {invitation.email}
//                       </p>

//                       <p
//                         className="
//                           mt-1
//                           text-[12px]
//                           leading-5
//                           text-amber-700
//                         "
//                       >
//                         You are currently signed in as {user?.email}. Sign out
//                         and continue with the invited account.
//                       </p>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           void logout()
//                         }
//                         className="
//                           mt-4
//                           h-10
//                           rounded-lg
//                           border
//                           border-amber-300
//                           bg-white
//                           px-4
//                           text-[12px]
//                           font-semibold
//                           text-amber-900
//                           transition
//                           hover:bg-amber-100
//                         "
//                       >
//                         Sign out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : invitation.accountExists ? (
//                 <form
//                   onSubmit={
//                     signInAndAccept
//                   }
//                   className="
//                     mt-7
//                   "
//                 >
//                   <p
//                     className="
//                       text-[12px]
//                       font-semibold
//                       uppercase
//                       tracking-[.09em]
//                       text-slate-400
//                     "
//                   >
//                     Existing ClientFlow account
//                   </p>

//                   <h2
//                     className="
//                       mt-2
//                       text-[24px]
//                       font-semibold
//                       tracking-[-.6px]
//                     "
//                   >
//                     Sign in to accept
//                   </h2>

//                   <label
//                     className="
//                       mt-6
//                       block
//                     "
//                   >
//                     <span
//                       className="
//                         mb-2
//                         block
//                         text-[12px]
//                         font-semibold
//                         text-slate-600
//                       "
//                     >
//                       Email
//                     </span>

//                     <input
//                       type="email"
//                       readOnly
//                       value={
//                         email
//                       }
//                       className="
//                         h-11
//                         w-full
//                         rounded-xl
//                         border
//                         border-slate-200
//                         bg-slate-50
//                         px-3
//                         text-[14px]
//                         text-slate-600
//                         outline-none
//                       "
//                     />
//                   </label>

//                   <label
//                     className="
//                       mt-4
//                       block
//                     "
//                   >
//                     <span
//                       className="
//                         mb-2
//                         block
//                         text-[12px]
//                         font-semibold
//                         text-slate-600
//                       "
//                     >
//                       Password
//                     </span>

//                     <input
//                       type="password"
//                       required
//                       value={
//                         password
//                       }
//                       onChange={(
//                         event,
//                       ) =>
//                         setPassword(
//                           event.target.value,
//                         )
//                       }
//                       className="
//                         h-11
//                         w-full
//                         rounded-xl
//                         border
//                         border-slate-200
//                         px-3
//                         text-[14px]
//                         outline-none
//                         focus:border-[#635bff]
//                       "
//                     />
//                   </label>

//                   <button
//                     type="submit"
//                     disabled={
//                       submitting
//                     }
//                     className="
//                       mt-6
//                       inline-flex
//                       h-12
//                       w-full
//                       items-center
//                       justify-center
//                       gap-2
//                       rounded-xl
//                       bg-[#635bff]
//                       px-5
//                       text-[14px]
//                       font-semibold
//                       text-white
//                       transition
//                       hover:bg-[#554df0]
//                       disabled:cursor-not-allowed
//                       disabled:opacity-60
//                     "
//                   >
//                     {submitting && (
//                       <LoaderCircle
//                         size={16}
//                         className="
//                           animate-spin
//                         "
//                       />
//                     )}

//                     Sign in and accept
//                   </button>
//                 </form>
//               ) : (
//                 <form
//                   onSubmit={
//                     registerAndAccept
//                   }
//                   className="
//                     mt-7
//                   "
//                 >
//                   <p
//                     className="
//                       text-[12px]
//                       font-semibold
//                       uppercase
//                       tracking-[.09em]
//                       text-slate-400
//                     "
//                   >
//                     New ClientFlow account
//                   </p>

//                   <h2
//                     className="
//                       mt-2
//                       text-[24px]
//                       font-semibold
//                       tracking-[-.6px]
//                     "
//                   >
//                     Create your account
//                   </h2>

//                   <div
//                     className="
//                       mt-6
//                       grid
//                       gap-4

//                       sm:grid-cols-2
//                     "
//                   >
//                     <label>
//                       <span
//                         className="
//                           mb-2
//                           block
//                           text-[12px]
//                           font-semibold
//                           text-slate-600
//                         "
//                       >
//                         First name
//                       </span>

//                       <input
//                         required
//                         value={
//                           firstName
//                         }
//                         onChange={(
//                           event,
//                         ) =>
//                           setFirstName(
//                             event.target.value,
//                           )
//                         }
//                         className="
//                           h-11
//                           w-full
//                           rounded-xl
//                           border
//                           border-slate-200
//                           px-3
//                           text-[14px]
//                           outline-none
//                           focus:border-[#635bff]
//                         "
//                       />
//                     </label>

//                     <label>
//                       <span
//                         className="
//                           mb-2
//                           block
//                           text-[12px]
//                           font-semibold
//                           text-slate-600
//                         "
//                       >
//                         Last name
//                       </span>

//                       <input
//                         value={
//                           lastName
//                         }
//                         onChange={(
//                           event,
//                         ) =>
//                           setLastName(
//                             event.target.value,
//                           )
//                         }
//                         className="
//                           h-11
//                           w-full
//                           rounded-xl
//                           border
//                           border-slate-200
//                           px-3
//                           text-[14px]
//                           outline-none
//                           focus:border-[#635bff]
//                         "
//                       />
//                     </label>
//                   </div>

//                   <label
//                     className="
//                       mt-4
//                       block
//                     "
//                   >
//                     <span
//                       className="
//                         mb-2
//                         block
//                         text-[12px]
//                         font-semibold
//                         text-slate-600
//                       "
//                     >
//                       Email
//                     </span>

//                     <input
//                       type="email"
//                       readOnly
//                       value={
//                         invitation.email
//                       }
//                       className="
//                         h-11
//                         w-full
//                         rounded-xl
//                         border
//                         border-slate-200
//                         bg-slate-50
//                         px-3
//                         text-[14px]
//                         text-slate-600
//                         outline-none
//                       "
//                     />
//                   </label>

//                   <label
//                     className="
//                       mt-4
//                       block
//                     "
//                   >
//                     <span
//                       className="
//                         mb-2
//                         block
//                         text-[12px]
//                         font-semibold
//                         text-slate-600
//                       "
//                     >
//                       Password
//                     </span>

//                     <input
//                       type="password"
//                       required
//                       minLength={
//                         12
//                       }
//                       value={
//                         password
//                       }
//                       onChange={(
//                         event,
//                       ) =>
//                         setPassword(
//                           event.target.value,
//                         )
//                       }
//                       className="
//                         h-11
//                         w-full
//                         rounded-xl
//                         border
//                         border-slate-200
//                         px-3
//                         text-[14px]
//                         outline-none
//                         focus:border-[#635bff]
//                       "
//                     />

//                     <span
//                       className="
//                         mt-2
//                         block
//                         text-[11px]
//                         text-slate-400
//                       "
//                     >
//                       At least 12 characters.
//                     </span>
//                   </label>

//                   <label
//                     className="
//                       mt-4
//                       block
//                     "
//                   >
//                     <span
//                       className="
//                         mb-2
//                         block
//                         text-[12px]
//                         font-semibold
//                         text-slate-600
//                       "
//                     >
//                       Confirm password
//                     </span>

//                     <input
//                       type="password"
//                       required
//                       minLength={
//                         12
//                       }
//                       value={
//                         confirmPassword
//                       }
//                       onChange={(
//                         event,
//                       ) =>
//                         setConfirmPassword(
//                           event.target.value,
//                         )
//                       }
//                       className="
//                         h-11
//                         w-full
//                         rounded-xl
//                         border
//                         border-slate-200
//                         px-3
//                         text-[14px]
//                         outline-none
//                         focus:border-[#635bff]
//                       "
//                     />
//                   </label>

//                   <button
//                     type="submit"
//                     disabled={
//                       submitting
//                     }
//                     className="
//                       mt-6
//                       inline-flex
//                       h-12
//                       w-full
//                       items-center
//                       justify-center
//                       gap-2
//                       rounded-xl
//                       bg-[#635bff]
//                       px-5
//                       text-[14px]
//                       font-semibold
//                       text-white
//                       transition
//                       hover:bg-[#554df0]
//                       disabled:cursor-not-allowed
//                       disabled:opacity-60
//                     "
//                   >
//                     {submitting && (
//                       <LoaderCircle
//                         size={16}
//                         className="
//                           animate-spin
//                         "
//                       />
//                     )}

//                     Create account and accept
//                   </button>
//                 </form>
//               )}
//             </>
//           )}
//         </section>
//       </div>
//     </main>
//   );
// }


<section>
  kkkkkk
</section>
