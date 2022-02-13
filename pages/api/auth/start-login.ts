import type { NextApiRequest, NextApiResponse } from 'next';
import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server';
import type {
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/typescript-types';
import { PrismaClient, Prisma, User, Device } from '@prisma/client';
import { RP_NAME, RP_ID } from "../../../utils/constants";
import {Buffer} from "buffer";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicKeyCredentialRequestOptionsJSON>
) {
  const q = req.query;
  const email: string = q.email as string;
  if (!email) {
    // @ts-ignore
    return res.status(400).send("Email is empty");
  }

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

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user.devices.map(dev => ({
      id: Buffer.from(dev.credId, "base64"),
      type: 'public-key',
      transports: dev.transports ?? ['usb', 'ble', 'nfc', 'internal'],
    })),
    /**
     * This optional value controls whether or not the authenticator needs be able to uniquely
     * identify the user interacting with it (via built-in PIN pad, fingerprint scanner, etc...)
     */
    userVerification: 'preferred',
    rpID: RP_ID,
  };

  const options = generateAuthenticationOptions(opts);

  try {
    const newRequest = await prisma.authRequest.create({
      data: {
        challenge: options.challenge,
        rpId: RP_ID,
        rpName: RP_NAME,
        email
      },
    });
  } catch (e) {
    // @ts-ignore
    res.status(500).send("Writing database failed");
  }

  res.send(options);
}
