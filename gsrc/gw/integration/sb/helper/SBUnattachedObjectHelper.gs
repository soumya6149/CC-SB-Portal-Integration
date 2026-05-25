package gw.integration.sb.helper

uses gw.api.util.Logger
uses gw.api.database.Query
uses gw.transaction.Transaction

class SBUnattachedObjectHelper {
  static final var _logger = Logger.forCategory("SBUnattachedObjectHelper")

  static function convertUnattachedObjects(sbClaim : entity.SBClaim_Ext,
                                           ccClaim : entity.Claim) {
    _logger.info("Converting unattached objects for ExternalClaimID=" + sbClaim.ExternalClaimID_Ext)
    Transaction.runWithNewBundle(undle -> {
      var unattachedDocs = Query.make(entity.SBUnattachedDocument_Ext)
          .compare("ExternalClaimID_Ext", Equals, sbClaim.ExternalClaimID_Ext)
          .compare("Converted_Ext", Equals, false)
          .select().toList()

      unattachedDocs.each(\doc -> {
        var note = bundle.loadBean(entity.Note) as entity.Note
        note.Claim       = ccClaim
        note.Subject     = doc.Description_Ext
        note.Body        = doc.RawContent_Ext
        note.AuthorName  = doc.Author_Ext
        var loadedDoc    = bundle.loadBean(doc) as entity.SBUnattachedDocument_Ext
        loadedDoc.Converted_Ext = true
        _logger.debug("Converted unattached doc=" + doc.AttachmentID_Ext)
      })
    })
    _logger.info("Unattached object conversion complete for ExternalClaimID=" + sbClaim.ExternalClaimID_Ext)
  }
}
