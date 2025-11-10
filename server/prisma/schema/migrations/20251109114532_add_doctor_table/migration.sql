-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "crm" TEXT,
    "percProfessional" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "appointmentFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

