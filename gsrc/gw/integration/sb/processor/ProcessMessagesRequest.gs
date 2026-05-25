package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.integration.sb.client.SBPortalRestClient
uses gw.integration.sb.client.SBPortalEndpoints
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.integration.sb.helper.SBClaimMapper
uses gw.transaction.Transaction
uses java.util.Date

class ProcessMessagesRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessMessagesRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessMessagesRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
    var client   = buildClient()
    var endpoint = SBPortalEndpoints.GET_MESSAGES.replace("{claimId}", staging.ExternalClaimID_Ext)
    var response = client.get(endpoint, {})
    var messages = SBClaimMapper.parseAssignments(response)

    messages.each(\msg -> {
      var attachmentId = msg.get("attachmentId")
      Transaction.runWithNewBundle(undle -> {
        var newStaging = bundle.loadBean(entity.SBClaimMetaData_Ext) as entity.SBClaimMetaData_Ext
        newStaging.ExternalClaimID_Ext  = staging.ExternalClaimID_Ext
        newStaging.NotificationType_Ext = SBIntegrationConstants.TYPE_MESSAGE
        newStaging.AttachmentID_Ext     = attachmentId
        newStaging.RawPayload_Ext       = response
        newStaging.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_PENDING
        newStaging.RetryCount_Ext       = 0
        newStaging.CreatedDate_Ext      = new Date()
      })
    })
    _logger.info("Staged " + messages.Count + " individual messages for ExternalClaimID="
        + staging.ExternalClaimID_Ext)
  }

  private function buildClient() : SBPortalRestClient {
    var cfg = gw.plugin.Plugins.get(ISBPortalConfig)
    return new SBPortalRestClient(cfg.BaseUrl, cfg.Username, cfg.Password)
  }
}
