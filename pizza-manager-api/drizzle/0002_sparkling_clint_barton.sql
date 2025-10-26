CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'delivering', 'delivered', 'canceled');--> statement-breakpoint
CREATE TABLE "tb_products" (
	"id" text PRIMARY KEY NOT NULL,
	"product_name" text NOT NULL,
	"product_description" text,
	"price_in_cents" integer NOT NULL,
	"restaurant_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"customer_id" text,
	"restaurant_id" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_order_in_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_orders_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"total_order_in_cents" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tb_products" ADD CONSTRAINT "tb_products_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_orders" ADD CONSTRAINT "tb_orders_customer_id_tb_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."tb_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_orders" ADD CONSTRAINT "tb_orders_restaurant_id_tb_users_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."tb_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_orders_items" ADD CONSTRAINT "tb_orders_items_order_id_tb_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."tb_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_orders_items" ADD CONSTRAINT "tb_orders_items_product_id_tb_users_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."tb_users"("id") ON DELETE set null ON UPDATE no action;