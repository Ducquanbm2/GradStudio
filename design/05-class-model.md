# 05. Class diagram và domain model

## 1. Nguyên tắc model

- `Booking` là aggregate root cho phần nghiệp vụ xuyên suốt.
- `Conversation` có thể tồn tại trước booking; khi booking được tạo, lưu `conversation_id`.
- `BookingSchedule` tách khỏi booking để hỗ trợ nhiều mốc như makeup và shoot.
- `ResourceAssignment` tách khỏi `BookingSchedule` để một mốc có nhiều nhân sự/phòng/trang phục.
- `Payment` là immutable transaction record theo gateway event; cập nhật trạng thái có audit.
- `PhotoAsset` lưu metadata; binary file nằm object storage.

## 2. Class diagram

```mermaid
classDiagram
    class User {
      +UUID id
      +string email
      +string passwordHash
      +UserStatus status
      +datetime createdAt
    }
    class Role {
      +UUID id
      +RoleCode code
    }
    class CustomerProfile {
      +UUID userId
      +string displayName
      +string phone
    }
    class StaffProfile {
      +UUID userId
      +StaffType staffType
      +string displayName
    }
    class ServicePackage {
      +UUID id
      +string name
      +int durationMinutes
      +int editedPhotoLimit
      +int priceVnd
      +PackageStatus status
    }
    class ExtraService {
      +UUID id
      +string name
      +int durationMinutes
      +int priceVnd
    }
    class Conversation {
      +UUID id
      +ConversationStatus status
      +datetime lastMessageAt
    }
    class Message {
      +UUID id
      +UUID senderId
      +string body
      +datetime sentAt
    }
    class ScheduleProposal {
      +UUID id
      +datetime validUntil
      +ProposalStatus status
      +json snapshot
    }
    class Booking {
      +UUID id
      +string bookingCode
      +BookingStatus status
      +int totalVnd
      +int depositVnd
      +int balanceVnd
      +datetime createdAt
    }
    class BookingSchedule {
      +UUID id
      +ScheduleType type
      +datetime startsAt
      +datetime endsAt
      +string note
    }
    class Resource {
      +UUID id
      +ResourceType type
      +string name
      +bool active
    }
    class ResourceAssignment {
      +UUID id
      +AssignmentStatus status
      +datetime startsAt
      +datetime endsAt
    }
    class ProductionTask {
      +UUID id
      +TaskType type
      +TaskStatus status
      +datetime dueAt
    }
    class Payment {
      +UUID id
      +PaymentKind kind
      +PaymentStatus status
      +int amountVnd
      +string gatewayPaymentId
    }
    class Gallery {
      +UUID id
      +GalleryStatus status
    }
    class PhotoAsset {
      +UUID id
      +string objectKey
      +PhotoStatus status
      +int sortOrder
    }
    class PhotoSelection {
      +UUID id
      +datetime selectedAt
    }
    class Delivery {
      +UUID id
      +string objectKeyOrUrl
      +datetime deliveredAt
      +datetime receivedAt
    }
    class Notification {
      +UUID id
      +NotificationType type
      +datetime readAt
    }
    class AuditEvent {
      +UUID id
      +string eventType
      +json payload
      +datetime createdAt
    }

    User "1" --> "many" Role : has
    User "1" --> "0..1" CustomerProfile
    User "1" --> "0..1" StaffProfile
    CustomerProfile "1" --> "many" Conversation : owns
    Conversation "1" --> "many" Message
    Conversation "1" --> "many" ScheduleProposal
    User "1" --> "many" Message : sends
    Conversation "0..1" --> "1" Booking : becomes
    CustomerProfile "1" --> "many" Booking : places
    Booking "many" --> "1" ServicePackage
    Booking "many" --> "many" ExtraService : selected via items
    Booking "1" --> "many" BookingSchedule
    BookingSchedule "1" --> "many" ResourceAssignment
    Resource "1" --> "many" ResourceAssignment
    Booking "1" --> "many" ProductionTask
    User "1" --> "many" ProductionTask : assigned staff
    Booking "1" --> "many" Payment
    Booking "1" --> "0..1" Gallery
    Gallery "1" --> "many" PhotoAsset
    PhotoAsset "1" --> "many" PhotoSelection
    CustomerProfile "1" --> "many" PhotoSelection : makes
    Booking "1" --> "many" Delivery
    User "1" --> "many" Notification
    User "1" --> "many" AuditEvent : actor
```

## 3. Service methods cần giữ invariant

```text
ConversationService.agreeProposal(conversationId, proposalId)
BookingService.createWaitingDepositBooking(input)
BookingService.confirmAfterDeposit(bookingId, paymentId)
SchedulerService.checkAvailability(intervals, resourceRequirements)
SchedulerService.confirmAssignments(bookingId)
BookingService.reschedule(bookingId, newSchedule, actor)
GalleryService.saveSelection(bookingId, assetIds, customerId)
PaymentService.handleWebhook(event)
DeliveryService.markReceived(bookingId, customerId)
```

Không cho controller tự sửa `Booking.status`. Các transition phải qua service để kiểm tra quyền, state hiện tại và side effects.

## 4. Enum đề xuất

```text
RoleCode: CUSTOMER | STAFF | ADMIN | SUPERADMIN
ConversationStatus: CHUA_TRA_LOI | DANG_TU_VAN | DA_CHOT_LICH | HOAN_THANH
BookingStatus: DRAFT | AGREED_WAITING_DEPOSIT | CONFIRMED | PREPARING |
               SHOOT_IN_PROGRESS | AWAITING_SELECTION | EDITING |
               READY_TO_DELIVER | COMPLETED | RESCHEDULE_REQUESTED | CANCELLED
PaymentKind: DEPOSIT | BALANCE | REFUND
PaymentStatus: PENDING | SUCCEEDED | FAILED | CANCELLED | REFUNDED
ResourceType: PHOTOGRAPHER | MAKEUP_ARTIST | ROOM | COSTUME
TaskType: MAKEUP | SHOOT | SELECT_REVIEW | EDIT | DELIVERY
TaskStatus: TODO | IN_PROGRESS | BLOCKED | DONE
```
