import crypto from "crypto"

export function generateIOtp() {
  const otp = crypto.randomInt(100000, 999999).toString()
  return otp
}

export function getOtpExpiry() {
  const mintues = parseInt("10");
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + mintues)

  return expiry
}

export function isOtpExpired(expiresAt: Date) {
  return new Date() > expiresAt
}