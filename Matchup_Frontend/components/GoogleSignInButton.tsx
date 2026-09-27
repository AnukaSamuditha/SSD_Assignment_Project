type GoogleSignInButtonProps = {
  accountType?: "regular" | "employer";
  label?: string;
};

// Plain <a> navigation on purpose - this has to be a real top-level browser
// redirect to the API (which then redirects to Google), not an axios/fetch
// call, since the OAuth/OIDC dance relies on full-page redirects and cookies.
export default function GoogleSignInButton({
  accountType = "regular",
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const oauthUrl = `${process.env.NEXT_PUBLIC_SERVER}/users/oauth/google?type=${accountType}`;

  return (
    <a
      href={oauthUrl}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-gray-200 px-3 py-2.5 text-sm font-medium text-[#222222] transition-colors hover:bg-gray-50"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.87c2.27-2.09 3.58-5.17 3.58-8.84Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
        />
      </svg>
      {label}
    </a>
  );
}
