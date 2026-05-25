package gw.integration.sb.processor

uses gw.api.util.Logger
uses gw.integration.sb.client.SBPortalRestClient
uses gw.integration.sb.client.SBPortalEndpoints
uses gw.integration.sb.helper.SBClaimMatchingHelper
uses gw.integration.sb.helper.SBClaimMapper
uses gw.integration.sb.helper.SBUnattachedObjectHelper
uses gw.transaction.Transaction
uses java.util.Date

class ProcessAssignmentRequest implements ISBRequestProcessor {
  static final var _logger = Logger.forCategory("ProcessAssignmentRequest")

  override function process(staging : entity.SBClaimMetaData_Ext) {
    _logger.info("ProcessAssignmentRequest ExternalClaimID=" + staging.ExternalClaimID_Ext)
    var client   = buildClient()
    var endpoint = SBPortalEndpoints.GET_CLAIM_DETAILS.replace("{claimId}", staging.ExternalClaimID_Ext)
    var response = client.get(endpoint, {})
    var data     = SBClaimMapper.parseAssignments(response)
    if (data.isEmpty()) {
      _logger.warn("No claim details returned for ExternalClaimID=" + staging.ExternalClaimID_Ext)
      return
    }
    var claimData    = data.first()
    var policyNumber = claimData.get("policyNumber") ?: staging.PolicyNumber_Ext
    var lossDateStr  = claimData.get("lossDate")
    var lossDate     = SBClaimMapper.parseDate(lossDateStr)

    var existingClaim = SBClaimMatchingHelper.findExistingClaim(policyNumber, lossDate)
    if (existingClaim != null) {
      updateExistingClaim(existingClaim, staging, claimData)
      SBUnattachedObjectHelper.convertUnattachedObjects(
          buildSBClaimRef(staging), existingClaim)
    } else if (SBClaimMatchingHelper.isAmbiguousMatch(policyNumber, lossDate)) {
      _logger.warn("Ambiguous match — flagging for manual review ExternalClaimID="
          + staging.ExternalClaimID_Ext)
      flagForManualReview(staging)
    } else {
      createNewClaim(staging, claimData, policyNumber, lossDate)
    }
  }

  private function updateExistingClaim(claim   : entity.Claim,
                                        staging : entity.SBClaimMetaData_Ext,
                                        data    : Map<String,String>) {
    Transaction.runWithNewBundle(undle -> {
      var c = bundle.loadBean(claim) as entity.Claim
      if (data.get("lossDescription") != null)  c.Description        = data.get("lossDescription")
      if (data.get("claimantName") != null)      c.MainContact.DisplayName = data.get("claimantName")
      var sbClaim = SBClaimMapper.mapToSBClaim(staging, c, bundle)
      sbClaim.ThirdPartyRefNumber_Ext = staging.ExternalClaimID_Ext
      var note        = bundle.loadBean(entity.Note) as entity.Note
      note.Claim      = c
      note.Subject    = "SB Claim Updated"
      note.Body       = "Claim updated from SB Portal — ExternalClaimID=" + staging.ExternalClaimID_Ext
      note.AuthorName = "SB Integration"
    })
    _logger.info("Existing claim UPDATED PublicID=" + claim.PublicID)
  }

  private function createNewClaim(staging      : entity.SBClaimMetaData_Ext,
                                   data         : Map<String,String>,
                                   policyNumber : String,
                                   lossDate     : java.util.Date) {
    Transaction.runWithNewBundle(undle -> {
      var claim            = bundle.loadBean(entity.Claim) as entity.Claim
      claim.LossDate       = lossDate
      claim.Description    = data.get("lossDescription") ?: "SB Portal Claim"
      var sbClaim          = SBClaimMapper.mapToSBClaim(staging, claim, bundle)
      sbClaim.ThirdPartyRefNumber_Ext = staging.ExternalClaimID_Ext
      _logger.info("New claim CREATED from SB ExternalClaimID=" + staging.ExternalClaimID_Ext)
    })
  }

  private function flagForManualReview(staging : entity.SBClaimMetaData_Ext) {
    Transaction.runWithNewBundle(undle -> {
      var record = bundle.loadBean(staging) as entity.SBClaimMetaData_Ext
      record.SBStage_Ext          = "MANUAL_REVIEW"
      record.ProcessingStatus_Ext = "PENDING_REVIEW"
    })
  }

  private function buildSBClaimRef(staging : entity.SBClaimMetaData_Ext) : entity.SBClaim_Ext {
    return gw.api.database.Query.make(entity.SBClaim_Ext)
        .compare("ExternalClaimID_Ext", Equals, staging.ExternalClaimID_Ext)
        .select().FirstResult
  }

  private function buildClient() : SBPortalRestClient {
    var cfg = gw.plugin.Plugins.get(ISBPortalConfig)
    return new SBPortalRestClient(cfg.BaseUrl, cfg.Username, cfg.Password)
  }
}
