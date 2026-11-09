CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE CHECK (code IN ('CUSTOMER', 'STAFF', 'ADMIN', 'SUPERADMIN'))
);

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INVITED', 'SUSPENDED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    user_id uuid NOT NULL REFERENCES users(id),
    role_id uuid NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE customer_profiles (
    user_id uuid PRIMARY KEY REFERENCES users(id),
    display_name text NOT NULL,
    phone text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE staff_profiles (
    user_id uuid PRIMARY KEY REFERENCES users(id),
    display_name text NOT NULL,
    staff_type text NOT NULL CHECK (staff_type IN ('PHOTOGRAPHER', 'MAKEUP_ARTIST', 'EDITOR', 'COORDINATOR')),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text NOT NULL DEFAULT '',
    duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
    edited_photo_limit integer NOT NULL CHECK (edited_photo_limit >= 0),
    price_vnd integer NOT NULL CHECK (price_vnd >= 0),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE extra_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    duration_minutes integer NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
    price_vnd integer NOT NULL CHECK (price_vnd >= 0),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customer_profiles(user_id),
    status text NOT NULL DEFAULT 'CHUA_TRA_LOI' CHECK (status IN ('CHUA_TRA_LOI', 'DANG_TU_VAN', 'DA_CHOT_LICH', 'HOAN_THANH')),
    subject text,
    last_message_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES conversations(id),
    sender_id uuid NOT NULL REFERENCES users(id),
    body text NOT NULL CHECK (length(trim(body)) > 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE schedule_proposals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES conversations(id),
    proposed_by uuid NOT NULL REFERENCES users(id),
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
    snapshot jsonb NOT NULL,
    valid_until timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code text NOT NULL UNIQUE,
    customer_id uuid NOT NULL REFERENCES customer_profiles(user_id),
    conversation_id uuid UNIQUE REFERENCES conversations(id),
    package_id uuid NOT NULL REFERENCES service_packages(id),
    package_name_snapshot text NOT NULL,
    package_price_snapshot_vnd integer NOT NULL CHECK (package_price_snapshot_vnd >= 0),
    status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'AGREED_WAITING_DEPOSIT', 'CONFIRMED', 'PREPARING',
        'SHOOT_IN_PROGRESS', 'AWAITING_SELECTION', 'EDITING',
        'READY_TO_DELIVER', 'COMPLETED', 'RESCHEDULE_REQUESTED', 'CANCELLED'
    )),
    total_vnd integer NOT NULL CHECK (total_vnd >= 0),
    deposit_vnd integer NOT NULL CHECK (deposit_vnd >= 0),
    balance_vnd integer NOT NULL CHECK (balance_vnd >= 0),
    cancellation_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (deposit_vnd + balance_vnd = total_vnd)
);

CREATE TABLE booking_extras (
    booking_id uuid NOT NULL REFERENCES bookings(id),
    extra_service_id uuid NOT NULL REFERENCES extra_services(id),
    name_snapshot text NOT NULL,
    price_snapshot_vnd integer NOT NULL CHECK (price_snapshot_vnd >= 0),
    duration_snapshot_minutes integer NOT NULL DEFAULT 0 CHECK (duration_snapshot_minutes >= 0),
    PRIMARY KEY (booking_id, extra_service_id)
);

CREATE TABLE booking_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id),
    schedule_type text NOT NULL CHECK (schedule_type IN ('MAKEUP', 'SHOOT', 'PREP', 'DELIVERY')),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    note text,
    CHECK (ends_at > starts_at)
);

CREATE TABLE resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type text NOT NULL CHECK (resource_type IN ('PHOTOGRAPHER', 'MAKEUP_ARTIST', 'ROOM', 'COSTUME')),
    name text NOT NULL,
    staff_user_id uuid REFERENCES staff_profiles(user_id),
    active boolean NOT NULL DEFAULT true,
    UNIQUE (resource_type, name)
);

CREATE TABLE resource_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id),
    booking_schedule_id uuid NOT NULL REFERENCES booking_schedules(id),
    resource_id uuid NOT NULL REFERENCES resources(id),
    status text NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'HELD', 'CONFIRMED', 'RELEASED')),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    CHECK (ends_at > starts_at)
);

ALTER TABLE resource_assignments
    ADD CONSTRAINT no_confirmed_resource_overlap
    EXCLUDE USING gist (
        resource_id WITH =,
        tstzrange(starts_at, ends_at, '[)') WITH &&
    )
    WHERE (status IN ('HELD', 'CONFIRMED'));

CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id),
    kind text NOT NULL CHECK (kind IN ('DEPOSIT', 'BALANCE', 'REFUND')),
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED')),
    amount_vnd integer NOT NULL CHECK (amount_vnd > 0),
    gateway text NOT NULL,
    gateway_payment_id text,
    gateway_event_id text UNIQUE,
    paid_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE production_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id),
    assignee_id uuid REFERENCES staff_profiles(user_id),
    task_type text NOT NULL CHECK (task_type IN ('MAKEUP', 'SHOOT', 'SELECT_REVIEW', 'EDIT', 'DELIVERY')),
    status text NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE')),
    due_at timestamptz,
    progress_percent integer NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE galleries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id),
    status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE photo_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id uuid NOT NULL REFERENCES galleries(id),
    object_key text NOT NULL UNIQUE,
    preview_object_key text,
    filename text NOT NULL,
    status text NOT NULL DEFAULT 'PREVIEW' CHECK (status IN ('PREVIEW', 'FINAL', 'ARCHIVED')),
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE photo_selections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_asset_id uuid NOT NULL REFERENCES photo_assets(id),
    customer_id uuid NOT NULL REFERENCES customer_profiles(user_id),
    selected_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (photo_asset_id, customer_id)
);

CREATE TABLE deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id),
    object_key_or_url text NOT NULL,
    note text,
    delivered_at timestamptz NOT NULL DEFAULT now(),
    received_at timestamptz
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    type text NOT NULL CHECK (type IN ('BOOKING_CONFIRMED', 'REMINDER', 'PAYMENT', 'GALLERY_READY', 'DELIVERY_READY', 'SYSTEM')),
    title text NOT NULL,
    body text NOT NULL,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES users(id),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_customer_status
    ON conversations (customer_id, status, last_message_at DESC);
CREATE INDEX idx_bookings_customer_status
    ON bookings (customer_id, status, created_at DESC);
CREATE INDEX idx_booking_schedules_booking_time
    ON booking_schedules (booking_id, starts_at);
CREATE INDEX idx_resource_assignments_resource_time
    ON resource_assignments (resource_id, starts_at, ends_at);
CREATE INDEX idx_payments_booking_kind
    ON payments (booking_id, kind, status);
CREATE INDEX idx_production_tasks_assignee_status
    ON production_tasks (assignee_id, status, due_at);
CREATE INDEX idx_photo_assets_gallery_order
    ON photo_assets (gallery_id, sort_order);
CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, read_at, created_at DESC);

INSERT INTO roles (code)
VALUES ('CUSTOMER'), ('STAFF'), ('ADMIN'), ('SUPERADMIN')
ON CONFLICT (code) DO NOTHING;
