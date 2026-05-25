package gw.integration.sb.screen

uses entity.SBClaim_Ext

class SBIncidentScreen {

  var _sbClaim  : SBClaim_Ext as SBClaim
  var _editing  : boolean

  construct(sbClaim : SBClaim_Ext) {
    _sbClaim = sbClaim
    _editing = false
  }

  function beginEditing() {
    _editing = true
  }

  function commit() {
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      bundle.add(_sbClaim)
    })
    _editing = false
  }

}
