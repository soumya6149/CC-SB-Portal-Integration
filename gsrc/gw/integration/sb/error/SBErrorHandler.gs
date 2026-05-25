package gw.integration.sb.error

uses gw.api.util.Logger
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.transaction.Transaction
uses java.util.Date

class SBErrorHandler {
  static final var _logger = Logger.forCategory("SBErrorHandler")

  static function handleFailure(staging : entity.SBClaimMetaData_Ext,
                                 error   : Exception) {
    Transaction.runWithNewBundle(undle -> {
      var record     = bundle.loadBean(staging) as entity.SBClaimMetaData_Ext
      var retryCount = (record.RetryCount_Ext ?: 0) + 1
      record.RetryCount_Ext   = retryCount
      record.ErrorMessage_Ext = error.Message

      if (retryCount < SBIntegrationConstants.MAX_RETRIES) {
        var backoffMs = SBIntegrationConstants.RETRY_BASE_MS * Math.pow(2, retryCount - 1) as long
        _logger.warn("Retry " + retryCount + "/" + SBIntegrationConstants.MAX_RETRIES
            + " ExternalClaimID=" + record.ExternalClaimID_Ext + " backoff=" + backoffMs + "ms")
        Thread.sleep(backoffMs)
        record.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_PENDING
      } else {
        _logger.error("MAX RETRIES exceeded ExternalClaimID=" + record.ExternalClaimID_Ext)
        record.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_DEAD
        writeToErrorTable(record, error)
      }
    })
  }

  private static function writeToErrorTable(staging : entity.SBClaimMetaData_Ext,
                                             error   : Exception) {
    Transaction.runWithNewBundle(undle -> {
      var err = bundle.loadBean(entity.SBClaimError_Ext) as entity.SBClaimError_Ext
      err.ExternalClaimID_Ext  = staging.ExternalClaimID_Ext
      err.RawPayload_Ext       = staging.RawPayload_Ext
      err.ErrorMessage_Ext     = error.Message
      err.RetryCount_Ext       = staging.RetryCount_Ext
      err.FailedDate_Ext       = new Date()
      err.NotificationType_Ext = staging.NotificationType_Ext
    })
  }
}
