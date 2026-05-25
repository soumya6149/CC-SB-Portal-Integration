package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.transaction.Transaction

class ProcessPackRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessPackRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessPackRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
    Transaction.runWithNewBundle(\bundle -> {
      var record = bundle.add(staging)
      record.PackType_Ext = staging.PackType_Ext
    })
  }
}
