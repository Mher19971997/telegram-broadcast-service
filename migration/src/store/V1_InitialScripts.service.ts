import { Injectable, Logger } from '@nestjs/common';
import { Transaction as CommonTransaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { InjectConnection } from '@nestjs/sequelize';
import { CommonStore } from './CommonStore';

@Injectable()
export class V1_InitialScripts extends CommonStore {
    private readonly logger = new Logger(V1_InitialScripts.name);

    constructor(@InjectConnection() private connection: Sequelize) {
        super();
    }

    async up(): Promise<void> {
        const transaction = await this.connection.transaction({
            autocommit: false,
            type: CommonTransaction.TYPES.IMMEDIATE,
            isolationLevel: CommonTransaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
        });
        try {
            await this.connection.query(
                `
    SET statement_timeout = 0;
    SET lock_timeout = 0;
    SET idle_in_transaction_session_timeout = 0;
    SET client_encoding = 'UTF8';
    SET standard_conforming_strings = on;
    SELECT pg_catalog.set_config('search_path', '', false);
    SET check_function_bodies = false;
    SET xmloption = content;
    SET client_min_messages = warning;
    SET row_security = off;


    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

    CREATE OR REPLACE PROCEDURE "public".create_foreign_key_if_not_exists(IN s_name text, IN t_1_name text, IN t_2_name text, IN k_name text)
        LANGUAGE plpgsql
        AS $$
    DECLARE
        b_name_l1 varchar := replace(k_name, ',', '_');
        b_name_l2 varchar := replace(b_name_l1, '"', '');
        b_name    varchar := replace(b_name_l2, ' ', '');
        cmd text := 'alter table "' || s_name || '"."' || t_1_name || '" add constraint "' || t_1_name || '_' || b_name || '_fk"' || ' foreign key ("' || k_name || '") references "' || s_name || '"."' || t_2_name || '" on delete cascade;';
    begin
        RAISE INFO '%', cmd;
        if not exists(select constraint_name from information_schema.constraint_column_usage where table_name = t_2_name and constraint_name = (t_1_name || '_' || b_name || '_fk')) then
            execute cmd;
        end if;
    end ;
    $$;

    CREATE OR REPLACE PROCEDURE "public".create_index_key(IN s_name text, IN t_name text, IN k_name text)
        LANGUAGE plpgsql
        AS $$
    DECLARE
        b_name_l1 varchar := replace(k_name, ',', '_');
        b_name_l2   varchar := replace(b_name_l1, '"', '');
        b_name   varchar := replace(b_name_l2, ' ', '');
        cmd text := 'create index if not exists "' || t_name || '_' || b_name || '_index" on "' || s_name || '"."' || t_name || '" (' || k_name || ')';
    begin
        RAISE INFO '%', cmd;
        execute cmd;
    end
    $$;

    CREATE OR REPLACE PROCEDURE "public".create_primary_key_if_not_exists(IN s_name text, IN t_name text, IN k_name text)
        LANGUAGE plpgsql
        AS $$
    DECLARE
        b_name_l1 varchar := replace(k_name, ',', '_');
        b_name_l2 varchar := replace(b_name_l1, '"', '');
        b_name    varchar := replace(b_name_l2, ' ', '');
        cmd text := 'alter table "' || s_name || '"."' || t_name || '" add constraint "' || t_name || '_' || b_name || '_pk"' || ' primary key (' || k_name || ');';
    begin
        RAISE INFO '%', cmd;
        if not exists(select constraint_name
                    from information_schema.constraint_column_usage
                    where table_name = t_name
                        and constraint_name = (t_name || '_' || b_name || '_pk')) then
            execute cmd;
        end if;
    end ;
    $$;

    CREATE OR REPLACE PROCEDURE "public".create_unique_index_key(IN s_name text, IN t_name text, IN k_name text)
        LANGUAGE plpgsql
        AS $$
    DECLARE
        b_name_l1 varchar := replace(k_name, ',', '_');
        b_name_l2   varchar := replace(b_name_l1, '"', '');
        b_name   varchar := replace(b_name_l2, ' ', '');
        cmd text := 'create unique index if not exists "' || t_name || '_' || b_name || '_uindex" on "'  || s_name || '"."' || t_name || '" (' || k_name || ')';
    begin
        RAISE INFO '%', cmd;
        execute cmd;
    end
    $$;

    CREATE OR REPLACE PROCEDURE "public".create_unique_key_if_not_exists(IN s_name text, IN t_name text, IN k_name text)
        LANGUAGE plpgsql
        AS $$
    DECLARE
        b_name_l1 varchar := replace(k_name, ',', '_');
        b_name_l2 varchar := replace(b_name_l1, '"', '');
        b_name    varchar := replace(b_name_l2, ' ', '');
        cmd text := 'alter table "' || s_name || '"."' || t_name || '" add constraint "' || t_name || '_' || b_name || '_uk"' || ' unique (' || k_name || ');';
    begin
        RAISE INFO '%', cmd;
        if not exists(select constraint_name
                    from information_schema.constraint_column_usage
                    where table_name = t_name
                        and constraint_name = t_name || '_' || k_name || '_uk') then
            execute cmd;
        end if;
    end ;
    $$;

    CREATE FUNCTION "public".random_between(low integer, high integer) RETURNS integer
        LANGUAGE plpgsql STRICT
        AS $$
        BEGIN
        RETURN floor(random()* (high-low + 1) + low);
        END;
        $$;


    SET default_tablespace = '';

    SET default_table_access_method = heap;

    CREATE TABLE  "public"."telegram_subscribers" (
        "uuid" uuid DEFAULT "public".uuid_generate_v4() NOT NULL,
        "telegramId" text NOT NULL UNIQUE,
        "username" text,
        "firstName" text,
        "lastName" text,
        "isActive" boolean DEFAULT true,
        "isBlocked" boolean DEFAULT false,
        "tags" jsonb DEFAULT '[]'::jsonb,
        "language" text,
        "phone" text,
        "email" text,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "deletedAt" timestamp without time zone
    );

    ALTER TABLE ONLY "public"."telegram_subscribers"
        ADD CONSTRAINT "telegram_subscribers_pk" PRIMARY KEY ("uuid");
      
    CREATE TABLE  "public"."broadcast_messages" (
        "uuid" uuid DEFAULT "public".uuid_generate_v4() NOT NULL,
        "title" text NOT NULL,
        "content" text NOT NULL,
        "type" text DEFAULT 'text',
        "media" jsonb,
        "keyboard" jsonb,
        "targetTags" jsonb DEFAULT '[]'::jsonb,
        "isScheduled" boolean DEFAULT false,
        "scheduledAt" timestamp without time zone,
        "authorId" text,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "deletedAt" timestamp without time zone
    );

    ALTER TABLE ONLY "public"."broadcast_messages"
        ADD CONSTRAINT "broadcast_messages_pk" PRIMARY KEY ("uuid");

    CREATE TABLE  "public"."broadcast_jobs" (
        "uuid" uuid DEFAULT "public".uuid_generate_v4() NOT NULL,
        "messageUuid" uuid NOT NULL,
        "status" text DEFAULT 'pending',
        "totalUsers" integer DEFAULT 0,
        "sentCount" integer DEFAULT 0,
        "failedCount" integer DEFAULT 0,
        "blockedCount" integer DEFAULT 0,
        "errors" jsonb DEFAULT '[]'::jsonb,
        "progressPercent" integer DEFAULT 0,
        "startedAt" timestamp without time zone,
        "completedAt" timestamp without time zone,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "deletedAt" timestamp without time zone
    );
    
    ALTER TABLE ONLY "public"."broadcast_jobs"
      ADD CONSTRAINT "broadcast_jobs_pk" PRIMARY KEY ("uuid");
  
    ALTER TABLE ONLY "public"."broadcast_jobs"
        ADD CONSTRAINT "broadcast_jobs_messageUuid" FOREIGN KEY ("messageUuid") REFERENCES "public"."broadcast_messages" ("uuid") ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS "idx_telegram_subscribers_telegram_id" ON "public"."telegram_subscribers"("telegramId");
    CREATE INDEX IF NOT EXISTS "idx_telegram_subscribers_active" ON "public"."telegram_subscribers"("isActive");
    CREATE INDEX IF NOT EXISTS "idx_telegram_subscribers_tags" ON "public"."telegram_subscribers" USING gin ("tags");
    CREATE INDEX IF NOT EXISTS "idx_broadcast_jobs_status" ON "public"."broadcast_jobs"("status");
    CREATE INDEX IF NOT EXISTS "idx_broadcast_jobs_message_id" ON "public"."broadcast_jobs"("messageUuid");
    `,
                { transaction },
            );
            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
}
