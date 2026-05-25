package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.integration.sb.client.SBPortalRestClient
uses gw.integration.sb.client.SBPortalEndpoints
uses gw.integration.sb.helper.SBClaimMapper
uses gw.transaction.Transaction

class ProcessAttachmentRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessAttachmentRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessAttachmentRequest attachmentID=" + staging.AttachmentID_Ext)
    var client   = buildClient()
    var endpoint = SBPortalEndpoints.GET_DOCUMENT.replace("{attachmentId}", staging.AttachmentID_Ext)
    var response = client.get(endpoint, {})
    var data     = SBClaimMapper.parseAssignments(response)
    if (data.isEmpty()) return

    var docData = data.first()
    var sbClaim = gw.api.database.Query.make(entity.SBClaim_Ext)
        .compare("ExternalClaimID_Ext", Equals, staging.ExternalClaimID_Ext)
        .select().FirstResult

    if (sbClaim != null and sbClaim.CCClaim != null) {
      Transaction.runWithNewBundle(undle -> {
        var doc         = bundle.loadBean(entity.Document) as entity.Document
        doc.Claim       = sbClaim.CCClaim
        doc.Name        = docData.get("fileName") ?: "SB Document"
        doc.MimeType    = docData.get("mimeType") ?: "application/octet-stream"
        doc.Author      = docData.get("author") ?: "SB Portal"
        doc.Description = docData.get("description") ?: ""
      })
      _logger.info("Document attached ExternalClaimID=" + staging.ExternalClaimID_Ext)
    } else {
      storeUnattached(staging, docData)
    }
  }

  private function storeUnattached(staging : entity.SBClaimMetaData_Ext,
                                    data    : Map<String,String>) {
    Transaction.runWithNewBundle(undle -> {
      var unattached = bundle.loadBean(entity.SBUnattachedDocument_Ext) as entity.SBUnattachedDocument_Ext
      unattached.ExternalClaimID_Ext = staging.ExternalClaimID_Ext
      unattached.AttachmentID_Ext    = staging.AttachmentID_Ext
      unattached.Description_Ext     = data.get("description") ?: "SB Document"
      unattached.RawContent_Ext      = data.get("content") ?: ""
      unattached.Author_Ext          = data.get("author") ?: "SB Portal"
      unattached.Converted_Ext       = false
    })
    _logger.info("Stored unattached document ExternalClaimID=" + staging.ExternalClaimID_Ext)
  }

  private function buildClient() : SBPortalRestClient {
    var cfg = gw.plugin.Plugins.get(ISBPortalConfig)
    return new SBPortalRestClient(cfg.BaseUrl, cfg.Username, cfg.Password)
  }
}
