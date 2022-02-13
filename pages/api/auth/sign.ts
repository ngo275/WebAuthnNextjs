import type { NextApiRequest, NextApiResponse } from 'next';
import base64url from 'base64url';
import {
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  VerifyAuthenticationResponseOpts,
  VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationCredentialJSON,
} from '@simplewebauthn/typescript-types';
import {AuthRequest, Device, PrismaClient, User} from '@prisma/client';
import {RP_ID, ORIGIN} from "../../../utils/constants";
import {VerifiedAuthenticationResponse} from "@simplewebauthn/server/dist/authentication/verifyAuthenticationResponse";

const prisma = new PrismaClient();

let expectedOrigin = ORIGIN;

interface Request extends AuthenticationCredentialJSON {
  email: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ verified: boolean }>
) {
  const body: Request = req.body;
  const email = body.email;

  if (!email) {
    // @ts-ignore
    return res.status(400).send("Request body is not valid");
  }

  const option: AuthRequest | null = await prisma.authRequest.findFirst({
    orderBy: [
      {
        createdAt: 'desc'
      },
    ],
    where: {
      email
    }
  });

  if (!option) {
    // @ts-ignore
    return res.status(400).send("There is no pregenerated challenge");
  }

  const expectedChallenge = option.challenge;

  const user: (User & { devices: Device[] }) | null = await prisma.user.findFirst({
    include: {
      devices: true
    },
    orderBy: [
      {
        createdAt: 'desc'
      },
    ],
    where: {
      email
    }
  });

  if (!user) {
    // @ts-ignore
    return res.status(400).send("This email is not used");
    // return res.status(400).send({ error: "This email is not used" })
  }

  let dbAuthenticator: Device | undefined;
  // const bodyCredIDBuffer = base64url.toBuffer(body.rawId);
  const credId = body.rawId;
  for (const dev of user.devices) {
    if (dev.credId === credId) {
      dbAuthenticator = dev;
      break;
    }
  }

  if (!dbAuthenticator) {
    // @ts-ignore
    return res.status(400).send("Device is not registered");
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    const opts: VerifyAuthenticationResponseOpts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: RP_ID,
      authenticator: {
        credentialPublicKey: base64url.toBuffer(dbAuthenticator.publicKey),
        credentialID: base64url.toBuffer(dbAuthenticator.credId),
        counter: dbAuthenticator.counter,
        transports: dbAuthenticator.transports
      }
    };
    verification = await verifyAuthenticationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    // @ts-ignore
    return res.status(400).send(_error.message);
  }

  const { verified, authenticationInfo } = verification;

  if (verified && authenticationInfo) {
    try {
      await prisma.device.update({
        where: {
          id: dbAuthenticator.id,
        },
        data: {
          ...dbAuthenticator,
          counter: authenticationInfo.newCounter
        }
      });
    } catch (e) {
      // @ts-ignore
      return res.status(500).send(e.message);
    }
  }

  res.send({ verified });
}
