package gw.integration.sb.workqueue

uses gw.api.util.Logger
uses gw.api.database.Query
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.plugin.batch.PluginBatchProcessBase
uses gw.plugin.batch.BatchProcessInfo
uses gw.transaction.Transaction
uses java.util.Date

class SBWorkQueueBatch extends PluginBatchProcessBase {
  static final var _logger = Logger.forCategory("SBWorkQueueBatch")

  override function runBatch(info : BatchProcessInfo) {
    _logger.info("SBWorkQueueBatch START " + new Date())
    var pending = Query.make(entity.SBClaimMetaData_Ext)
        .compare("ProcessingStatus_Ext", Equals, SBIntegrationConstants.STATUS_PENDING)
        .select().toList()

    _logger.info("Found " + pending.Count + " PENDING staging records")
    pending.each(\staging -> enqueueWorkItem(staging))
    _logger.info("SBWorkQueueBatch COMPLETE — enqueued=" + pending.Count)
  }

  private function enqueueWorkItem(staging : entity.SBClaimMetaData_Ext) {
    Transaction.runWithNewBundle(undle -> {
      var record = bundle.loadBean(staging) as entity.SBClaimMetaData_Ext
      record.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_IN_PROGRESS
      var workItem = bundle.loadBean(entity.WorkItem) as entity.WorkItem
      workItem.StagingID_Ext          = staging.PublicID
      workItem.NotificationType_Ext   = staging.NotificationType_Ext
      workItem.ExternalClaimID_Ext    = staging.ExternalClaimID_Ext
      _logger.debug("Enqueued WorkItem for ExternalClaimID=" + staging.ExternalClaimID_Ext)
    })
  }
}
