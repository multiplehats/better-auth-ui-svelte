import type { AuthLocalization } from './auth-localization.js';

/**
 * Dutch (Nederlands) localization for better-auth-ui-svelte.
 *
 * Usage:
 * ```svelte
 * <AuthUIProvider localization={nlLocalization}>
 *   ...
 * </AuthUIProvider>
 * ```
 */
export const nlLocalization: AuthLocalization = {
	APP: 'App',

	ACCOUNT: 'Account',
	ACCOUNTS: 'Accounts',
	ACCOUNTS_DESCRIPTION: 'Wissel tussen je ingelogde accounts.',
	ACCOUNTS_INSTRUCTIONS: 'Log in op een extra account.',
	ADD_ACCOUNT: 'Account toevoegen',

	ADD_PASSKEY: 'Passkey toevoegen',

	ALREADY_HAVE_AN_ACCOUNT: 'Heb je al een account?',

	AVATAR: 'Profielfoto',
	AVATAR_DESCRIPTION: 'Klik op de profielfoto om een eigen afbeelding te uploaden.',
	AVATAR_INSTRUCTIONS: 'Een profielfoto is optioneel, maar wordt aangeraden.',

	BACKUP_CODE_REQUIRED: 'Herstelcode is verplicht',
	BACKUP_CODES: 'Herstelcodes',
	BACKUP_CODES_DESCRIPTION:
		'Bewaar deze herstelcodes op een veilige plek. Je kunt ze gebruiken om toegang te krijgen tot je account als je je tweefactor-authenticatiemethode kwijtraakt.',
	BACKUP_CODE_PLACEHOLDER: 'Herstelcode',
	BACKUP_CODE: 'Herstelcode',

	CANCEL: 'Annuleren',

	CHANGE_PASSWORD: 'Wachtwoord wijzigen',
	CHANGE_PASSWORD_DESCRIPTION: 'Vul je huidige wachtwoord en een nieuw wachtwoord in.',
	CHANGE_PASSWORD_INSTRUCTIONS: 'Gebruik minimaal 8 tekens.',
	CHANGE_PASSWORD_SUCCESS: 'Je wachtwoord is gewijzigd.',

	CONFIRM_PASSWORD: 'Wachtwoord bevestigen',
	CONFIRM_PASSWORD_PLACEHOLDER: 'Wachtwoord bevestigen',
	CONFIRM_PASSWORD_REQUIRED: 'Wachtwoordbevestiging is verplicht',

	CONTINUE_WITH_AUTHENTICATOR: 'Verder met authenticator',

	COPIED_TO_CLIPBOARD: 'Gekopieerd naar klembord',
	COPY_TO_CLIPBOARD: 'Kopiëren naar klembord',
	COPY_ALL_CODES: 'Alle codes kopiëren',

	CONTINUE: 'Doorgaan',

	CURRENT_PASSWORD: 'Huidig wachtwoord',
	CURRENT_PASSWORD_PLACEHOLDER: 'Huidig wachtwoord',

	CURRENT_SESSION: 'Huidige sessie',

	DELETE: 'Verwijderen',
	DELETE_AVATAR: 'Profielfoto verwijderen',
	DELETE_ACCOUNT: 'Account verwijderen',
	DELETE_ACCOUNT_DESCRIPTION:
		'Verwijder je account en alle bijbehorende gegevens permanent. Deze actie kan niet ongedaan worden gemaakt.',
	DELETE_ACCOUNT_INSTRUCTIONS:
		'Bevestig de verwijdering van je account. Deze actie kan niet ongedaan worden gemaakt.',
	DELETE_ACCOUNT_VERIFY: 'Controleer je e-mail om de verwijdering van je account te bevestigen.',
	DELETE_ACCOUNT_SUCCESS: 'Je account is verwijderd.',

	DISABLE_TWO_FACTOR: 'Tweefactor uitschakelen',
	DISABLED_CREDENTIALS_DESCRIPTION: 'Kies een provider om in te loggen op je account',

	DONT_HAVE_AN_ACCOUNT: 'Nog geen account?',

	DONE: 'Klaar',

	EMAIL: 'E-mail',
	EMAIL_DESCRIPTION: 'Vul het e-mailadres in dat je wilt gebruiken om in te loggen.',
	EMAIL_INSTRUCTIONS: 'Vul een geldig e-mailadres in.',
	EMAIL_IS_THE_SAME: 'E-mailadres is hetzelfde',
	EMAIL_PLACEHOLDER: 'jij@voorbeeld.nl',
	EMAIL_REQUIRED: 'E-mailadres is verplicht',
	EMAIL_VERIFY_CHANGE: 'Controleer je e-mail om de wijziging te bevestigen.',
	EMAIL_VERIFICATION: 'Controleer je e-mail voor de verificatielink.',

	ENABLE_TWO_FACTOR: 'Tweefactor inschakelen',

	IS_INVALID: 'is ongeldig',
	IS_REQUIRED: 'is verplicht',
	IS_THE_SAME: 'is hetzelfde',

	FORGOT_AUTHENTICATOR: 'Authenticator vergeten?',
	FORGOT_PASSWORD: 'Wachtwoord vergeten',
	FORGOT_PASSWORD_ACTION: 'Resetlink versturen',
	FORGOT_PASSWORD_DESCRIPTION: 'Vul je e-mailadres in om je wachtwoord te resetten',
	FORGOT_PASSWORD_EMAIL: 'Controleer je e-mail voor de wachtwoordresetlink.',
	FORGOT_PASSWORD_LINK: 'Wachtwoord vergeten?',

	LINK: 'Koppelen',

	MAGIC_LINK: 'Inloglink',
	MAGIC_LINK_ACTION: 'Inloglink versturen',
	MAGIC_LINK_DESCRIPTION: 'Vul je e-mailadres in om een inloglink te ontvangen',
	MAGIC_LINK_EMAIL: 'Controleer je e-mail voor de inloglink',
	MAGIC_LINK_SENT: 'Inloglink verstuurd!',
	MAGIC_LINK_SENT_TO: 'We hebben een inloglink verstuurd naar',
	MAGIC_LINK_CHECK_INBOX:
		'Controleer je e-mail en klik op de inloglink om in te loggen op je account.',
	MAGIC_LINK_EXPIRES: 'De link verloopt over 5 minuten om veiligheidsredenen.',
	MAGIC_LINK_NO_EMAIL: 'Geen e-mail ontvangen?',
	RESEND_MAGIC_LINK: 'Inloglink opnieuw versturen',

	EMAIL_OTP: 'E-mailcode',
	EMAIL_OTP_SEND_ACTION: 'Code versturen',
	EMAIL_OTP_VERIFY_ACTION: 'Code verifiëren',
	EMAIL_OTP_DESCRIPTION: 'Vul je e-mailadres in om een code te ontvangen',
	EMAIL_OTP_VERIFICATION_SENT: 'Controleer je e-mail voor de verificatiecode.',

	NAME: 'Naam',
	NAME_DESCRIPTION: 'Vul je volledige naam of een weergavenaam in.',
	NAME_INSTRUCTIONS: 'Gebruik maximaal 32 tekens.',
	NAME_PLACEHOLDER: 'Naam',

	NEW_PASSWORD: 'Nieuw wachtwoord',
	NEW_PASSWORD_PLACEHOLDER: 'Nieuw wachtwoord',
	NEW_PASSWORD_REQUIRED: 'Nieuw wachtwoord is verplicht',

	ONE_TIME_PASSWORD: 'Eenmalig wachtwoord',

	OR_CONTINUE_WITH: 'Of verder met',

	PASSKEY: 'Passkey',
	PASSKEYS: 'Passkeys',
	PASSKEYS_DESCRIPTION: 'Beheer je passkeys voor veilige toegang.',
	PASSKEYS_INSTRUCTIONS: 'Toegang tot je account zonder wachtwoord.',

	PERSONAL_ACCOUNT: 'Persoonlijk account',

	API_KEYS: 'API-sleutels',
	API_KEYS_DESCRIPTION: 'Beheer je API-sleutels voor veilige toegang.',
	API_KEYS_INSTRUCTIONS: 'Genereer API-sleutels voor programmatische toegang tot je account.',
	CREATE_API_KEY: 'API-sleutel aanmaken',
	CREATE_API_KEY_DESCRIPTION:
		'Geef je API-sleutel een unieke naam om hem te onderscheiden van andere sleutels.',
	API_KEY_NAME_PLACEHOLDER: 'Nieuwe API-sleutel',
	API_KEY_CREATED: 'API-sleutel aangemaakt',
	CREATE_API_KEY_SUCCESS:
		'Kopieer je API-sleutel en bewaar hem op een veilige plek. Om veiligheidsredenen kunnen we hem niet nogmaals tonen.',
	NEVER_EXPIRES: 'Verloopt nooit',
	EXPIRES: 'Verloopt',
	NO_EXPIRATION: 'Geen vervaldatum',

	CREATE_ORGANIZATION: 'Organisatie aanmaken',
	ORGANIZATION: 'Organisatie',
	ORGANIZATION_NAME: 'Naam',
	ORGANIZATION_NAME_PLACEHOLDER: 'Voorbeeld BV',
	ORGANIZATION_NAME_DESCRIPTION: 'Dit is de zichtbare naam van je organisatie.',
	ORGANIZATION_NAME_INSTRUCTIONS: 'Gebruik maximaal 32 tekens.',
	ORGANIZATION_SLUG: 'Slug (URL)',
	ORGANIZATION_SLUG_DESCRIPTION: 'Dit is de URL-naamruimte van je organisatie.',
	ORGANIZATION_SLUG_INSTRUCTIONS: 'Gebruik maximaal 48 tekens.',
	ORGANIZATION_SLUG_PLACEHOLDER: 'voorbeeld-bv',
	CREATE_ORGANIZATION_SUCCESS: 'Organisatie succesvol aangemaakt',

	PASSWORD: 'Wachtwoord',
	PASSWORD_PLACEHOLDER: 'Wachtwoord',
	PASSWORD_REQUIRED: 'Wachtwoord is verplicht',
	PASSWORDS_DO_NOT_MATCH: 'Wachtwoorden komen niet overeen',

	PROVIDERS: 'Providers',
	PROVIDERS_DESCRIPTION: 'Koppel je account aan een externe dienst.',

	RECOVER_ACCOUNT: 'Account herstellen',
	RECOVER_ACCOUNT_ACTION: 'Account herstellen',
	RECOVER_ACCOUNT_DESCRIPTION: 'Vul een herstelcode in om toegang te krijgen tot je account',

	REMEMBER_ME: 'Onthoud mij',

	RESEND_CODE: 'Code opnieuw versturen',
	RESEND_VERIFICATION_EMAIL: 'Verificatie-e-mail opnieuw versturen',

	RESET_PASSWORD: 'Wachtwoord resetten',
	RESET_PASSWORD_ACTION: 'Nieuw wachtwoord opslaan',
	RESET_PASSWORD_DESCRIPTION: 'Vul hieronder je nieuwe wachtwoord in',
	RESET_PASSWORD_SUCCESS: 'Wachtwoord succesvol gereset',

	REQUEST_FAILED: 'Verzoek mislukt',

	REVOKE: 'Intrekken',

	DELETE_API_KEY: 'API-sleutel verwijderen',
	DELETE_API_KEY_CONFIRM: 'Weet je zeker dat je deze API-sleutel wilt verwijderen?',
	API_KEY: 'API-sleutel',

	SIGN_IN: 'Inloggen',
	SIGN_IN_ACTION: 'Inloggen',
	SIGN_IN_DESCRIPTION: 'Vul je e-mailadres in om in te loggen op je account',
	SIGN_IN_USERNAME_DESCRIPTION: 'Vul je gebruikersnaam of e-mailadres in om in te loggen',
	SIGN_IN_WITH: 'Inloggen met',

	SIGN_OUT: 'Uitloggen',

	SIGN_UP: 'Registreren',
	SIGN_UP_ACTION: 'Account aanmaken',
	SIGN_UP_DESCRIPTION: 'Vul je gegevens in om een account aan te maken',
	SIGN_UP_EMAIL: 'Controleer je e-mail voor de verificatielink.',

	SESSIONS: 'Sessies',
	SESSIONS_DESCRIPTION: 'Beheer je actieve sessies en trek toegang in.',

	SET_PASSWORD: 'Wachtwoord instellen',
	SET_PASSWORD_DESCRIPTION:
		'Klik op de knop hieronder om een e-mail te ontvangen waarmee je een wachtwoord kunt instellen voor je account.',

	SETTINGS: 'Instellingen',
	SAVE: 'Opslaan',
	SECURITY: 'Beveiliging',

	SWITCH_ACCOUNT: 'Wisselen van account',

	TRUST_DEVICE: 'Dit apparaat vertrouwen',

	TWO_FACTOR: 'Tweefactor',
	TWO_FACTOR_ACTION: 'Code verifiëren',
	TWO_FACTOR_DESCRIPTION: 'Vul je eenmalige code in om verder te gaan',
	TWO_FACTOR_CARD_DESCRIPTION: 'Voeg een extra beveiligingslaag toe aan je account.',
	TWO_FACTOR_DISABLE_INSTRUCTIONS: 'Vul je wachtwoord in om 2FA uit te schakelen.',
	TWO_FACTOR_ENABLE_INSTRUCTIONS: 'Vul je wachtwoord in om 2FA in te schakelen.',
	TWO_FACTOR_ENABLED: 'Tweefactor-authenticatie is ingeschakeld',
	TWO_FACTOR_DISABLED: 'Tweefactor-authenticatie is uitgeschakeld',
	TWO_FACTOR_PROMPT: 'Tweefactor-authenticatie',
	TWO_FACTOR_TOTP_LABEL: 'Scan de QR-code met je authenticator',

	SEND_VERIFICATION_CODE: 'Verificatiecode versturen',

	UNLINK: 'Ontkoppelen',

	UPDATED_SUCCESSFULLY: 'succesvol bijgewerkt',

	USERNAME: 'Gebruikersnaam',
	USERNAME_DESCRIPTION: 'Vul de gebruikersnaam in die je wilt gebruiken om in te loggen.',
	USERNAME_INSTRUCTIONS: 'Gebruik maximaal 32 tekens.',
	USERNAME_PLACEHOLDER: 'Gebruikersnaam',
	SIGN_IN_USERNAME_PLACEHOLDER: 'Gebruikersnaam of e-mail',

	VERIFY_YOUR_EMAIL: 'Verifieer je e-mailadres',
	VERIFY_YOUR_EMAIL_DESCRIPTION:
		'Verifieer je e-mailadres. Controleer je inbox voor de verificatie-e-mail. Als je de e-mail niet hebt ontvangen, klik dan op de knop hieronder om hem opnieuw te versturen.',
	EMAIL_VERIFICATION_REQUIRED: 'E-mailverificatie vereist',
	EMAIL_VERIFICATION_SENT_TO: 'We hebben een verificatielink verstuurd naar',
	EMAIL_VERIFICATION_CHECK_INBOX:
		'Controleer je e-mail en klik op de verificatielink om je registratie te voltooien.',
	EMAIL_VERIFICATION_AFTER_VERIFY:
		'Nadat je je e-mail hebt geverifieerd, kun je inloggen op je account.',
	EMAIL_VERIFICATION_NO_EMAIL: 'Geen e-mail ontvangen?',

	BACK_TO_SIGN_IN: 'Terug naar inloggen',

	EMAIL_VERIFIED: 'E-mail geverifieerd!',
	EMAIL_VERIFICATION_SUCCESS: 'E-mail succesvol geverifieerd!',
	EMAIL_VERIFICATION_SUCCESS_DESCRIPTION:
		'Je e-mailadres is succesvol geverifieerd. Je kunt nu inloggen op je account.',
	EMAIL_VERIFICATION_SUCCESS_MESSAGE: 'Je hebt nu toegang tot alle functies van je account.',
	EMAIL_VERIFICATION_FAILED: 'E-mailverificatie mislukt',

	VERIFY_EMAIL_TITLE: 'Verifieer je e-mailadres',
	VERIFY_EMAIL_TOKEN_DESCRIPTION: 'Klik op de knop hieronder om je e-mailadres te verifiëren.',
	VERIFY_EMAIL_BUTTON: 'E-mail verifiëren',
	VERIFYING: 'Bezig met verifiëren',

	CONTINUE_TO_SIGN_IN: 'Doorgaan naar inloggen',
	GO_BACK: 'Ga terug',

	SESSION_NOT_FRESH: 'Je sessie is verlopen. Log opnieuw in.',

	UPLOAD_AVATAR: 'Profielfoto uploaden',
	LOGO: 'Logo',
	LOGO_DESCRIPTION: 'Klik op het logo om een eigen afbeelding te uploaden.',
	LOGO_INSTRUCTIONS: 'Een logo is optioneel, maar wordt aangeraden.',
	UPLOAD: 'Uploaden',
	UPLOAD_LOGO: 'Logo uploaden',
	DELETE_LOGO: 'Logo verwijderen',

	PRIVACY_POLICY: 'Privacybeleid',
	TERMS_OF_SERVICE: 'Gebruiksvoorwaarden',
	PROTECTED_BY_RECAPTCHA: 'Deze site is beveiligd met reCAPTCHA.',
	BY_CONTINUING_YOU_AGREE: 'Door verder te gaan ga je akkoord met de',

	USER: 'Gebruiker',

	ORGANIZATIONS: 'Organisaties',
	ORGANIZATIONS_DESCRIPTION: 'Beheer je organisaties en lidmaatschappen.',
	ORGANIZATIONS_INSTRUCTIONS: 'Maak een organisatie aan om samen te werken met anderen.',

	LEAVE_ORGANIZATION: 'Organisatie verlaten',
	LEAVE_ORGANIZATION_CONFIRM: 'Weet je zeker dat je deze organisatie wilt verlaten?',
	LEAVE_ORGANIZATION_SUCCESS: 'Je hebt de organisatie succesvol verlaten.',

	MANAGE_ORGANIZATION: 'Organisatie beheren',

	REMOVE_MEMBER: 'Lid verwijderen',
	REMOVE_MEMBER_CONFIRM: 'Weet je zeker dat je dit lid wilt verwijderen uit de organisatie?',
	REMOVE_MEMBER_SUCCESS: 'Lid succesvol verwijderd',

	INVITE_MEMBER: 'Lid uitnodigen',
	MEMBERS: 'Leden',
	MEMBERS_DESCRIPTION: 'Voeg leden toe of verwijder ze, en beheer hun rollen.',
	MEMBERS_INSTRUCTIONS: 'Nodig nieuwe leden uit voor je organisatie.',
	INVITE_MEMBER_DESCRIPTION:
		'Stuur een uitnodiging om een nieuw lid toe te voegen aan je organisatie.',

	ROLE: 'Rol',
	SELECT_ROLE: 'Selecteer een rol',
	ADMIN: 'Beheerder',
	MEMBER: 'Lid',
	GUEST: 'Gast',
	OWNER: 'Eigenaar',

	UPDATE_ROLE_DESCRIPTION: 'Pas de rol van dit lid aan',
	UPDATE_ROLE: 'Rol bijwerken',
	MEMBER_ROLE_UPDATED: 'Rol van lid succesvol bijgewerkt',

	SEND_INVITATION: 'Uitnodiging versturen',
	SEND_INVITATION_SUCCESS: 'Uitnodiging succesvol verstuurd',

	PENDING_INVITATIONS: 'Openstaande uitnodigingen',
	PENDING_INVITATIONS_DESCRIPTION: 'Beheer openstaande uitnodigingen voor je organisatie.',
	PENDING_USER_INVITATIONS_DESCRIPTION: 'Uitnodigingen die je hebt ontvangen van organisaties.',

	CANCEL_INVITATION: 'Uitnodiging annuleren',
	INVITATION_CANCELLED: 'Uitnodiging succesvol geannuleerd',

	ACCEPT_INVITATION: 'Uitnodiging accepteren',
	ACCEPT_INVITATION_DESCRIPTION: 'Je bent uitgenodigd om lid te worden van een organisatie.',
	INVITATION_ACCEPTED: 'Uitnodiging succesvol geaccepteerd',
	INVITATION_REJECTED: 'Uitnodiging succesvol geweigerd',

	ACCEPT: 'Accepteren',
	REJECT: 'Weigeren',

	INVITATION_EXPIRED: 'Deze uitnodiging is verlopen',

	DELETE_ORGANIZATION: 'Organisatie verwijderen',
	DELETE_ORGANIZATION_DESCRIPTION:
		'Verwijder je organisatie en alle bijbehorende gegevens permanent. Deze actie kan niet ongedaan worden gemaakt — wees voorzichtig.',
	DELETE_ORGANIZATION_SUCCESS: 'Organisatie succesvol verwijderd',
	DELETE_ORGANIZATION_INSTRUCTIONS: 'Vul de slug van de organisatie in om door te gaan:',

	SLUG_REQUIRED: 'Organisatieslug is verplicht',
	SLUG_DOES_NOT_MATCH: 'De slug komt niet overeen',

	UNKNOWN: 'Onbekend',

	// Error codes
	USER_NOT_FOUND: 'Gebruiker niet gevonden',
	FAILED_TO_CREATE_USER: 'Aanmaken van gebruiker mislukt',
	FAILED_TO_CREATE_SESSION: 'Aanmaken van sessie mislukt',
	FAILED_TO_UPDATE_USER: 'Bijwerken van gebruiker mislukt',
	FAILED_TO_GET_SESSION: 'Ophalen van sessie mislukt',
	INVALID_PASSWORD: 'Ongeldig wachtwoord',
	INVALID_EMAIL: 'Ongeldig e-mailadres',
	INVALID_EMAIL_OR_PASSWORD: 'Ongeldig e-mailadres of wachtwoord',
	SOCIAL_ACCOUNT_ALREADY_LINKED: 'Sociaal account is al gekoppeld',
	PROVIDER_NOT_FOUND: 'Provider niet gevonden',
	INVALID_TOKEN: 'Ongeldig token',
	ID_TOKEN_NOT_SUPPORTED: 'id_token wordt niet ondersteund',
	FAILED_TO_GET_USER_INFO: 'Ophalen van gebruikersgegevens mislukt',
	USER_EMAIL_NOT_FOUND: 'E-mailadres van gebruiker niet gevonden',
	EMAIL_NOT_VERIFIED: 'E-mailadres niet geverifieerd',
	PASSWORD_TOO_SHORT: 'Wachtwoord is te kort',
	PASSWORD_TOO_LONG: 'Wachtwoord is te lang',
	USER_ALREADY_EXISTS: 'Gebruiker bestaat al',
	EMAIL_CAN_NOT_BE_UPDATED: 'E-mailadres kan niet worden bijgewerkt',
	CREDENTIAL_ACCOUNT_NOT_FOUND: 'Inlogaccount niet gevonden',
	SESSION_EXPIRED: 'Sessie verlopen. Verificeer je identiteit opnieuw.',
	FAILED_TO_UNLINK_LAST_ACCOUNT: 'Je kunt je laatste account niet ontkoppelen',
	ACCOUNT_NOT_FOUND: 'Account niet gevonden',
	USER_ALREADY_HAS_PASSWORD:
		'Gebruiker heeft al een wachtwoord. Geef dat op om het account te verwijderen.',
};
