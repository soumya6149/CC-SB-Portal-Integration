package gw.integration.sb.helper

uses gw.api.util.Logger
uses java.text.SimpleDateFormat
uses java.util.Date
uses java.util.Map
uses java.util.HashMap

class SBClaimMapper {
  static final var _logger     = Logger.forCategory("SBClaimMapper")
  static final var DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss"

  static function formatDate(date : Date) : String {
    return new SimpleDateFormat(DATE_FORMAT).format(date)
  }

  static function parseDate(dateStr : String) : Date {
    if (dateStr == null or dateStr.Empty) return null
    try {
      return new SimpleDateFormat(DATE_FORMAT).parse(dateStr)
    } catch (e : Exception) {
      _logger.warn("Failed to parse date: " + dateStr)
      return null
    }
  }

  static function parseAssignments(json : String) : List<Map<String,String>> {
    var results = new java.util.ArrayList<Map<String,String>>()
    // Parse JSON array — each element is an assignment record
    // Using basic JSON parsing for v10 on-prem compatibility
    if (json == null or json.trim().Empty or json.trim() == "[]") return results
    _logger.debug("Parsing assignments JSON length=" + json.length())
    // Production: replace with org.json or Gson library available in CC v10 classpath
    return results
  }

  static function mapToSBClaim(staging : entity.SBClaimMetaData_Ext,
                                claim   : entity.Claim,
                                bundle  : gw.pl.persistence.core.Bundle) : entity.SBClaim_Ext {
    var sbClaim = bundle.loadBean(entity.SBClaim_Ext) as entity.SBClaim_Ext
    sbClaim.ExternalClaimID_Ext      = staging.ExternalClaimID_Ext
    sbClaim.PolicyNumber_Ext         = staging.PolicyNumber_Ext
    sbClaim.ClaimantName_Ext         = staging.ClaimantName_Ext
    sbClaim.PackType_Ext             = staging.PackType_Ext
    sbClaim.SBStage_Ext              = staging.SBStage_Ext
    sbClaim.DeadlineDate_Ext         = staging.DeadlineDate_Ext
    sbClaim.AssignedAdjuster_Ext     = staging.AssignedAdjuster_Ext
    sbClaim.ThirdPartyRefNumber_Ext  = staging.ExternalClaimID_Ext
    sbClaim.CCClaim                  = claim
    return sbClaim
  }
}
