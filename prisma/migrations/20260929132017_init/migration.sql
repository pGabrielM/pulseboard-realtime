-- CreateEnum
CREATE TYPE "MonitorStatus" AS ENUM ('PENDING', 'UP', 'DOWN', 'PAUSED');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'HEAD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitors" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" "HttpMethod" NOT NULL DEFAULT 'GET',
    "expected_status" INTEGER NOT NULL DEFAULT 200,
    "keyword" TEXT,
    "interval_seconds" INTEGER NOT NULL DEFAULT 300,
    "timeout_ms" INTEGER NOT NULL DEFAULT 10000,
    "status" "MonitorStatus" NOT NULL DEFAULT 'PENDING',
    "last_checked_at" TIMESTAMP(3),
    "last_latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checks" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ok" BOOLEAN NOT NULL,
    "status_code" INTEGER,
    "latency_ms" INTEGER,
    "error" TEXT,

    CONSTRAINT "checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "cause" TEXT NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_pages" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MonitorToStatusPage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MonitorToStatusPage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "monitors_owner_id_idx" ON "monitors"("owner_id");

-- CreateIndex
CREATE INDEX "monitors_status_last_checked_at_idx" ON "monitors"("status", "last_checked_at");

-- CreateIndex
CREATE INDEX "checks_monitor_id_checked_at_idx" ON "checks"("monitor_id", "checked_at");

-- CreateIndex
CREATE INDEX "incidents_monitor_id_started_at_idx" ON "incidents"("monitor_id", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "status_pages_slug_key" ON "status_pages"("slug");

-- CreateIndex
CREATE INDEX "status_pages_owner_id_idx" ON "status_pages"("owner_id");

-- CreateIndex
CREATE INDEX "_MonitorToStatusPage_B_index" ON "_MonitorToStatusPage"("B");

-- AddForeignKey
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_pages" ADD CONSTRAINT "status_pages_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MonitorToStatusPage" ADD CONSTRAINT "_MonitorToStatusPage_A_fkey" FOREIGN KEY ("A") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MonitorToStatusPage" ADD CONSTRAINT "_MonitorToStatusPage_B_fkey" FOREIGN KEY ("B") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
