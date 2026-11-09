# 02. UML và business-flow diagrams

Các diagram dùng Mermaid. GitHub và nhiều extension VS Code có thể render trực tiếp các code block `mermaid`.

## 1. Use-case diagram

```mermaid
flowchart LR
    Guest[Guest]
    Customer[Customer]
    Admin[Admin]
    Staff[Staff]
    Superadmin[Superadmin]
    Gateway[(Payment gateway)]
    Notify[(Notification service)]
    Storage[(Object storage)]

    subgraph GS[GradStudio]
      UC1((Browse catalogue))
      UC2((Create request))
      UC3((Chat and agree time))
      UC4((Create waiting-deposit booking))
      UC5((Pay deposit))
      UC6((Confirm booking and assign resources))
      UC7((Manage or reschedule booking))
      UC8((View assigned tasks))
      UC9((Update production progress))
      UC10((Upload previews))
      UC11((Select photos))
      UC12((Pay remaining balance))
      UC13((Deliver final files))
      UC14((Receive files))
      UC15((Manage catalogue/resources))
      UC16((Manage admins/settings))
      UC17((Send reminders))
    end

    Guest --> UC1
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Admin --> UC3
    Admin --> UC4
    Customer --> UC5
    UC5 --> Gateway
    UC5 -. success .-> UC6
    Admin --> UC7
    Staff --> UC8
    Staff --> UC9
    Staff --> UC10
    UC10 --> Storage
    Customer --> UC11
    Customer --> UC12
    UC12 --> Gateway
    Admin --> UC13
    Staff --> UC13
    UC13 --> Storage
    Customer --> UC14
    Admin --> UC15
    Superadmin --> UC16
    UC6 --> UC17
    UC17 --> Notify
```

## 2. Activity - tư vấn, cọc và giữ lịch

```mermaid
flowchart TD
    A([Start]) --> B[Customer xem catalogue]
    B --> C[Customer gửi request hoặc mở chat]
    C --> D[Admin chọn package, extras, ngày và giờ mong muốn]
    D --> E{Tài nguyên đủ trong toàn bộ khoảng thời gian?}
    E -- Không --> F[Hiển thị resource xung đột và slot gần nhất]
    F --> G[Admin gửi đề xuất mới]
    G --> H{Customer đồng ý?}
    H -- Không --> D
    H -- Có --> I[Conversation = Đã chốt lịch]
    E -- Có --> I
    I --> J[Admin tạo booking chờ cọc]
    J --> K[Customer mở timeline và thanh toán cọc 30%]
    K --> L{Gateway success?}
    L -- Không --> M[Booking vẫn Chờ cọc 30%]
    M --> K
    L -- Có --> N[Backend verify webhook và lock resource]
    N --> O{Re-check còn trống?}
    O -- Không --> P[Không confirm; tạo case xử lý hoàn/đổi giờ]
    O -- Có --> Q[Transaction: payment success + booking confirmed + assignments]
    Q --> R[Tạo task và reminder]
    R --> S([End])
```

## 3. Activity - chọn ảnh, thanh toán phần còn lại và nhận file

```mermaid
flowchart TD
    A([Shoot finished]) --> B[Staff cập nhật AWAITING_SELECTION]
    B --> C[Staff upload preview vào gallery]
    C --> D[Customer mở gallery]
    D --> E[Customer chọn ảnh]
    E --> F{Đúng giới hạn package?}
    F -- Không --> G[Hiển thị số ảnh còn được chọn]
    G --> E
    F -- Có --> H[Customer chốt selection]
    H --> I[Booking = EDITING]
    I --> J[Staff chỉnh ảnh và cập nhật progress]
    J --> K{Đã hoàn tất ảnh?}
    K -- Chưa --> J
    K -- Rồi --> L[Admin thêm delivery link]
    L --> M[Customer thanh toán 70%]
    M --> N{Payment success?}
    N -- Không --> M
    N -- Có --> O[Booking = READY_TO_DELIVER]
    O --> P[Customer mở link và bấm Nhận ảnh]
    P --> Q[Booking = COMPLETED]
    Q --> R([End])
```

## 4. Sequence - tạo booking và confirm sau cọc

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Web as Customer portal
    participant API as Booking API
    participant Scheduler as Resource service
    participant Pay as Payment gateway
    participant DB as PostgreSQL
    participant Notify as Notification worker

    Customer->>Web: Mở booking chờ cọc
    Web->>API: GET /bookings/GS-1024
    API->>DB: Đọc booking, timeline, payment intent
    DB-->>API: Booking + deposit amount
    API-->>Web: Hiển thị trạng thái và số tiền
    Customer->>Web: Bấm thanh toán cọc
    Web->>API: POST /bookings/GS-1024/payments/deposit
    API->>Pay: Tạo checkout session 540000 VND
    Pay-->>API: checkout_url + payment_id
    API->>DB: Lưu payment PENDING
    API-->>Web: Chuyển sang gateway
    Pay-->>API: Webhook payment.succeeded
    API->>Pay: Verify signature và amount
    API->>DB: BEGIN transaction
    API->>Scheduler: Lock và re-check resource intervals
    Scheduler->>DB: SELECT assignments FOR UPDATE
    DB-->>Scheduler: Không có overlap
    Scheduler-->>API: Available
    API->>DB: Payment SUCCEEDED, booking CONFIRMED
    API->>DB: Tạo assignments và production tasks
    API->>DB: COMMIT
    API->>Notify: Enqueue booking confirmation + reminder
    Notify-->>Customer: Email/in-app confirmation
```

## 5. Sequence - gallery và delivery

```mermaid
sequenceDiagram
    autonumber
    actor Staff
    actor Customer
    participant Web as Web app
    participant API as Gallery API
    participant Store as Object storage
    participant DB as PostgreSQL

    Staff->>Web: Chọn booking và upload preview
    Web->>API: POST /bookings/:id/gallery/assets
    API->>Store: Put low-resolution preview
    Store-->>API: object_key + metadata
    API->>DB: Insert photo_assets
    API->>DB: Booking -> AWAITING_SELECTION
    API-->>Web: Gallery published
    Customer->>Web: Chọn ảnh và bấm lưu
    Web->>API: PUT /bookings/:id/selection
    API->>DB: Validate package limit
    API->>DB: Upsert photo_selections
    API->>DB: Booking -> EDITING
    API-->>Customer: Selection saved
    Staff->>Web: Cập nhật tiến độ và thêm final delivery
    Web->>API: POST /bookings/:id/delivery
    API->>Store: Validate final object/link
    API->>DB: Insert delivery
    API-->>Customer: Delivery chờ thanh toán phần còn lại
```

## 6. Sequence - reschedule/cancel

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Web as Admin console
    participant API as Booking API
    participant Scheduler as Resource service
    participant DB as PostgreSQL
    participant Notify as Notification worker

    Admin->>Web: Mở booking CONFIRMED
    Admin->>Web: Nhập giờ mới và lý do
    Web->>API: POST /bookings/:id/reschedule
    API->>Scheduler: Check new intervals
    Scheduler->>DB: Query overlap by resource
    DB-->>Scheduler: Available / conflict details
    alt Available
        Scheduler-->>API: New slot available
        API->>DB: BEGIN; update schedule + assignments; COMMIT
        API->>Notify: Enqueue change notification
        API-->>Web: Rescheduled
    else Conflict
        Scheduler-->>API: Conflict with resource name and interval
        API-->>Web: Show actionable conflict message
    end
```
