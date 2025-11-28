CREATE TABLE "driver_location" (
	"id" text PRIMARY KEY NOT NULL,
	"driver_id" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"heading" double precision,
	"speed" double precision,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_location_driver_id_unique" UNIQUE("driver_id")
);
--> statement-breakpoint
CREATE TABLE "driver_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"vehicle_year" text NOT NULL,
	"vehicle_color" text NOT NULL,
	"license_plate" text NOT NULL,
	"license_image_url" text,
	"insurance_image_url" text,
	"vehicle_image_url" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"rating" double precision DEFAULT 5,
	"total_rides" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "feature_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ride" (
	"id" text PRIMARY KEY NOT NULL,
	"rider_id" text NOT NULL,
	"driver_id" text,
	"status" text DEFAULT 'requested' NOT NULL,
	"pickup_lat" double precision NOT NULL,
	"pickup_lng" double precision NOT NULL,
	"pickup_address" text NOT NULL,
	"dropoff_lat" double precision NOT NULL,
	"dropoff_lng" double precision NOT NULL,
	"dropoff_address" text NOT NULL,
	"estimated_price" double precision,
	"final_price" double precision,
	"currency" text DEFAULT 'USD',
	"estimated_distance_km" double precision,
	"estimated_duration_min" integer,
	"actual_distance_km" double precision,
	"actual_duration_min" integer,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"arrived_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"rider_rating" integer,
	"driver_rating" integer,
	"rider_feedback" text,
	"driver_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_feature_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"flag_id" text NOT NULL,
	"is_enabled" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"phone" text,
	"profile_image_url" text,
	"preferred_mode" text DEFAULT 'rider',
	"rating" double precision DEFAULT 5,
	"total_rides_as_rider" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "driver_location" ADD CONSTRAINT "driver_location_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_profile" ADD CONSTRAINT "driver_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride" ADD CONSTRAINT "ride_rider_id_user_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride" ADD CONSTRAINT "ride_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feature_flag" ADD CONSTRAINT "user_feature_flag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feature_flag" ADD CONSTRAINT "user_feature_flag_flag_id_feature_flag_id_fk" FOREIGN KEY ("flag_id") REFERENCES "public"."feature_flag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;