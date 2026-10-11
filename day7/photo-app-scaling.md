# Day 7: SnapShare Photo App Scaling Plan

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and view a feed from people they follow.

- Registered users: **10,000,000**.
- Daily active users (DAU): **10%** of registered users.
- Each active user uploads **1 photo per day**.
- Each active user views **50 feed pages per day**.
- Each original photo averages **2 MB**.
- Each photo has one thumbnail averaging **50 KB** (0.05 MB, using decimal units).
- One day is approximated as **100,000 seconds** for the assignment's back-of-the-envelope throughput estimates.
- Peak traffic is **5 times** the daily average.
- A year is **365 days**, and the upload rate and photo sizes stay constant throughout the year.
- Storage calculations use decimal units (1 TB = 1,000,000 MB) and exclude replicas, backups, database records, and other overhead.

**Daily active users:** 10,000,000 × 0.10 = **1,000,000 DAU**.

## 2. Traffic and Storage Estimates

| Metric | Calculation | Estimate |
|---|---|---|
| Uploads per day | 1,000,000 × 1 | **1,000,000** |
| Average uploads per second | 1,000,000 ÷ 100,000 | **10 uploads/s** |
| Peak uploads per second | 10 × 5 | **50 uploads/s** |
| Feed views per day | 1,000,000 × 50 | **50,000,000** |
| Average feed views per second | 50,000,000 ÷ 100,000 | **500 views/s** |
| Peak feed views per second | 500 × 5 | **2,500 views/s** |
| Storage per photo, including thumbnail | 2 MB + 0.05 MB | **2.05 MB** |
| Storage added per day | 1,000,000 × 2.05 MB | **2.05 TB** |
| Storage added per year | 2.05 TB × 365 | **748.25 TB/year** |

These rates use the assignment's approximation of 100,000 seconds per day. With the actual 86,400 seconds, average uploads are about **11.6/s**, average feed views about **578.7/s**, and 5× peaks about **57.9 uploads/s** and **2,893.5 feed views/s**. Annual storage does not change.

## 3. Read-Heavy or Write-Heavy?

SnapShare is **read-heavy**: users view 50,000,000 feed pages but upload only 1,000,000 photos per day, giving roughly **50 feed-page reads per upload**. The design should optimize reads through a CDN for image delivery, Redis for frequently requested feed data, and a database read replica for queries, while still scaling the upload pipeline independently.

## 4. Where Photo Files Should Live

Store original photos and generated thumbnails in **object storage**, not directly in the relational database. Large binary files would increase database size, backup costs, and query/replication overhead. The database should instead store photo metadata such as photo ID, owner ID, object-storage key, thumbnail key, upload timestamp, and processing status. Object storage is better suited to durable, large-scale media storage and integrates with a CDN for efficient delivery.

## 5. Architecture Diagram

```text
                           +-------------------+
                           |   Users / Clients |
                           +---------+---------+
                                     |
                   +-----------------+-----------------+
                   |                                   |
          Static image requests                 API requests
                   |                                   |
          +--------v--------+                 +--------v--------+
          |       CDN       |                 |  Load Balancer  |
          | Photos / thumbs |                 +--------+--------+
          +--------+--------+                          |
                   |                          +--------v--------+
                   |                          | Stateless App   |
                   |                          | Servers (many) |
                   |                          +--+---+---+---+--+
                   |                             |   |   |   |
                   |            +----------------+   |   |   +----------------+
                   |            |                    |   |                    |
                   |     +------v------+     +-------v-------+      +------v------+
                   |     | Redis Cache |     | Primary DB    |      | Job Queue   |
                   |     | Feed data   |     | Writes /      |      | Thumbnail   |
                   |     +-------------+     | metadata      |      | jobs        |
                   |                         +-------+-------+      +------+------+ 
                   |                                 |                     |
                   |                         Replication                   v
                   |                                 |              +------+------+
                   |                         +-------v-------+      | Worker      |
                   |                         | DB Read       |      | Resize image|
                   |                         | Replica       |      +------+------+
                   |                         +---------------+             |
                   |                                                       |
                   +--------------------------+----------------------------+
                                              |
                                     +--------v--------+
                                     |  Object Storage |
                                     | Originals and   |
                                     | thumbnails      |
                                     +-----------------+

App servers also read from the DB replica and issue signed upload/download
URLs to object storage. The worker updates processing status in the primary DB.
```

## 6. What Each Component Solves

| Component | Purpose (one sentence) |
|---|---|
| Users / clients | Let people upload photos and request their feeds. |
| CDN | Delivers cached photos and thumbnails from edge servers near users, reducing latency and origin traffic. |
| Load balancer | Distributes incoming API requests across available app servers to avoid overloading one server. |
| Stateless app servers | Handle authentication, feed APIs, and upload coordination without keeping persistent user state in one server's memory. |
| Redis cache | Stores frequently requested feed results to reduce repeated database reads. |
| Primary database | Reliably stores users, follows, photo metadata, and other authoritative records. |
| Database read replica | Handles read queries without placing all read traffic on the primary database. |
| Object storage | Stores original photos and thumbnails durably without bloating the database. |
| Job queue | Buffers thumbnail-creation jobs so uploads do not have to wait for image processing. |
| Thumbnail worker | Processes queued photos in the background and writes smaller thumbnails to object storage. |

## 7. Step-by-Step Photo Upload Flow

1. The user selects a photo in the app and sends an authenticated upload request through the load balancer to an app server.
2. The app server validates the request and creates a photo metadata record with status `pending`, then returns a short-lived signed upload URL for object storage.
3. The client uploads the original photo directly to object storage using that URL, avoiding a large transfer through the app server.
4. After the upload is confirmed (for example, through a verified object-storage event), the server marks the original as uploaded and publishes a thumbnail-processing job to the queue; the event handler must be safe to retry.
5. A thumbnail worker consumes the job, fetches the original photo from object storage, and resizes it into a roughly 50 KB thumbnail.
6. The worker saves the thumbnail to object storage, updates the photo record in the primary database with the thumbnail key and `ready` status, and acknowledges the queue job; failed jobs are retried.
7. The app invalidates or updates affected cached feeds in Redis so users do not keep seeing stale feed data.
8. When followers open their feeds, an app server checks Redis first and otherwise reads feed metadata from the database read replica, caching the result for subsequent requests.
9. The client receives photo metadata and CDN URLs, and the CDN serves cached thumbnails or retrieves them from object storage on a cache miss.

## 8. Design Trade-Offs

1. **Caching vs. freshness:** Redis speeds up feed requests and reduces database load, but cached feeds can become stale; invalidation after uploads and edits adds complexity.
2. **Read replicas vs. consistency:** Read replicas improve read capacity, but replication lag can delay the appearance of a newly uploaded photo; read-after-write requests may need to use the primary database.
3. **Asynchronous thumbnails vs. immediate availability:** A queue keeps uploads responsive and smooths bursts, but thumbnails are not available instantly and jobs need retries and failure handling.
4. **CDN vs. cost and invalidation:** A CDN reduces image latency and origin bandwidth, but incurs delivery costs and requires careful cache headers or versioned image URLs when images change.
5. **Direct-to-object-storage uploads vs. simplicity:** Signed uploads reduce app-server bandwidth, but require secure URL expiration, upload verification, and cleanup of abandoned uploads.

