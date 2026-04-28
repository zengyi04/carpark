-- CreateTable
CREATE TABLE "Users" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Carpark" (
    "carParkNo" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "xCoord" REAL NOT NULL,
    "yCoord" REAL NOT NULL,
    "carParkType" TEXT NOT NULL,
    "typeOfParkingSystem" TEXT NOT NULL,
    "shortTermParking" TEXT NOT NULL,
    "freeParking" TEXT NOT NULL,
    "nightParking" TEXT NOT NULL,
    "carParkDecks" INTEGER NOT NULL,
    "gantryHeight" REAL NOT NULL,
    "carParkBasement" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User_Favourite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "carParkNo" TEXT NOT NULL,
    CONSTRAINT "User_Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("userId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_Favourite_carParkNo_fkey" FOREIGN KEY ("carParkNo") REFERENCES "Carpark" ("carParkNo") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Favourite_userId_carParkNo_key" ON "User_Favourite"("userId", "carParkNo");
