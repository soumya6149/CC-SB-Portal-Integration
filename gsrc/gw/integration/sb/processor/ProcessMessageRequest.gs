package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.integration.sb.client.SBPortalRestClient
uses gw.integration.sb.client.SBPortalEndpoints
uses gw.integration.sb.helper.SBClaimMapper
uses gw.transaction.Transaction

class ProcessMessageRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessMessageRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessMessageRequest attachmentID=" + staging.AttachmentID_Ext)
    var client   = buildClient()
    var endpoint = SBPortalEndpoints.GET_MESSAGE.replace("{attachmentId}", staging.AttachmentID_Ext)
    var response = client.get(endpoint, {})
    var data     = SBClaimMapper.parseAssignments(response)
    if (data.isEmpty()) return

    var msgData  = data.first()
    var sbClaim  = gw.api.database.Query.make(entity.SBClaim_Ext)
        .compare("ExternalClaimID_Ext", Equals, staging.ExternalClaimID_Ext)
        .select().FirstResult

    if (sbClaim != null and sbClaim.CCClaim != null) {
      Transaction.runWithNewBundle(undle -> {
        var note        = bundle.loadBean(entity.Note) as entity.Note
        note.Claim      = sbClaim.CCClaim
        note.Subject    = msgData.get("subject") ?: "SB Message"
        note.Body       = msgData.get("body") ?: ""
        note.AuthorName = msgData.get("author") ?: "SB Portal"
      })
      _logger.info("Message attached to CCClaim ExternalClaimID=" + staging.ExternalClaimID_Ext)
    } else {
      storeUnattached(staging, msgData)
    }
  }

  private function storeUnattached(staging : entity.SBClaimMetaData_Ext,
                                    data    : Map<String,String>) {
    Transaction.runWithNewBundle(undle -> {
      var unattached = bundle.loadBean(entity.SBUnattachedDocument_Ext) as entity.SBUnattachedDocument_Ext
      unattached.ExternalClaimID_Ext = staging.ExternalClaimID_Ext
      unattached.AttachmentID_Ext    = staging.AttachmentID_Ext
      unattached.Description_Ext     = data.get("subject") ?: "SB Message"
      unattached.RawContent_Ext      = data.get("body") ?: ""
      unattached.Author_Ext          = data.get("author") ?: "SB Portal"
      unattached.Converted_Ext       = false
    })
    _logger.info("Stored unattached message ExternalClaimID=" + staging.ExternalClaimID_Ext)
  }

  private function buildClient() : SBPortalRestClient {
    var cfg = gw.plugin.Plugins.get(ISBPortalConfig)
    return new SBPortalRestClient(cfg.BaseUrl, cfg.Username, cfg.Password)
  }
}
