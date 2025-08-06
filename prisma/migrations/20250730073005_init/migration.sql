-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "lineColor" TEXT,
    "frequencyWeekday" INTEGER NOT NULL,
    "frequencyWeekend" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "station_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stationId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "station_lines_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "station_lines_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "lines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "school_stations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "walkingTime" INTEGER NOT NULL,
    "distance" REAL NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "school_stations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "school_stations_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "station_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "departureId" TEXT NOT NULL,
    "arrivalId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "travelTime" INTEGER NOT NULL,
    "distance" REAL NOT NULL,
    "fare" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "station_connections_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "stations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "station_connections_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "stations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "station_connections_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "lines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "station_lines_stationId_lineId_key" ON "station_lines"("stationId", "lineId");

-- CreateIndex
CREATE UNIQUE INDEX "school_stations_schoolId_stationId_key" ON "school_stations"("schoolId", "stationId");

-- CreateIndex
CREATE UNIQUE INDEX "station_connections_departureId_arrivalId_lineId_key" ON "station_connections"("departureId", "arrivalId", "lineId");
