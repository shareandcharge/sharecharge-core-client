enum CommandState {
  RequestSent = 1,
  RequestConfirmed,
  SessionStarted
}

class RequestTracker {

  private requests = new Map<string, CommandState>();

}

module.exports.CommandState = CommandState;
module.exports.RequestTracker = new RequestTracker();