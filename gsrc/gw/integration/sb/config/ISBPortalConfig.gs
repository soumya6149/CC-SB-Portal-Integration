package gw.integration.sb.config

interface ISBPortalConfig {

  /** Base URL of the SB Portal REST API */
  property get BaseUrl() : String

  /** Basic auth username */
  property get Username() : String

  /** Basic auth password */
  property get Password() : String

}
