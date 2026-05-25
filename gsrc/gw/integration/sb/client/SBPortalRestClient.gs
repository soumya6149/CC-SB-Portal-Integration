package gw.integration.sb.client

uses gw.api.util.Logger
uses gw.integration.sb.helper.SBIntegrationConstants
uses java.io.BufferedReader
uses java.io.InputStreamReader
uses java.net.HttpURLConnection
uses java.net.URL
uses java.util.Base64

class SBPortalRestClient {
  static final var _logger = Logger.forCategory("SBPortalRestClient")

  private var _baseUrl : String
  private var _authHeader : String

  construct(baseUrl : String, username : String, password : String) {
    _baseUrl = baseUrl
    var creds = Base64.getEncoder().encodeToString((username + ":" + password).Bytes)
    _authHeader = "Basic " + creds
  }

  function get(endpoint : String, params : Map<String, String>) : String {
    var url = buildUrl(endpoint, params)
    var conn : HttpURLConnection = null
    try {
      _logger.info("SB REST GET -> " + url)
      conn = (new URL(url)).openConnection() as HttpURLConnection
      conn.RequestMethod = "GET"
      conn.ConnectTimeout = SBIntegrationConstants.CONNECT_TIMEOUT
      conn.ReadTimeout = SBIntegrationConstants.READ_TIMEOUT
      conn.setRequestProperty("Authorization", _authHeader)
      conn.setRequestProperty("Accept", "application/json")
      conn.connect()
      var status = conn.ResponseCode
      if (status == 200) {
        return readResponse(conn)
      }
      throw new Exception("HTTP " + status + " for " + url)
    } finally {
      if (conn != null) {
        conn.disconnect()
      }
    }
  }

  private function buildUrl(endpoint : String, params : Map<String, String>) : String {
    var sb = new java.lang.StringBuilder(_baseUrl + endpoint)
    if (params != null and not params.Empty) {
      sb.append("?")
      var first = true
      params.eachKeyAndValue(\k, v -> {
        if (not first) {
          sb.append("&")
        }
        first = false
        sb.append(k + "=" + v)
      })
      return sb.toString()
    }
    return sb.toString()
  }

  private function readResponse(conn : HttpURLConnection) : String {
    var reader = new BufferedReader(new InputStreamReader(conn.InputStream))
    var sb = new java.lang.StringBuilder()
    var line = reader.readLine()
    while (line != null) {
      sb.append(line)
      line = reader.readLine()
    }
    reader.close()
    return sb.toString()
  }
}
