package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.transaction.Transaction

class ProcessAssignmentRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessAssignmentRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessAssignmentRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
    Transaction.runWithNewBundle(\bundle -> {
      var record = bundle.add(staging)
      record.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_COMPLETED
    })
  }
}
