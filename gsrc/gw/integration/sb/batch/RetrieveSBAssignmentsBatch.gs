package gw.integration.sb.batch

uses gw.api.util.Logger
uses gw.processes.BatchProcessBase
uses gw.integration.sb.client.SBPortalRestClient
uses gw.integration.sb.client.SBPortalEndpoints
uses gw.integration.sb.config.ISBPortalConfig
uses gw.integration.sb.helper.SBClaimMapper
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.transaction.Transaction
uses java.util.Date

@Export
class RetrieveSBAssignmentsBatch extends BatchProcessBase {
  static final var _logger = Logger.forCategory("RetrieveSBAssignmentsBatch")

  construct() {
    super(typekey.BatchProcessType.get("RetrieveSBAssignmentsBatch"))
  }

  override function doWork() : void {
    _logger.info("RetrieveSBAssignmentsBatch START " + new Date())
    var client = buildClient()
    var toDate = new Date()
    var fromDate = new Date(toDate.Time - (SBIntegrationConstants.BATCH_WINDOW_HOURS * 3600000L))
    var page = 1
    var total = 0

    var hasMore = true
    while (hasMore) {
      var params = {
        "fromDate" -> SBClaimMapper.formatDate(fromDate),
        "toDate" -> SBClaimMapper.formatDate(toDate),
        "page" -> page as String,
        "pageSize" -> SBIntegrationConstants.PAGE_SIZE as String
      }
      var response = client.get(SBPortalEndpoints.GET_ASSIGNMENTS, params)
      var records = SBClaimMapper.parseAssignments(response)
      if (records.isEmpty()) {
        hasMore = false
      } else {
        records.each(\r -> stageAssignment(r, response))
        total += records.Count
        _logger.info("Page " + page + " - " + records.Count + " assignments staged")
        page++
      }
    }
    _logger.info("RetrieveSBAssignmentsBatch COMPLETE total=" + total)
  }

  private function stageAssignment(data : Map<String, String>, rawJson : String) {
    var externalId = data.get("claimId")
    Transaction.runWithNewBundle(\bundle -> {
      var exists = gw.api.database.Query.make(entity.SBClaimMetaData_Ext)
          .compare("ExternalClaimID_Ext", Equals, externalId)
          .select().Count > 0
      if (exists) {
        _logger.debug("Duplicate skipped ExternalClaimID=" + externalId)
        return
      }
      var staging = new entity.SBClaimMetaData_Ext(bundle)
      staging.ExternalClaimID_Ext = externalId
      staging.NotificationType_Ext = SBIntegrationConstants.TYPE_ASSIGNMENT
      staging.PolicyNumber_Ext = data.get("policyNumber")
      staging.ClaimantName_Ext = data.get("claimantName")
      staging.PackType_Ext = data.get("packType")
      staging.SBStage_Ext = data.get("stage")
      staging.DeadlineDate_Ext = SBClaimMapper.parseDate(data.get("deadlineDate"))
      staging.AssignedAdjuster_Ext = data.get("adjuster")
      staging.RawPayload_Ext = rawJson
      staging.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_PENDING
      staging.RetryCount_Ext = 0
      staging.CreatedDate_Ext = new Date()
    })
  }

  private function buildClient() : SBPortalRestClient {
    return new SBPortalRestClient("https://sb-portal.example.com", "", "")
  }
}
