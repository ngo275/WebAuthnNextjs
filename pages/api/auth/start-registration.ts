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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicKeyCredentialCreationOptionsJSON>
) {
  // const user = inMemoryUserDeviceDB[loggedInUserId];
  const body = req.body;
  console.log(body);

  // const {
  //   /**
  //    * The username can be a human-readable name, email, etc... as it is intended only for display.
  //    */
  //   username,
  //   devices,
  // } = user;

  const username = "test.com"
  const devices: object[] = []

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: "test",
    userName: username,
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

  // await db.save({
  //   key: db.key("options"),
  //   data: options,
  //   excludeFromIndexes: ["pubKeyCredParams", "timeout"],
  // });

  const newRequest = await prisma.authRequest.create({
    data: {
      challenge: options.challenge,
      // @ts-ignore
      rpId: RP_ID,
      rpName: RP_NAME,
      email: "test@yopmail.com"
    },
  })

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify an authenticator response.
   */
  // inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

  res.send(options);

  // return res.status(200).json({})

  // res.status(200).json({ name: 'John Doe' })
}
