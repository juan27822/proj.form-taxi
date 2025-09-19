-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "people" INTEGER NOT NULL,
    "hasMinors" BOOLEAN DEFAULT false,
    "minorsAge" TEXT,
    "needsBabySeat" BOOLEAN DEFAULT false,
    "needsBooster" BOOLEAN DEFAULT false,
    "luggageType" TEXT,
    "arrival_date" TEXT NOT NULL,
    "arrival_time" TEXT NOT NULL,
    "arrival_flight_number" TEXT,
    "destination" TEXT NOT NULL,
    "return_date" TEXT,
    "return_time" TEXT,
    "return_flight_time" TEXT,
    "return_pickup_address" TEXT,
    "return_flight_number" TEXT,
    "additional_info" TEXT,
    "isModification" BOOLEAN DEFAULT false,
    "originalBookingId" TEXT,
    "lang" TEXT,
    "driverId" TEXT,
    CONSTRAINT "Booking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("additional_info", "arrival_date", "arrival_flight_number", "arrival_time", "destination", "email", "hasMinors", "id", "isModification", "lang", "luggageType", "minorsAge", "name", "needsBabySeat", "needsBooster", "originalBookingId", "people", "phone", "receivedAt", "return_date", "return_flight_number", "return_flight_time", "return_pickup_address", "return_time", "status") SELECT "additional_info", "arrival_date", "arrival_flight_number", "arrival_time", "destination", "email", "hasMinors", "id", "isModification", "lang", "luggageType", "minorsAge", "name", "needsBabySeat", "needsBooster", "originalBookingId", "people", "phone", "receivedAt", "return_date", "return_flight_number", "return_flight_time", "return_pickup_address", "return_time", "status" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
