CREATE TABLE "tb_auth_links" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tb_auth_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "tb_auth_links" ADD CONSTRAINT "tb_auth_links_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tb_users"("id") ON DELETE no action ON UPDATE no action;