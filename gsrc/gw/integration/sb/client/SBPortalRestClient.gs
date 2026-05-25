package gw.integration.sb.client

uses gw.api.util.Logger
uses gw.integration.sb.helper.SBIntegrationConstants
uses java.net.HttpURLConnection
uses java.net.URL
uses java.io.BufferedReader
uses java.io.InputStreamReader
uses java.util.Base64

class SBPortalRestClient {
  static final var _logger = Logger.forCategory("SBPortalRestClient")

  private var _baseUrl    : String
  private var _authHeader : String

  construct(baseUrl : String, username : String, password : String) {
    _baseUrl    = baseUrl
    var creds   = Base64.getEncoder().encodeToString((username + ":" + password).Bytes)
    _authHeader = "Basic " + creds
  }

  function get(endpoint : String, params : Map<String,String>) : String {
    var url  = buildUrl(endpoint, params)
    var conn : HttpURLConnection = null
    try {
      _logger.info("SB REST GET -> " + url)
      conn = (new URL(url)).openConnection() as HttpURLConnection
      conn.RequestMethod  = "GET"
      conn.ConnectTimeout = SBIntegrationConstants.CONNECT_TIMEOUT
      conn.ReadTimeout    = SBIntegrationConstants.READ_TIMEOUT
      conn.setRequestProperty("Authorization", _authHeader)
      conn.setRequestProperty("Accept", "application/json")
      conn.connect()
      var status = conn.ResponseCode
      if (status == 200) {
        return readResponse(conn)
      } else if (status == 401) {
        _logger.error("SB REST 401 Unauthorized — check Basic Auth credentials")
        throw new Exception("Unauthorized: " + url)
      } else {
        _logger.error("SB REST error status=" + status + " url=" + url)
        throw new Exception("HTTP " + status + " for " + url)
      }
    } finally {
      if (conn != null) conn.disconnect()
    }
  }

  private function buildUrl(endpoint : String, params : Map<String,String>) : String {
    var sb = new java.lang.StringBuilder(_baseUrl + endpoint + "?")
    params.eachKeyAndValue(\k, v -> sb.append(k + "=" + v + "&"))
    return sb.toString().removeEnd("&")
  }

  private function readResponse(conn : HttpURLConnection) : String {
    var reader = new BufferedReader(new InputStreamReader(conn.InputStream))
    var sb     = new java.lang.StringBuilder()
    var line   : String
    while ((line = reader.readLine()) != null) { sb.append(line) }
    reader.close()
    return sb.toString()
  }
}
