-- CreateEnum
CREATE TYPE "Transport" AS ENUM ('ble', 'internal', 'nfc', 'usb');

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "publicKey" TEXT NOT NULL,
    "credId" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "transports" "Transport"[],
    "userId" INTEGER,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
