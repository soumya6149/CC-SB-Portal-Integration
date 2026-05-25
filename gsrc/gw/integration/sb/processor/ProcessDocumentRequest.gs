package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.integration.sb.client.SBPortalRestClient
uses gw.integration.sb.client.SBPortalEndpoints
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.integration.sb.helper.SBClaimMapper
uses gw.transaction.Transaction
uses java.util.Date

class ProcessDocumentRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessDocumentRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessDocumentRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
    var client   = buildClient()
    var endpoint = SBPortalEndpoints.GET_DOCUMENTS.replace("{claimId}", staging.ExternalClaimID_Ext)
    var response = client.get(endpoint, {})
    var docs     = SBClaimMapper.parseAssignments(response)

    docs.each(\doc -> {
      Transaction.runWithNewBundle(undle -> {
        var newStaging = bundle.loadBean(entity.SBClaimMetaData_Ext) as entity.SBClaimMetaData_Ext
        newStaging.ExternalClaimID_Ext  = staging.ExternalClaimID_Ext
        newStaging.NotificationType_Ext = SBIntegrationConstants.TYPE_DOCUMENT
        newStaging.AttachmentID_Ext     = doc.get("attachmentId")
        newStaging.RawPayload_Ext       = response
        newStaging.ProcessingStatus_Ext = SBIntegrationConstants.STATUS_PENDING
        newStaging.RetryCount_Ext       = 0
        newStaging.CreatedDate_Ext      = new Date()
      })
    })
    _logger.info("Staged " + docs.Count + " documents for ExternalClaimID=" + staging.ExternalClaimID_Ext)
  }

  private function buildClient() : SBPortalRestClient {
    var cfg = gw.plugin.Plugins.get(ISBPortalConfig)
    return new SBPortalRestClient(cfg.BaseUrl, cfg.Username, cfg.Password)
  }
}
