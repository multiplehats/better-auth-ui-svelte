---
'better-auth-ui-svelte': minor
---

Add two-factor method selection, manual entry code, and sign-in 2FA redirect.

- **2FA method selector**: When both `totp` and `otp` are enabled in the
  `twoFactor` config, the two-factor password dialog now shows a radio
  group letting the user choose their preferred method before enabling.
  Passes the selected `method` to `authClient.twoFactor.enable()`.

- **Manual entry code for TOTP**: The two-factor form now extracts the
  secret from the TOTP URI and displays it with a copy button, so users
  can manually enter it in their authenticator app if they can't scan the
  QR code.

- **Sign-in 2FA redirect with server methods**: When the sign-in response
  includes `twoFactorRedirect`, the available `twoFactorMethods` from the
  server are now passed via the `methods` query parameter to the
  two-factor view, so the form can show only the enrolled method(s).

- **New localization keys**: `TWO_FACTOR_MANUAL_ENTRY`,
  `TWO_FACTOR_METHOD`, `TWO_FACTOR_METHOD_TOTP`, `TWO_FACTOR_METHOD_OTP`.
