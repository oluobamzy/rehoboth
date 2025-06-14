-- CreateTable
CREATE TABLE IF NOT EXISTS "carousel_slides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "description" TEXT,
    "image_url" VARCHAR(500) NOT NULL,
    "cta_text" VARCHAR(100),
    "cta_link" VARCHAR(500),
    "display_order" INTEGER NOT NULL,
    "start_date" TIMESTAMP,
    "end_date" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "carousel_slides_pkey" PRIMARY KEY ("id")
);
