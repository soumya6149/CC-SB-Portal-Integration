package gw.integration.sb.helper

class SBIntegrationConstants {
  static property get BASE_URL() : String { return "sb.portal.baseurl" }
  static property get API_USERNAME() : String { return "sb.portal.username" }
  static property get API_PASSWORD() : String { return "sb.portal.password" }
  static property get CONNECT_TIMEOUT() : int { return 30000 }
  static property get READ_TIMEOUT() : int { return 60000 }
  static property get PAGE_SIZE() : int { return 100 }
  static property get BATCH_WINDOW_HOURS() : int { return 24 }
  static property get MAX_RETRIES() : int { return 3 }
  static property get RETRY_BASE_MS() : long { return 2000L }

  static property get STATUS_PENDING() : String { return "PENDING" }
  static property get STATUS_IN_PROGRESS() : String { return "IN_PROGRESS" }
  static property get STATUS_COMPLETED() : String { return "COMPLETED" }
  static property get STATUS_FAILED() : String { return "FAILED" }
  static property get STATUS_DEAD() : String { return "DEAD" }

  static property get TYPE_ASSIGNMENT() : String { return "Assignment" }
  static property get TYPE_MESSAGES() : String { return "Messages" }
  static property get TYPE_MESSAGE() : String { return "Message" }
  static property get TYPE_DOCUMENTS() : String { return "Documents" }
  static property get TYPE_DOCUMENT() : String { return "Document" }
  static property get TYPE_PACK() : String { return "Pack" }
  static property get TYPE_WITHDRAWAL() : String { return "Withdrawal" }
  static property get TYPE_TIMEOUT() : String { return "Timeout" }
}
