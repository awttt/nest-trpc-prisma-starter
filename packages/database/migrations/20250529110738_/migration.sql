-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "path" VARCHAR(100),
    "icon" VARCHAR(50),
    "component" VARCHAR(100),
    "sort" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "path_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "path_names" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parentId" TEXT,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Menu_path_ids_idx" ON "Menu"("path_ids");

-- CreateIndex
CREATE INDEX "Menu_level_idx" ON "Menu"("level");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
