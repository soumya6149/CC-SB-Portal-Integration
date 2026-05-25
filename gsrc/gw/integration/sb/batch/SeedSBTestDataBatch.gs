package gw.integration.sb.batch

uses gw.api.database.Query
uses gw.api.util.Logger
uses gw.processes.BatchProcessBase
uses gw.transaction.Transaction
uses java.util.Calendar
uses java.util.Date

@Export
class SeedSBTestDataBatch extends BatchProcessBase {
  static final var _logger = Logger.forCategory("SeedSBTestDataBatch")

  construct() {
    super(typekey.BatchProcessType.get("SeedSBTestDataBatch"))
  }

  override function doWork() : void {
    _logger.info("SeedSBTestDataBatch START")
    Transaction.runWithNewBundle(\bundle -> {
      seedClaim(bundle, "SB-CLM-100001", "PORTAL-REF-90001", "P-10004567", "Avery Johnson", "Third Party Damage", "New", 1, "Super User")
      seedClaim(bundle, "SB-CLM-100002", "PORTAL-REF-90002", "P-10007891", "Morgan Smith", "Medical Evidence", "TimedOut", 0, "Super User")
      seedClaim(bundle, "SB-CLM-100003", "PORTAL-REF-90003", "P-10009912", "Jordan Patel", "Liability Response", "Undefined", 2, "Super User")
      seedClaim(bundle, "SB-CLM-100004", "PORTAL-REF-90004", "P-10003321", "Casey Brown", "Third Party Damage", "Withdrawn", 3, "Super User")

      seedDocument(bundle, "SB-CLM-100001", "MSG-50001", "Message - claimant provided additional injury details", "SB Portal User", "The claimant reports neck pain and has requested follow-up.")
      seedDocument(bundle, "SB-CLM-100001", "DOC-70001", "Document - medical report", "SB Portal User", "Sample medical report content for local UI testing.")
      seedDocument(bundle, "SB-CLM-100002", "MSG-50002", "Message - response deadline missed", "SB Portal User", "This injury claim has timed out and needs handler review.")
      seedDocument(bundle, "SB-CLM-100003", "DOC-70003", "Document - undefined instruction pack", "SB Portal User", "Pack type could not be identified from the portal instruction.")
    })
    _logger.info("SeedSBTestDataBatch COMPLETE")
  }

  private function seedClaim(bundle : gw.pl.persistence.core.Bundle,
                             externalId : String,
                             portalRef : String,
                             policyNumber : String,
                             claimantName : String,
                             packType : String,
                             stage : String,
                             deadlineOffsetDays : int,
                             adjuster : String) {
    var existing = Query.make(entity.SBClaim_Ext)
        .compare("ExternalClaimID_Ext", Equals, externalId)
        .select()
        .toList()

    var sbClaim : entity.SBClaim_Ext
    if (existing.Count > 0) {
      sbClaim = bundle.add(existing.first())
      _logger.info("Updating existing SB test claim " + externalId)
    } else {
      sbClaim = new entity.SBClaim_Ext(bundle)
      sbClaim.ExternalClaimID_Ext = externalId
      _logger.info("Creating SB test claim " + externalId)
    }

    sbClaim.ThirdPartyRefNumber_Ext = portalRef
    sbClaim.PolicyNumber_Ext = policyNumber
    sbClaim.ClaimantName_Ext = claimantName
    sbClaim.PackType_Ext = packType
    sbClaim.SBStage_Ext = stage
    sbClaim.DeadlineDate_Ext = datePlusDays(deadlineOffsetDays)
    sbClaim.AssignedAdjuster_Ext = adjuster
  }

  private function seedDocument(bundle : gw.pl.persistence.core.Bundle,
                                externalId : String,
                                attachmentId : String,
                                description : String,
                                author : String,
                                content : String) {
    var existing = Query.make(entity.SBUnattachedDocument_Ext)
        .compare("AttachmentID_Ext", Equals, attachmentId)
        .select()
        .toList()

    var doc : entity.SBUnattachedDocument_Ext
    if (existing.Count > 0) {
      doc = bundle.add(existing.first())
      _logger.info("Updating existing SB test document " + attachmentId)
    } else {
      doc = new entity.SBUnattachedDocument_Ext(bundle)
      doc.AttachmentID_Ext = attachmentId
      _logger.info("Creating SB test document " + attachmentId)
    }

    doc.ExternalClaimID_Ext = externalId
    doc.Description_Ext = description
    doc.Author_Ext = author
    doc.RawContent_Ext = content
    doc.Converted_Ext = false
  }

  private function datePlusDays(days : int) : Date {
    var calendar = Calendar.getInstance()
    calendar.add(Calendar.DAY_OF_MONTH, days)
    return calendar.Time
  }
}
