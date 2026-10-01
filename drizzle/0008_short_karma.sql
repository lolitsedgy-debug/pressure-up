ALTER TABLE customers ADD identity_key text;
--> statement-breakpoint
ALTER TABLE customers ADD merged_into text;
--> statement-breakpoint
ALTER TABLE jobs ADD service_address text DEFAULT '' NOT NULL;
--> statement-breakpoint
-- Capture the job's original property before changing any customer association.
UPDATE jobs SET service_address=COALESCE((SELECT address FROM customers WHERE id=jobs.customer_id),'');
--> statement-breakpoint
UPDATE customers SET identity_key=json_array(lower(trim(first_name)),lower(trim(last_name)),CASE WHEN length(replace(replace(replace(replace(replace(replace(phone,'+',''),' ',''),'(',''),')',''),'-',''),'.',''))=10 THEN '1'||replace(replace(replace(replace(replace(replace(phone,'+',''),' ',''),'(',''),')',''),'-',''),'.','') ELSE replace(replace(replace(replace(replace(replace(phone,'+',''),' ',''),'(',''),')',''),'-',''),'.','') END,lower(trim(email))) WHERE trim(first_name)!='' AND trim(last_name)!='' AND instr(email,'@')>1 AND length(replace(replace(replace(replace(replace(replace(phone,'+',''),' ',''),'(',''),')',''),'-',''),'.',''))>=10;
--> statement-breakpoint
UPDATE customers SET merged_into=(SELECT c.id FROM customers c WHERE c.identity_key=customers.identity_key ORDER BY c.created_at,c.id LIMIT 1) WHERE identity_key IS NOT NULL;
--> statement-breakpoint
UPDATE customers SET merged_into=NULL WHERE merged_into=id;
--> statement-breakpoint
-- Preserve opt-outs, historical profiles, job IDs, tokens and all job-linked files.
UPDATE customers SET consent=(SELECT min(c.consent) FROM customers c WHERE c.id=customers.id OR c.merged_into=customers.id) WHERE merged_into IS NULL;
--> statement-breakpoint
UPDATE jobs SET customer_id=(SELECT merged_into FROM customers WHERE id=jobs.customer_id) WHERE customer_id IN (SELECT id FROM customers WHERE merged_into IS NOT NULL);
--> statement-breakpoint
UPDATE notifications SET customer_id=(SELECT merged_into FROM customers WHERE id=notifications.customer_id) WHERE customer_id IN (SELECT id FROM customers WHERE merged_into IS NOT NULL);
--> statement-breakpoint
UPDATE customers SET identity_key=NULL WHERE merged_into IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX idx_customer_identity ON customers(identity_key);
