import type { NextApiRequest, NextApiResponse } from 'next';
import {
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  VerifyRegistrationResponseOpts,
  VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationCredentialJSON,
} from '@simplewebauthn/typescript-types';
import base64url from "base64url";
import {AuthRequest, PrismaClient } from '@prisma/client';
import {RP_ID, ORIGIN} from "../../../utils/constants";

const prisma = new PrismaClient();

let expectedOrigin = ORIGIN;

interface Request extends RegistrationCredentialJSON {
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
    return res.status(400).send("Thre is no pregenerated challege");
  }

  const expectedChallenge = option.challenge;

  let verification: VerifiedRegistrationResponse;
  try {
    const opts: VerifyRegistrationResponseOpts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: RP_ID,
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    // @ts-ignore
    return res.status(400).send(_error.message);
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const newDeviceObj = {
      publicKey: base64url(credentialPublicKey),
      credId: base64url(credentialID),
      counter,
      transports: body.transports
    };

    try {
      await prisma.user.create({
        data: {
          email,
          devices: {
            create: [
              newDeviceObj
            ]
          }
        }
      });
    } catch (e) {
      // @ts-ignore
      return res.status(500).send(e.message);
    }
  }

  res.send({ verified });
}
