# Changelog

## [1.0.0] - 2026-05-24

### Added — Increment 1
- RetrieveSBAssignmentsBatch: paginated assignment retrieval every 5 min
- RetrieveNotificationsBatch: paginated notification retrieval every 5 min
- SBWorkQueueBatch + SBWorkQueueHandler: 10-worker parallel processing
- SBWorkItemFactory: factory pattern routing by notification type
- ProcessAssignmentRequest: claim matching (Policy+LossDate) + create/update
- ProcessMessagesRequest / ProcessMessageRequest: two-pass message processing
- ProcessDocumentRequest / ProcessAttachmentRequest: two-pass document processing
- ProcessPackRequest: pack type update with history note
- SBPortalRestClient: Basic Auth REST client with timeout + error handling
- SBClaimMatchingHelper: Policy+LossDate matching with ambiguous match flagging
- SBUnattachedObjectHelper: unattached object conversion on claim match
- SBErrorHandler: exponential backoff (2s/4s/8s) + permanent error table write
- SBClaimMetaData_Ext: 19-field staging entity with index
- SBClaim_Ext: SB claim entity linked to CC Claim
- SBUnattachedDocument_Ext: temporary store for unmatched messages/documents
- SBClaimError_Ext: permanent failure error audit table
- SBIncidentScreen.pcf: 3-tab screen (Liability, Documents, History)
- SBSummaryDashboard.pcf: deadline-grouped dashboard with drilldown
- plugin.xml: batch + workqueue registration with Basic Auth config
- WorkQueueConfig.xml: 10 workers, 3 retries, 2s base retry delay
