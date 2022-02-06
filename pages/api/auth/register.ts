import type { NextApiRequest, NextApiResponse } from 'next'
import {
  // Registration
  generateRegistrationOptions,
  verifyRegistrationResponse,
  // Authentication
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationCredentialJSON,
  AuthenticationCredentialJSON,
  AuthenticatorDevice,
  PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/typescript-types';
import { PrismaClient } from '@prisma/client'
import { RP_NAME, RP_ID } from "../../../utils/constants"

const prisma = new PrismaClient();

// let expectedOrigin = `https://${RP_ID}`;
let expectedOrigin = `http://localhost:3000`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ verified: boolean }>
) {
  const body: RegistrationCredentialJSON = req.body;

  const email = "test@yopmail.com"
  // const user = {}
  // const user = inMemoryUserDeviceDB[loggedInUserId];

  const option = await prisma.authRequest.findFirst({
    orderBy: [
      {
        createdAt: 'desc'
      },
    ],
    where: {
      email
    }
  })
  console.log(option)

  // @ts-ignore
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
    console.error(_error);
    // @ts-ignore
    return res.status(400).json({ error: _error.message });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const newDeviceObj = {
      publicKey: credentialPublicKey.toString("base64"),
      credId: credentialID.toString("base64"),
      counter,
      transports: body.transports
    }

    const a = await prisma.user.create({
      data: {
        email,
        devices: {
          create: [
            newDeviceObj
          ]
        }
      }
    })
  }

  res.send({ verified });
}
