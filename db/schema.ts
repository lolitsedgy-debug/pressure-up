import { sql } from "drizzle-orm";
import { index, uniqueIndex, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  identityKey:text('identity_key'), mergedInto:text('merged_into'),
  id: text("id").primaryKey(), firstName: text("first_name").notNull(), lastName: text("last_name").notNull(),
  phone: text("phone").notNull(), email: text("email").notNull(), address: text("address").notNull(),
  language: text("language").notNull().default("English"), consent: integer("consent", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t=>[uniqueIndex('idx_customer_identity').on(t.identityKey)]);
export const jobs = sqliteTable("jobs", {
  funnelId:text('funnel_id'),leadSource:text('lead_source').notNull().default('Unknown'),campaign:text('campaign').notNull().default(''),
  serviceAddress:text('service_address').notNull().default(''),
  id: text("id").primaryKey(), customerId: text("customer_id").notNull().references(() => customers.id),
  service: text("service").notNull(), scheduledDate: text("scheduled_date").notNull(), arrivalWindow: text("arrival_window").notNull(),
  price: real("price").notNull(), status: text("status").notNull(), paymentMethod: text("payment_method").notNull(), city: text("city").notNull().default("Lawndale"),
  estimateJson: text("estimate_json").notNull().default("[]"), invoiceJson: text("invoice_json").notNull().default("[]"),
  manageToken: text("manage_token"), cancelledAt: text("cancelled_at"), cancellationReason: text("cancellation_reason"),
  cancelledBy: text("cancelled_by"), notificationStatus: text("notification_status"),
  paidAt: text("paid_at"), paidAmount: real("paid_amount"), customerNote: text("customer_note").notNull().default(""),
  eta: text('eta'), etaUpdatedAt:text('eta_updated_at'),durationMinutes:integer('duration_minutes').notNull().default(120),updatesOptIn:integer('updates_opt_in').notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const availabilityRules = sqliteTable("availability_rules", {
  id: text("id").primaryKey(), weekday: integer("weekday").notNull(), window: text("window").notNull().default("all"),
  label: text("label").notNull().default("Recurring unavailable"), enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  startTime: text("start_time"), endTime: text("end_time"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const availabilityBlocks = sqliteTable("availability_blocks", {
  id: text("id").primaryKey(), blockDate: text("block_date").notNull(), window: text("window").notNull().default("all"),
  startTime: text("start_time"), endTime: text("end_time"), reason: text("reason").notNull().default("Unavailable"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(), jobId: text("job_id"), customerId: text("customer_id"), type: text("type").notNull(),
  channel: text("channel").notNull().default("manual"), status: text("status").notNull().default("queued"), message: text("message").notNull(),
  providerId:text('provider_id'),destination:text('destination'),sentAt:text('sent_at'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const media = sqliteTable("media", {
  id: text("id").primaryKey(), jobId: text("job_id").notNull().references(() => jobs.id), objectKey: text("object_key").notNull(),
  thumbnailObjectKey: text("thumbnail_object_key"), contentType: text("content_type").notNull(), fileName: text("file_name").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const expenses = sqliteTable("expenses", {
 receiptSha256:text('receipt_sha256'),receiptDhash:text('receipt_dhash'),receiptDetails:text('receipt_details').notNull().default('{}'),submissionKey:text('submission_key'),
  id: text("id").primaryKey(), amount: real("amount").notNull(), vendor: text("vendor").notNull(), category: text("category").notNull(),
  expenseDate: text("expense_date").notNull(), paymentMethod: text("payment_method").notNull(), businessPurpose: text("business_purpose").notNull().default(""),
  jobId: text("job_id"), receiptObjectKey: text("receipt_object_key"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const mileage = sqliteTable("mileage", {
  id: text("id").primaryKey(), tripDate: text("trip_date").notNull(), vehicle: text("vehicle").notNull(),
  origin: text("origin").notNull(), destination: text("destination").notNull(), purpose: text("purpose").notNull(),
  startOdometer: real("start_odometer").notNull(), endOdometer: real("end_odometer").notNull(), jobId: text("job_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t => [index("idx_mileage_trip_date").on(t.tripDate)]);
export const vehicles = sqliteTable('vehicles', {
 id:text('id').primaryKey(),nickname:text('nickname').notNull(),details:text('details').notNull().default(''),plate:text('plate').notNull().default(''),vin:text('vin').notNull().default(''),startingOdometer:real('starting_odometer'),startDate:text('start_date'),archived:integer('archived').notNull().default(0),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const costSettings = sqliteTable('cost_settings', {id:text('id').primaryKey(),baseAddress:text('base_address').notNull().default(''),defaultVehicle:text('default_vehicle')});
export const trips = sqliteTable('trip_records', {id:text('id').primaryKey(),tripDate:text('trip_date').notNull(),vehicleId:text('vehicle_id').references(()=>vehicles.id),routeJson:text('route_json').notNull().default('[]'),purpose:text('purpose').notNull(),status:text('status').notNull().default('draft'),estimatedMiles:real('estimated_miles'),actualMiles:real('actual_miles'),eligibleMiles:real('eligible_miles'),method:text('method').notNull().default('review'),rate:real('rate'),confirmedAt:text('confirmed_at'),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)});
export const tripJobs=sqliteTable('trip_jobs',{jobId:text('job_id').primaryKey().references(()=>jobs.id),tripId:text('trip_id').notNull().references(()=>trips.id)});
export const tripEdits=sqliteTable('trip_edits',{id:text('id').primaryKey(),tripId:text('trip_id').notNull().references(()=>trips.id),beforeJson:text('before_json').notNull(),afterJson:text('after_json').notNull(),reason:text('reason').notNull(),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)});
export const supplies=sqliteTable('supplies',{id:text('id').primaryKey(),name:text('name').notNull(),unit:text('unit').notNull(),lowAt:real('low_at').notNull().default(1),archived:integer('archived').notNull().default(0)});
export const supplyMovements=sqliteTable('supply_movements',{id:text('id').primaryKey(),supplyId:text('supply_id').notNull().references(()=>supplies.id),quantity:real('quantity').notNull(),unitCost:real('unit_cost').notNull().default(0),kind:text('kind').notNull(),jobId:text('job_id').references(()=>jobs.id),expenseId:text('expense_id').references(()=>expenses.id),movementDate:text('movement_date').notNull(),note:text('note').notNull().default(''),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)}, t=>[uniqueIndex('idx_supply_purchase_once').on(t.expenseId)]);

export const businessSettings = sqliteTable('business_settings',{id:text('id').primaryKey(),name:text('name').notNull().default('Pressure Up'),ownerName:text('owner_name').notNull().default('Edgar Torres'),phone:text('phone').notNull(),email:text('email').notNull(),website:text('website').notNull(),ownerPhotoKey:text('owner_photo_key')});

// Owner-managed website content is isolated from operational/customer records.
export const websiteContent=sqliteTable('website_content',{id:text('id').primaryKey(),draftJson:text('draft_json').notNull(),publishedJson:text('published_json').notNull(),revision:integer('revision').notNull().default(0),publishId:text('publish_id'),baseContactJson:text('base_contact_json').notNull(),updatedAt:text('updated_at').notNull()});
export const websiteVersions=sqliteTable('website_versions',{id:text('id').primaryKey(),contentJson:text('content_json').notNull(),description:text('description').notNull(),createdAt:text('created_at').notNull()});
export const websiteMedia=sqliteTable('website_media',{id:text('id').primaryKey(),objectKey:text('object_key').notNull(),thumbnailKey:text('thumbnail_key'),name:text('name').notNull(),contentType:text('content_type').notNull(),category:text('category').notNull(),archived:integer('archived').notNull().default(0),createdAt:text('created_at').notNull()});
export const websitePublicMedia=sqliteTable('website_public_media',{mediaId:text('media_id').primaryKey().references(()=>websiteMedia.id)});
export const ownerPreferences=sqliteTable('owner_preferences',{id:text('id').primaryKey(),cardsJson:text('cards_json').notNull()});

export const estimateFunnels=sqliteTable('estimate_funnels',{id:text('id').primaryKey(),source:text('source').notNull().default('Unknown'),campaign:text('campaign').notNull().default(''),startedAt:text('started_at').notNull(),submittedAt:text('submitted_at'),generatedAt:text('generated_at'),sentAt:text('sent_at'),bookedAt:text('booked_at'),completedAt:text('completed_at'),paidAt:text('paid_at'),jobId:text('job_id')},t=>[index('funnel_started').on(t.startedAt)]);
export const adSpend=sqliteTable('ad_spend',{id:text('id').primaryKey(),source:text('source').notNull(),campaign:text('campaign').notNull().default(''),periodStart:text('period_start').notNull(),periodEnd:text('period_end').notNull(),amount:real('amount').notNull(),note:text('note').notNull().default('')});

// Invoice lifecycle metadata supplements the existing job-backed line items.
export const invoiceRecords=sqliteTable('invoice_records',{jobId:text('job_id').primaryKey().references(()=>jobs.id),state:text('state').notNull(),revision:integer('revision').notNull().default(1),token:text('token').notNull(),updatedAt:text('updated_at').notNull()});
export const invoiceVersions=sqliteTable('invoice_versions',{id:text('id').primaryKey(),jobId:text('job_id').notNull().references(()=>jobs.id),revision:integer('revision').notNull(),snapshotJson:text('snapshot_json').notNull(),createdAt:text('created_at').notNull()},t=>[uniqueIndex('invoice_sent_revision').on(t.jobId,t.revision)]);
export const marketingApprovals=sqliteTable('marketing_approvals',{id:text('id').primaryKey(),kind:text('kind').notNull(),mediaId:text('media_id').notNull(),approvedAt:text('approved_at').notNull()});
export const marketingPosts=sqliteTable('marketing_posts',{id:text('id').primaryKey(),contentJson:text('content_json').notNull(),state:text('state').notNull().default('Draft'),token:text('token').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()});
