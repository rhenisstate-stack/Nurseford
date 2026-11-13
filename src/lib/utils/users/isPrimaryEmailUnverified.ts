type EmailLike = { isPrimary?: boolean | null; isVerified?: boolean | null };

type UserLike = {
  emailConfirmed?: boolean | null;
  emails?: EmailLike[] | null;
} | null | undefined;

export function isPrimaryEmailUnverified(user: UserLike): boolean {
  if (!user) return false;                       // not logged in -> nothing to verify
  if (user.emailConfirmed === true) return false; // explicit confirmation wins

  const emails = user.emails ?? [];
  const primary = emails.find((e) => e.isPrimary) ?? emails[0];
  if (!primary) return false;                    // no data -> never block

  return primary.isVerified === false;           // only block on a definite "false"
}