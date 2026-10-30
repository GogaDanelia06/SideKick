import { prisma } from "@/lib/db";
import { createResetToken } from "@/lib/auth/passwordReset";
import { googleSignInEnabled } from "@/lib/auth/providers";
import { log } from "@/lib/logger";
import { sendMail } from "@/lib/mail/send";
import { teamInviteEmail } from "@/lib/mail/teamInvite";
import { absoluteUrl } from "@/lib/seo/site";

const INVITE_TTL_MINUTES = 7 * 24 * 60;

export async function sendTeamInvite(userId: string, businessId: string, inviterId: string): Promise<boolean> {
  const [user, business, inviter] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, passwordHash: true, _count: { select: { accounts: true } } },
    }),
    prisma.business.findUnique({ where: { id: businessId }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: inviterId }, select: { name: true, email: true } }),
  ]);
  if (!user || !business) return false;

  const setPassword = !user.passwordHash && user._count.accounts === 0;
  const issued = setPassword ? await createResetToken(user.email, INVITE_TTL_MINUTES) : null;
  if (setPassword && !issued) return false;

  const { sent } = await sendMail(
    teamInviteEmail({
      to: user.email,
      name: user.name,
      business: business.name,
      inviter: inviter?.name || inviter?.email || "Sidekick",
      link: absoluteUrl(issued ? `/reset?token=${issued.token}` : "/login"),
      setPassword,
      google: googleSignInEnabled(),
    }),
  );

  if (!sent) log.error("team invitation email could not be sent", undefined, { businessId, userId });
  return sent;
}
