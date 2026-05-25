package gw.integration.sb.helper

uses gw.api.util.Logger
uses gw.api.database.Query
uses java.util.Date

class SBClaimMatchingHelper {
  static final var _logger = Logger.forCategory("SBClaimMatchingHelper")

  static function findExistingClaim(policyNumber : String,
                                    lossDate     : Date) : entity.Claim {
    if (policyNumber == null or lossDate == null) return null
    var results = Query.make(entity.Claim)
        .compare("Policy.PolicyNumber", Equals, policyNumber)
        .compare("LossDate", Equals, lossDate)
        .select()
        .toList()

    if (results.Count == 1) {
      _logger.info("Claim matched — PolicyNumber=" + policyNumber + " LossDate=" + lossDate)
      return results.first()
    } else if (results.Count > 1) {
      _logger.warn("Ambiguous match — " + results.Count + " claims for PolicyNumber="
          + policyNumber + " LossDate=" + lossDate + " — flagging for manual review")
      return null
    }
    _logger.info("No match found — PolicyNumber=" + policyNumber + " LossDate=" + lossDate)
    return null
  }

  static function isAmbiguousMatch(policyNumber : String, lossDate : Date) : boolean {
    if (policyNumber == null or lossDate == null) return false
    return Query.make(entity.Claim)
        .compare("Policy.PolicyNumber", Equals, policyNumber)
        .compare("LossDate", Equals, lossDate)
        .select().Count > 1
  }
}
