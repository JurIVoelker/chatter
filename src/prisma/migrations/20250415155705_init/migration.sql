-- CreateTable
CREATE TABLE "userHasCurrentData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hasCurrentData" BOOLEAN NOT NULL,
    "user" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "userHasCurrentData_user_key" ON "userHasCurrentData"("user");
