# Migration `20210124182625-added-poll-id-to-pending-email`

This migration has been generated by Taliesin at 1/24/2021, 6:26:25 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."PendingEmail" ADD COLUMN "pollId" text   NOT NULL 
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210124112629-added-total-votes..20210124182625-added-poll-id-to-pending-email
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model Answer {
   answer_string     String
@@ -20,8 +20,9 @@
   answers String[]
   email   String   @id
   ip      String
   created DateTime @default(now())
+  pollId  String
 }
 model ForgottenPasswordPendingEmail {
   created DateTime @default(now())
```


