-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "imageType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_filename_key" ON "Image"("filename");

-- CreateIndex
CREATE INDEX "Image_clubId_idx" ON "Image"("clubId");

-- CreateIndex
CREATE INDEX "Image_isPrimary_idx" ON "Image"("isPrimary");

-- CreateIndex
CREATE INDEX "Image_clubId_displayOrder_idx" ON "Image"("clubId", "displayOrder");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
