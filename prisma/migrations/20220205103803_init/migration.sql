-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challenge" TEXT NOT NULL,
    "rpId" TEXT NOT NULL,
    "rpName" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "AuthRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthRequest_challenge_key" ON "AuthRequest"("challenge");
