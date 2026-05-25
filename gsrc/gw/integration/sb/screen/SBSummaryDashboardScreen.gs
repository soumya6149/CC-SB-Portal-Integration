package gw.integration.sb.screen

uses gw.integration.sb.helper.SBSummaryRow
uses entity.SBClaim_Ext
uses typekey.SBStage_Ext
uses typekey.SBPackType_Ext

class SBSummaryDashboardScreen {

  var _selectedSBStage  : String     as SelectedSBStageCode
  var _selectedPackType : String     as SelectedPackTypeCode
  var _drilldownVisible  : boolean        as DrilldownVisible
  var _drilldownClaims   : SBClaim_Ext[]  as DrilldownClaims

  function refresh() {
    _drilldownVisible = false
    _drilldownClaims  = null
  }

  property get SBSummaryRows() : SBSummaryRow[] {
    var query = gw.api.database.Query.make(SBClaim_Ext)
    if (_selectedSBStage != null) {
      query.compare("SBStage_Ext", Equals, _selectedSBStage)
    }
    if (_selectedPackType != null) {
      query.compare("PackType_Ext", Equals, _selectedPackType)
    }
    var claims = query.select().toTypedArray()

    // Group by DeadlineDate + Adjuster
    var grouped = claims.partition(\c -> c.DeadlineDate_Ext.toString().substring(0, 10) + "|" + c.AssignedAdjuster_Ext)
    return grouped.entrySet().map(\e -> {
      var rows   = e.Value
      var first  = rows.first()
      return new SBSummaryRow(
        first.DeadlineDate_Ext,
        first.AssignedAdjuster_Ext,
        rows.Count,
        rows.where(\c -> c.SBStage_Ext == "Undefined").Count,
        rows.where(\c -> c.SBStage_Ext == "Withdrawn").Count,
        rows.where(\c -> c.SBStage_Ext == "TimedOut").Count
      )
    }).toTypedArray()
  }

  function drillDown(summaryRow : SBSummaryRow) {
    _drilldownClaims  = gw.api.database.Query.make(SBClaim_Ext)
        .compare("AssignedAdjuster_Ext", Equals, summaryRow.AssignedAdjuster_Ext)
        .select().toTypedArray()
    _drilldownVisible = true
  }

}
