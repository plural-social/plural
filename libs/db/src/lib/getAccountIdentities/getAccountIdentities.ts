import { IdentitySummary } from "@plural/schema";
import { Account, DisplayName, Identity, IdentityGrant, PrismaClient } from "@prisma/client";

export function summarizeIdentity(identity: Identity & { display: DisplayName }): IdentitySummary;
export function summarizeIdentity(
  identity: Identity,
  display: DisplayName,
): IdentitySummary;
export function summarizeIdentity(
  identity: Identity | (Identity & { display: DisplayName }),
  display?: DisplayName,
): IdentitySummary {
  if("display" in identity) {
    display = identity.display;
  }

  return {
    id: identity.id,
    displayId: identity.displayId,

    display: {
      name: display?.name,
      displayName: display?.displayName,
    },
  };
}

export async function getAccountIdentities(
  account: string | Account,
  prisma: PrismaClient = new PrismaClient(),
): Promise<IdentitySummary[]> {
  const accountId = typeof account === "string" ? account : account.id;

  const grants = await prisma.identityGrant.findMany({
    where: {
      accountId,
    },
    include: {
      identity: {
        include: {
          display: true,
        },
      },
    },
  });

  const identities = grants.map(grant => summarizeIdentity(grant.identity));

  return identities;
}
