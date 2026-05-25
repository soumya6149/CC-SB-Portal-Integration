package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.transaction.Transaction

class ProcessPackRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessPackRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessPackRequest ExternalClaimID=" + staging.ExternalClaimID_Ext
        + " PackType=" + staging.PackType_Ext)
    var sbClaim = gw.api.database.Query.make(entity.SBClaim_Ext)
        .compare("ExternalClaimID_Ext", Equals, staging.ExternalClaimID_Ext)
        .select().FirstResult

    if (sbClaim == null) {
      _logger.warn("SBClaim not found for PackType processing ExternalClaimID="
          + staging.ExternalClaimID_Ext)
      return
    }

    Transaction.runWithNewBundle(undle -> {
      var claim = bundle.loadBean(sbClaim) as entity.SBClaim_Ext
      claim.PackType_Ext = staging.PackType_Ext
      claim.SBStage_Ext  = "PACK_RECEIVED"
      if (sbClaim.CCClaim != null) {
        var note        = bundle.loadBean(entity.Note) as entity.Note
        note.Claim      = sbClaim.CCClaim
        note.Subject    = "SB Pack Received"
        note.Body       = "Pack type '" + staging.PackType_Ext + "' received from SB Portal"
        note.AuthorName = "SB Integration"
      }
    })
    _logger.info("Pack processed ExternalClaimID=" + staging.ExternalClaimID_Ext
        + " PackType=" + staging.PackType_Ext)
  }
}
