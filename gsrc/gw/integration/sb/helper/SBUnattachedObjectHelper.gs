package gw.integration.sb.helper

uses gw.api.util.Logger

class SBUnattachedObjectHelper {
  static final var _logger = Logger.forCategory("SBUnattachedObjectHelper")

  static function convertUnattachedObjects(sbClaim : entity.SBClaim_Ext, claim : entity.Claim) {
    _logger.info("Skipping unattached object conversion for ExternalClaimID=" + sbClaim.ExternalClaimID_Ext)
  }
}
