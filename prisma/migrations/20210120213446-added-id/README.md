# Migration `20210120213446-added-id`

This migration has been generated by Taliesin at 1/20/2021, 9:34:46 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."ForgottenPasswordPendingEmail" ADD COLUMN "id" text   NOT NULL ,
ADD PRIMARY KEY ("id")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210119213120-added-pending-forgotten-password-pending-email..20210120213446-added-id
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
@@ -25,8 +25,9 @@
 model ForgottenPasswordPendingEmail {
   created DateTime @default(now())
   email   String @unique
+  id      String @id
 }
 model Poll {
   created    DateTime? @default(now())
```


