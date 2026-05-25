package gw.integration.sb.workqueue

uses gw.api.util.Logger
uses gw.integration.sb.error.SBErrorHandler
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.transaction.Transaction
uses java.util.Date

class SBWorkQueueHandler {
  static final var _logger = Logger.forCategory("SBWorkQueueHandler")

  function handleStaging(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("Processing SB staging ExternalClaimID=" + staging.ExternalClaimID_Ext + " type=" + staging.NotificationType_Ext)
    try {
      var processor = SBWorkItemFactory.getProcessor(staging.NotificationType_Ext)
      if (processor == null) {
        _logger.warn("No processor for type=" + staging.NotificationType_Ext + " skipping")
        markCompleted(staging)
        return
      }
      processor.process(staging)
      markCompleted(staging)
      _logger.info("SB staging COMPLETED ExternalClaimID=" + staging.ExternalClaimID_Ext)
    } catch (e : Exception) {
      _logger.error("SB staging FAILED ExternalClaimID=" + staging.ExternalClaimID_Ext + ": " + e.Message, e)
      SBErrorHandler.handleFailure(staging, e)
    }
  }

  private function markCompleted(staging : entity.SBClaimMetaData_Ext) {
    Transaction.runWithNewBundle(\bundle -> {
      var record = bundle.add(staging)
      record.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_COMPLETED
      record.ProcessedDate_Ext = new Date()
    })
  }
}
