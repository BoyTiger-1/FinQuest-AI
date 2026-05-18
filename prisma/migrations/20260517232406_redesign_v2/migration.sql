-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cash" REAL NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "expenses" REAL NOT NULL DEFAULT 0,
    "employees" INTEGER NOT NULL DEFAULT 0,
    "productPrice" REAL NOT NULL DEFAULT 0,
    "unitsSold" INTEGER NOT NULL DEFAULT 0,
    "marketingBudget" REAL NOT NULL DEFAULT 0,
    "rdBudget" REAL NOT NULL DEFAULT 0,
    "period" INTEGER NOT NULL DEFAULT 1,
    "history" TEXT NOT NULL DEFAULT '[]',
    "setupComplete" BOOLEAN NOT NULL DEFAULT false,
    "businessName" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BusinessState" ("cash", "employees", "expenses", "history", "id", "marketingBudget", "period", "productPrice", "rdBudget", "revenue", "unitsSold", "updatedAt", "userId") SELECT "cash", "employees", "expenses", "history", "id", "marketingBudget", "period", "productPrice", "rdBudget", "revenue", "unitsSold", "updatedAt", "userId" FROM "BusinessState";
DROP TABLE "BusinessState";
ALTER TABLE "new_BusinessState" RENAME TO "BusinessState";
CREATE UNIQUE INDEX "BusinessState_userId_key" ON "BusinessState"("userId");
CREATE TABLE "new_PersonalFinanceState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cash" REAL NOT NULL DEFAULT 0,
    "income" REAL NOT NULL DEFAULT 0,
    "rent" REAL NOT NULL DEFAULT 0,
    "food" REAL NOT NULL DEFAULT 0,
    "transport" REAL NOT NULL DEFAULT 0,
    "utilities" REAL NOT NULL DEFAULT 0,
    "insurance" REAL NOT NULL DEFAULT 0,
    "other" REAL NOT NULL DEFAULT 0,
    "savings" REAL NOT NULL DEFAULT 0,
    "investments" REAL NOT NULL DEFAULT 0,
    "debt" REAL NOT NULL DEFAULT 0,
    "creditScore" INTEGER NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL DEFAULT 1,
    "history" TEXT NOT NULL DEFAULT '[]',
    "setupComplete" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalFinanceState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonalFinanceState" ("cash", "creditScore", "debt", "food", "history", "id", "income", "investments", "month", "rent", "savings", "transport", "updatedAt", "userId", "utilities") SELECT "cash", "creditScore", "debt", "food", "history", "id", "income", "investments", "month", "rent", "savings", "transport", "updatedAt", "userId", "utilities" FROM "PersonalFinanceState";
DROP TABLE "PersonalFinanceState";
ALTER TABLE "new_PersonalFinanceState" RENAME TO "PersonalFinanceState";
CREATE UNIQUE INDEX "PersonalFinanceState_userId_key" ON "PersonalFinanceState"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActive" DATETIME,
    "virtualCash" REAL NOT NULL DEFAULT 10000,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "goals" TEXT NOT NULL DEFAULT '[]',
    "experience" TEXT NOT NULL DEFAULT 'beginner',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "lastActive", "level", "name", "password", "streak", "virtualCash", "xp") SELECT "createdAt", "email", "id", "lastActive", "level", "name", "password", "streak", "virtualCash", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
