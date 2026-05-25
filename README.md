# CC-SB-Portal-Integration

Guidewire ClaimCenter v10 (on-premises) integration with the SB Portal — Increment 1.

## Overview

Retrieves injury claim assignments, messages and documents from the SB Portal REST API and
matches or creates corresponding claims in ClaimCenter. Claims handlers can view SB injury
claims via a dedicated incident screen and monitor outstanding claims via a summary dashboard.

## Architecture

```
Phase 1 — Batch (every 5 min)
  RetrieveSBAssignmentsBatch   → GET /assignments  → SBClaimMetaData_Ext (staging)
  RetrieveNotificationsBatch   → GET /notifications → SBClaimMetaData_Ext (staging)

Phase 2 — Work Queue (10 parallel workers)
  SBWorkQueueBatch             → queries PENDING staging → creates WorkItems
  SBWorkQueueHandler           → dispatches to factory
  SBWorkItemFactory            → routes by NotificationType:
    ProcessAssignmentRequest   → GetClaimDetails → match (Policy+LossDate) or create
    ProcessMessagesRequest     → GetAllMessages  → stage individual messages
    ProcessMessageRequest      → GetSingleMessage → attach to SB/CC Claim
    ProcessDocumentRequest     → GetAllDocuments  → stage individual documents
    ProcessAttachmentRequest   → GetSingleDocument → attach to SB/CC Claim
    ProcessPackRequest         → Update SBClaim PackType + stage history note

Phase 3 — UI
  SBIncidentScreen             → 3 tabs: Liability / Documents / History
  SBSummaryDashboard           → grouped by DeadlineDate x Adjuster + drilldown
```

## Key Design Patterns

| Pattern | Implementation |
|---|---|
| Staging Table | SBClaimMetaData_Ext — decouples fetch from processing |
| Work Queue | IWorkQueueMessageHandler — 10 parallel workers |
| Factory Pattern | SBWorkItemFactory — routes by NotificationType |
| Two-pass processing | Messages/Docs: list call → individual item call |
| Idempotent inserts | ExternalClaimID checked before staging insert |
| Unattached objects | Stored until CC Claim matched, then converted |
| Exponential backoff | 2s → 4s → 8s retry delays |
| Atomic status lock | IN_PROGRESS set before processing to prevent duplicates |

## Claim Matching Logic

1. Match by **Policy Number + Loss Date**
2. Single match found → update existing claim
3. Multiple matches → flag as MANUAL_REVIEW
4. No match → create new claim in ClaimCenter

## Custom Entities

| Entity | Purpose |
|---|---|
| SBClaimMetaData_Ext | Staging table (19 fields) |
| SBClaim_Ext | SB injury claim linked to CC Claim |
| SBUnattachedDocument_Ext | Temp store for unmatched messages/documents |
| SBClaimError_Ext | Permanent failure error table |

## Configuration

All credentials and endpoints configured in `config/plugin/plugin.xml`.
Never hardcode credentials — use environment variable substitution.

## Deployment (CC v10 On-Premises)

1. Deploy Gosu classes to `gsrc/`
2. Deploy entity files to `config/entity/`
3. Deploy PCF screens to `config/pcf/`
4. Register plugins in `config/plugin/plugin.xml`
5. Configure batch cron in `config/BatchProcesses/`
6. Run database schema update
7. Set `SB_PORTAL_USERNAME` and `SB_PORTAL_PASSWORD` environment variables
8. Verify batch processes appear in Guidewire Admin UI
