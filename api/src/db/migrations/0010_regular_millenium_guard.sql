CREATE TYPE "public"."community_entity_type" AS ENUM('need', 'wealth', 'poll', 'forum_thread', 'forum_post', 'council', 'trust_award');--> statement-breakpoint
CREATE TYPE "public"."community_event_type" AS ENUM('need_created', 'need_updated', 'need_fulfilled', 'need_deleted', 'wealth_created', 'wealth_updated', 'wealth_fulfilled', 'wealth_deleted', 'poll_created', 'poll_completed', 'poll_deleted', 'forum_thread_created', 'forum_post_created', 'forum_thread_deleted', 'forum_post_deleted', 'council_created', 'council_updated', 'council_deleted', 'trust_awarded', 'trust_removed');--> statement-breakpoint
CREATE TABLE "community_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"event_type" "community_event_type" NOT NULL,
	"entity_type" "community_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_events" ADD CONSTRAINT "community_events_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_events" ADD CONSTRAINT "community_events_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;
