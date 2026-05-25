package gw.integration.sb.client

class SBPortalEndpoints {
  static final var GET_ASSIGNMENTS   : String = "/api/v1/assignments"
  static final var GET_CLAIM_DETAILS : String = "/api/v1/claims/{claimId}"
  static final var GET_NOTIFICATIONS : String = "/api/v1/notifications"
  static final var GET_MESSAGES      : String = "/api/v1/claims/{claimId}/messages"
  static final var GET_MESSAGE       : String = "/api/v1/messages/{attachmentId}"
  static final var GET_DOCUMENTS     : String = "/api/v1/claims/{claimId}/documents"
  static final var GET_DOCUMENT      : String = "/api/v1/documents/{attachmentId}"
}
