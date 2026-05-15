-- CreateTable
CREATE TABLE "chat_logs" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "customer_phone" TEXT,
    "user_message" TEXT NOT NULL,
    "bot_response" TEXT NOT NULL,
    "extracted_keyword" TEXT,
    "requires_attention" BOOLEAN NOT NULL DEFAULT false,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_logs_client_id_created_at_idx" ON "chat_logs"("client_id", "created_at");
