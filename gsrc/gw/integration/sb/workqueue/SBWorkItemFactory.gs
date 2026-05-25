package gw.integration.sb.workqueue

uses gw.api.util.Logger
uses gw.integration.sb.helper.SBIntegrationConstants
uses gw.integration.sb.processor.*

class SBWorkItemFactory {
  static final var _logger = Logger.forCategory("SBWorkItemFactory")

  static function getProcessor(notificationType : String) : ISBRequestProcessor {
    switch (notificationType) {
      case SBIntegrationConstants.TYPE_ASSIGNMENT : return new ProcessAssignmentRequest()
      case SBIntegrationConstants.TYPE_MESSAGES   : return new ProcessMessagesRequest()
      case SBIntegrationConstants.TYPE_MESSAGE    : return new ProcessMessageRequest()
      case SBIntegrationConstants.TYPE_DOCUMENTS  : return new ProcessDocumentRequest()
      case SBIntegrationConstants.TYPE_DOCUMENT   : return new ProcessAttachmentRequest()
      case SBIntegrationConstants.TYPE_PACK       : return new ProcessPackRequest()
      default:
        _logger.warn("Unknown notification type: " + notificationType)
        return null
    }
  }
}
