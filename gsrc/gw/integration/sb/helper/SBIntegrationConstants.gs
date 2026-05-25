package gw.integration.sb.helper

class SBIntegrationConstants {
  static final var BASE_URL            : String = "sb.portal.baseurl"
  static final var API_USERNAME        : String = "sb.portal.username"
  static final var API_PASSWORD        : String = "sb.portal.password"
  static final var CONNECT_TIMEOUT     : int    = 30000
  static final var READ_TIMEOUT        : int    = 60000
  static final var PAGE_SIZE           : int    = 100
  static final var BATCH_WINDOW_HOURS  : int    = 24
  static final var MAX_RETRIES         : int    = 3
  static final var RETRY_BASE_MS       : long   = 2000L

  static final var STATUS_PENDING      : String = "PENDING"
  static final var STATUS_IN_PROGRESS  : String = "IN_PROGRESS"
  static final var STATUS_COMPLETED    : String = "COMPLETED"
  static final var STATUS_FAILED       : String = "FAILED"
  static final var STATUS_DEAD         : String = "DEAD"

  static final var TYPE_ASSIGNMENT     : String = "Assignment"
  static final var TYPE_MESSAGES       : String = "Messages"
  static final var TYPE_MESSAGE        : String = "Message"
  static final var TYPE_DOCUMENTS      : String = "Documents"
  static final var TYPE_DOCUMENT       : String = "Document"
  static final var TYPE_PACK           : String = "Pack"
  static final var TYPE_WITHDRAWAL     : String = "Withdrawal"
  static final var TYPE_TIMEOUT        : String = "Timeout"
}
