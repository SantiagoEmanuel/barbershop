CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`barber_id` text NOT NULL,
	`service_id` text NOT NULL,
	`client_id` text,
	`client_name` text NOT NULL,
	`client_phone` text NOT NULL,
	`client_email` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`price_snapshot` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`cancelled_at` integer,
	FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_appointments_barber_date` ON `appointments` (`barber_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_appointments_barber_date_time` ON `appointments` (`barber_id`,`date`,`start_time`,`end_time`);--> statement-breakpoint
CREATE INDEX `idx_appointments_client_id` ON `appointments` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_appointments_status` ON `appointments` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_appointments_barber_date_start` ON `appointments` (`barber_id`,`date`,`start_time`) WHERE status IN ('pending', 'confirmed');--> statement-breakpoint
CREATE TABLE `barber_schedule_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`barber_id` text NOT NULL,
	`date` text NOT NULL,
	`is_day_off` integer DEFAULT false NOT NULL,
	`custom_start_time` text,
	`custom_end_time` text,
	FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_overrides_barber_date` ON `barber_schedule_overrides` (`barber_id`,`date`);--> statement-breakpoint
CREATE TABLE `barber_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`barber_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`start_brake` text NOT NULL,
	`end_brake` text NOT NULL,
	`appointment_mode` text DEFAULT 'appointment' NOT NULL,
	`slot_duration_minutes` integer DEFAULT 30 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_barber_schedules_barber_id` ON `barber_schedules` (`barber_id`);--> statement-breakpoint
CREATE INDEX `idx_barber_schedules_barber_day` ON `barber_schedules` (`barber_id`,`day_of_week`);--> statement-breakpoint
CREATE TABLE `barbers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`experience_years` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `barbers_slug_unique` ON `barbers` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_barbers_is_active` ON `barbers` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_barbers_slug` ON `barbers` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_barbers_user_id` ON `barbers` (`user_id`);--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expense_categories_name_unique` ON `expense_categories` (`name`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`incurred_at` integer NOT NULL,
	`payment_method_id` text,
	`purchase_id` text,
	`recurring_expense_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recurring_expense_id`) REFERENCES `recurring_expenses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_expenses_category_id` ON `expenses` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_expenses_incurred_at` ON `expenses` (`incurred_at`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`appointment_id` text,
	`overbooked_appointment_id` text,
	`payment_method_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`paid_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`overbooked_appointment_id`) REFERENCES `overbooked_appointment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "orders_at_most_one_appointment" CHECK(NOT (appointment_id IS NOT NULL AND overbooked_appointment_id IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_appointment_id_unique` ON `orders` (`appointment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_overbooked_appointment_id_unique` ON `orders` (`overbooked_appointment_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_orders_appointment` ON `orders` (`appointment_id`) WHERE appointment_id IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_orders_overbooked_appointment` ON `orders` (`overbooked_appointment_id`) WHERE overbooked_appointment_id IS NOT NULL;--> statement-breakpoint
CREATE TABLE `overbooked_appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`barber_id` text NOT NULL,
	`service_id` text NOT NULL,
	`client_name` text NOT NULL,
	`client_phone` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`cancelled_at` integer,
	`price_snapshot` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_overbooked_barber_date` ON `overbooked_appointment` (`barber_id`,`date`);--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_sales` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`order_id` text,
	`sold_by` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_snapshot` integer NOT NULL,
	`cost_snapshot` integer DEFAULT 0 NOT NULL,
	`sold_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sold_by`) REFERENCES `barbers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_product_sales_product_id` ON `product_sales` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_sales_order_id` ON `product_sales` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_product_sales_sold_by` ON `product_sales` (`sold_by`);--> statement-breakpoint
CREATE INDEX `idx_product_sales_sold_at` ON `product_sales` (`sold_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` integer NOT NULL,
	`cost` integer DEFAULT 0 NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_products_is_active` ON `products` (`is_active`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`product_id` text,
	`supply_id` text,
	`quantity` integer NOT NULL,
	`unit_cost` integer NOT NULL,
	`total_cost` integer NOT NULL,
	`supplier` text,
	`purchased_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supply_id`) REFERENCES `supplies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_purchases_product_id` ON `purchases` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_purchases_supply_id` ON `purchases` (`supply_id`);--> statement-breakpoint
CREATE INDEX `idx_purchases_purchased_at` ON `purchases` (`purchased_at`);--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`day_of_month` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_recurring_expenses_is_active` ON `recurring_expenses` (`is_active`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` integer NOT NULL,
	`duration_minutes` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`key` integer,
	`icon` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_name_unique` ON `services` (`name`);--> statement-breakpoint
CREATE INDEX `idx_services_is_active` ON `services` (`is_active`);--> statement-breakpoint
CREATE TABLE `supplies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`unit` text DEFAULT 'unidad' NOT NULL,
	`cost` integer DEFAULT 0 NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`low_stock_threshold` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_supplies_is_active` ON `supplies` (`is_active`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'client' NOT NULL,
	`phone` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`verify` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);