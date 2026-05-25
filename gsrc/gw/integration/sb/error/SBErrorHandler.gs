package gw.integration.sb.error

uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.transaction.Transaction
uses java.util.Date

class SBErrorHandler {
  static function handleFailure(staging : entity.SBClaimMetaData_Ext, e : Exception) {
    Transaction.runWithNewBundle(\bundle -> {
      var record = bundle.add(staging)
      record.RetryCount_Ext = record.RetryCount_Ext + 1
      record.ErrorMessage_Ext = e.Message
      record.ProcessingStatus_Ext = record.RetryCount_Ext >= SBIntegrationConstants.MAX_RETRIES
          ? SBIntegrationConstants.STATUS_DEAD
          : SBIntegrationConstants.STATUS_FAILED
      if (record.ProcessingStatus_Ext == SBIntegrationConstants.STATUS_DEAD) {
        var err = new entity.SBClaimError_Ext(bundle)
        err.ExternalClaimID_Ext = record.ExternalClaimID_Ext
        err.NotificationType_Ext = record.NotificationType_Ext
        err.RawPayload_Ext = record.RawPayload_Ext
        err.ErrorMessage_Ext = e.Message
        err.RetryCount_Ext = record.RetryCount_Ext
        err.FailedDate_Ext = new Date()
      }
    })
  }
}
