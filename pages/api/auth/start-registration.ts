import type { NextApiRequest, NextApiResponse } from 'next'
import {
  generateRegistrationOptions,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import type {
  PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/typescript-types';
import { PrismaClient } from '@prisma/client'
import { RP_NAME, RP_ID } from "../../../utils/constants"

const prisma = new PrismaClient();

// let expectedOrigin = `https://${RP_ID}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicKeyCredentialCreationOptionsJSON>
) {
  const q = req.query;
  const email: string = q.email as string
  if (!email) {
    // @ts-ignore
    return res.status(400).send("Email is empty")
  }

  const devices: object[] = []

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: email,
    userName: email,
    timeout: 60000,
    attestationType: 'indirect',
    /**
     * Passing in a user's list of already-registered authenticator IDs here prevents users from
     * registering the same device multiple times. The authenticator will simply throw an error in
     * the browser if it's asked to perform registration when one of these ID's already resides
     * on it.
     */
    excludeCredentials: devices.map(dev => ({
      // @ts-ignore
      id: dev.credentialID,
      type: 'public-key',
      // @ts-ignore
      transports: dev.transports,
    })),
    /**
     * The optional authenticatorSelection property allows for specifying more constraints around
     * the types of authenticators that users to can use for registration
     */
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      // requireResidentKey: true,
      userVerification: 'required',
      // requireResidentKey: false,
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -8, -257],
  };

  const options = generateRegistrationOptions(opts);

  try {
    const newRequest = await prisma.authRequest.create({
      data: {
        challenge: options.challenge,
        // @ts-ignore
        rpId: RP_ID,
        rpName: RP_NAME,
        email
      },
    })
  } catch (e) {
    // @ts-ignore
    res.status(500).send("Writing database failed")
  }

  res.send(options);
}
