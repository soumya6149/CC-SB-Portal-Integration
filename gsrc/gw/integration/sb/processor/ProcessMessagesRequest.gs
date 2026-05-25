package gw.integration.sb.processor

uses gw.api.util.Logger

class ProcessMessagesRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessMessagesRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessMessagesRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
  }
}
