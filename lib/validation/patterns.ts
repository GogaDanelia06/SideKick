/** Shared by the auth forms and the server schemas, so both accept the same input. */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿა-ჰ' -]+$/;

export const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;

export const PASSWORD_NUMBER_OR_SYMBOL_PATTERN = /[0-9]|[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;
