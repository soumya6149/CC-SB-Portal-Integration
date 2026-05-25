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
class RetrieveNotificationsBatch extends BatchProcessBase {
  static final var _logger = Logger.forCategory("RetrieveNotificationsBatch")

  construct() {
    super(typekey.BatchProcessType.get("RetrieveNotificationsBatch"))
  }

  override function doWork() : void {
    _logger.info("RetrieveNotificationsBatch START " + new Date())
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
      var response = client.get(SBPortalEndpoints.GET_NOTIFICATIONS, params)
      var notifications = SBClaimMapper.parseAssignments(response)
      if (notifications.isEmpty()) {
        hasMore = false
      } else {
        notifications.each(\n -> stageNotification(n, response))
        total += notifications.Count
        _logger.info("Page " + page + " - " + notifications.Count + " notifications staged")
        page++
      }
    }
    _logger.info("RetrieveNotificationsBatch COMPLETE total=" + total)
  }

  private function stageNotification(data : Map<String, String>, rawJson : String) {
    var externalId = data.get("claimId")
    var notificationType = data.get("notificationType") ?: SBIntegrationConstants.TYPE_MESSAGES
    Transaction.runWithNewBundle(\bundle -> {
      var staging = new entity.SBClaimMetaData_Ext(bundle)
      staging.ExternalClaimID_Ext = externalId
      staging.NotificationType_Ext = notificationType
      staging.AttachmentID_Ext = data.get("attachmentId")
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
