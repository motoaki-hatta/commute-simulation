-- CreateTable
CREATE TABLE "time_slot_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionId" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "dayType" TEXT NOT NULL,
    "crowdLevel" INTEGER NOT NULL,
    "frequency" INTEGER NOT NULL,
    "averageDelay" INTEGER NOT NULL,
    "reliabilityScore" REAL NOT NULL,
    "comfortScore" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "time_slot_data_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "station_connections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "time_slot_data_connectionId_timeSlot_dayType_key" ON "time_slot_data"("connectionId", "timeSlot", "dayType");
