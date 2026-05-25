package gw.integration.sb.helper

uses java.util.Date

class SBSummaryRow {

  var _deadlineDate : Date as DeadlineDate_Ext
  var _assignedAdjuster : String as AssignedAdjuster_Ext
  var _totalCount : int as TotalCount
  var _undefinedCount : int as UndefinedCount
  var _withdrawnCount : int as WithdrawnCount
  var _timedOutCount : int as TimedOutCount

  construct(deadlineDate : Date,
            assignedAdjuster : String,
            total : int,
            undefined : int,
            withdrawn : int,
            timedOut : int) {
    _deadlineDate = deadlineDate
    _assignedAdjuster = assignedAdjuster
    _totalCount = total
    _undefinedCount = undefined
    _withdrawnCount = withdrawn
    _timedOutCount = timedOut
  }
}
