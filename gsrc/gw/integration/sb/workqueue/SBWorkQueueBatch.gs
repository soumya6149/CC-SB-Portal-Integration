package gw.integration.sb.workqueue

uses gw.api.database.Query
uses gw.api.util.Logger
uses gw.processes.BatchProcessBase
uses gw.integration.sb.helper.SBIntegrationConstants
uses java.util.Date

@Export
class SBWorkQueueBatch extends BatchProcessBase {
  static final var _logger = Logger.forCategory("SBWorkQueueBatch")

  construct() {
    super(typekey.BatchProcessType.get("SBWorkQueueBatch"))
  }

  override function doWork() : void {
    _logger.info("SBWorkQueueBatch START " + new Date())
    var pending = Query.make(entity.SBClaimMetaData_Ext)
        .compare("ProcessingStatus_Ext", Equals, SBIntegrationConstants.STATUS_PENDING)
        .select().toList()

    _logger.info("Found " + pending.Count + " PENDING staging records")
    var handler = new SBWorkQueueHandler()
    pending.each(\staging -> handler.handleStaging(staging))
    _logger.info("SBWorkQueueBatch COMPLETE processed=" + pending.Count)
  }
}
