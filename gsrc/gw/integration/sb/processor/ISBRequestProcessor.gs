package gw.integration.sb.processor

interface ISBRequestProcessor {
  function process(staging : entity.SBClaimMetaData_Ext)
}
