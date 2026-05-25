package gw.integration.sb.client

class SBPortalEndpoints {
  static property get GET_ASSIGNMENTS() : String { return "/api/v1/assignments" }
  static property get GET_CLAIM_DETAILS() : String { return "/api/v1/claims/{claimId}" }
  static property get GET_NOTIFICATIONS() : String { return "/api/v1/notifications" }
  static property get GET_MESSAGES() : String { return "/api/v1/claims/{claimId}/messages" }
  static property get GET_MESSAGE() : String { return "/api/v1/messages/{attachmentId}" }
  static property get GET_DOCUMENTS() : String { return "/api/v1/claims/{claimId}/documents" }
  static property get GET_DOCUMENT() : String { return "/api/v1/documents/{attachmentId}" }
}
