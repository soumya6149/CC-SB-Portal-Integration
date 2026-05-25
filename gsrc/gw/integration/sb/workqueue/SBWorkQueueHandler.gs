package gw.integration.sb.workqueue

uses gw.api.util.Logger
uses gw.api.database.Query
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.integration.sb.error.SBErrorHandler
uses gw.plugin.workqueue.IWorkQueueMessageHandler
uses gw.transaction.Transaction
uses java.util.Date

class SBWorkQueueHandler implements IWorkQueueMessageHandler {
  static final var _logger = Logger.forCategory("SBWorkQueueHandler")

  override function handleWorkItem(workItem : entity.WorkItem) {
    var externalId = workItem.ExternalClaimID_Ext
    var type       = workItem.NotificationType_Ext
    _logger.info("Processing WorkItem ExternalClaimID=" + externalId + " type=" + type)

    var staging = Query.make(entity.SBClaimMetaData_Ext)
        .compare("ExternalClaimID_Ext", Equals, externalId)
        .compare("NotificationType_Ext", Equals, type)
        .compare("ProcessingStatus_Ext", Equals, SBIntegrationConstants.STATUS_IN_PROGRESS)
        .select().FirstResult

    if (staging == null) {
      _logger.warn("No IN_PROGRESS staging record for ExternalClaimID=" + externalId)
      return
    }

    try {
      var processor = SBWorkItemFactory.getProcessor(type)
      if (processor == null) {
        _logger.warn("No processor for type=" + type + " skipping")
        markCompleted(staging)
        return
      }
      processor.process(staging)
      markCompleted(staging)
      _logger.info("WorkItem COMPLETED ExternalClaimID=" + externalId)
    } catch (e : Exception) {
      _logger.error("WorkItem FAILED ExternalClaimID=" + externalId + ": " + e.Message, e)
      SBErrorHandler.handleFailure(staging, e)
    }
  }

  private function markCompleted(staging : entity.SBClaimMetaData_Ext) {
    Transaction.runWithNewBundle(undle -> {
      var record = bundle.loadBean(staging) as entity.SBClaimMetaData_Ext
      record.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_COMPLETED
      record.ProcessedDate_Ext    = new Date()
    })
  }
}
