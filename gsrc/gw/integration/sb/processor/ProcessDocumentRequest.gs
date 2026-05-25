package gw.integration.sb.processor

uses gw.api.util.Logger

class ProcessDocumentRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessDocumentRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessDocumentRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
  }
}
