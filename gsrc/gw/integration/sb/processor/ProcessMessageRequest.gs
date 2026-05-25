package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.transaction.Transaction

class ProcessMessageRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessMessageRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessMessageRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
    Transaction.runWithNewBundle(\bundle -> {
      var unattached = new entity.SBUnattachedDocument_Ext(bundle)
      unattached.ExternalClaimID_Ext = staging.ExternalClaimID_Ext
      unattached.AttachmentID_Ext = staging.AttachmentID_Ext
      unattached.Description_Ext = "SB Message"
      unattached.RawContent_Ext = staging.RawPayload_Ext
      unattached.Converted_Ext = false
    })
  }
}
