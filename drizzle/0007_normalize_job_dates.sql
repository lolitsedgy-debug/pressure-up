-- Older intake submitted display labels without a year. Recover that year from
-- the job's creation timestamp; preserve already canonical dates and histories.
WITH labels AS (
 SELECT id,substr(created_at,1,4) AS year,
 trim(CASE WHEN instr(scheduled_date,',')>0 THEN substr(scheduled_date,instr(scheduled_date,',')+1) ELSE scheduled_date END) AS label
 FROM jobs WHERE scheduled_date GLOB '*[A-Za-z]*' AND scheduled_date NOT GLOB '*[0-9][0-9][0-9][0-9]*'
), parsed AS (
 SELECT id,year,CASE lower(substr(label,1,3)) WHEN 'jan' THEN 1 WHEN 'feb' THEN 2 WHEN 'mar' THEN 3 WHEN 'apr' THEN 4 WHEN 'may' THEN 5 WHEN 'jun' THEN 6 WHEN 'jul' THEN 7 WHEN 'aug' THEN 8 WHEN 'sep' THEN 9 WHEN 'oct' THEN 10 WHEN 'nov' THEN 11 WHEN 'dec' THEN 12 END AS month,
 CAST(trim(substr(label,instr(label,' ')+1)) AS INTEGER) AS day FROM labels
)
UPDATE jobs SET scheduled_date=(SELECT printf('%s-%02d-%02d',year,month,day) FROM parsed WHERE parsed.id=jobs.id)
WHERE id IN (SELECT id FROM parsed WHERE month BETWEEN 1 AND 12 AND day BETWEEN 1 AND 31 AND year GLOB '[0-9][0-9][0-9][0-9]');
--> statement-breakpoint
UPDATE trip_records SET trip_date=(SELECT j.scheduled_date FROM trip_jobs l JOIN jobs j ON j.id=l.job_id WHERE l.trip_id=trip_records.id LIMIT 1)
WHERE status='draft' AND actual_miles IS NULL AND (SELECT count(*) FROM trip_jobs l WHERE l.trip_id=trip_records.id)=1
AND NOT EXISTS (SELECT 1 FROM trip_edits e WHERE e.trip_id=trip_records.id);
