CREATE TABLE "AppointmentReviews" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "attendantId" TEXT NOT NULL,
    "rating" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppointmentReviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppointmentReviews_appointmentId_key" ON "AppointmentReviews"("appointmentId");
CREATE INDEX "AppointmentReviews_clientId_reviewedAt_dismissedAt_idx" ON "AppointmentReviews"("clientId", "reviewedAt", "dismissedAt");

ALTER TABLE "AppointmentReviews" ADD CONSTRAINT "AppointmentReviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentReviews" ADD CONSTRAINT "AppointmentReviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentReviews" ADD CONSTRAINT "AppointmentReviews_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
