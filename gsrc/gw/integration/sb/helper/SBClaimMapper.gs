package gw.integration.sb.helper

uses gw.api.util.Logger
uses java.text.SimpleDateFormat
uses java.util.Date
uses java.util.Map

class SBClaimMapper {
  static final var _logger = Logger.forCategory("SBClaimMapper")
  static final var DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss"

  static function formatDate(date : Date) : String {
    return new SimpleDateFormat(DATE_FORMAT).format(date)
  }

  static function parseDate(dateStr : String) : Date {
    if (dateStr == null or dateStr.Empty) {
      return null
    }
    try {
      return new SimpleDateFormat(DATE_FORMAT).parse(dateStr)
    } catch (e : Exception) {
      _logger.warn("Failed to parse date: " + dateStr)
      return null
    }
  }

  static function parseAssignments(json : String) : List<Map<String, String>> {
    return new java.util.ArrayList<Map<String, String>>()
  }

  static function mapToSBClaim(staging : entity.SBClaimMetaData_Ext,
                               claim : entity.Claim,
                               bundle : gw.pl.persistence.core.Bundle) : entity.SBClaim_Ext {
    var sbClaim = new entity.SBClaim_Ext(bundle)
    sbClaim.ExternalClaimID_Ext = staging.ExternalClaimID_Ext
    sbClaim.PolicyNumber_Ext = staging.PolicyNumber_Ext
    sbClaim.ClaimantName_Ext = staging.ClaimantName_Ext
    sbClaim.PackType_Ext = staging.PackType_Ext
    sbClaim.SBStage_Ext = staging.SBStage_Ext
    sbClaim.DeadlineDate_Ext = staging.DeadlineDate_Ext
    sbClaim.AssignedAdjuster_Ext = staging.AssignedAdjuster_Ext
    sbClaim.ThirdPartyRefNumber_Ext = staging.ExternalClaimID_Ext
    sbClaim.CCClaim = claim
    return sbClaim
  }
}
