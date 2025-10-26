CREATE TYPE "public"."user_role" AS ENUM('manager', 'customer');--> statement-breakpoint
CREATE TABLE "tb_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_users_email_unique" UNIQUE("email"),
	CONSTRAINT "tb_users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"manager_id" text,
	CONSTRAINT "restaurants_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_manager_id_tb_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."tb_users"("id") ON DELETE set null ON UPDATE no action;