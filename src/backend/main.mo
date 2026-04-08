import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Persistent user data - keyed by Principal (works for anonymous users too)
  let companionPreferences = Map.empty<Principal, Text>();
  let chatHistories = Map.empty<Principal, [Message]>();

  type Message = {
    role : Text;
    content : Text;
  };

  // HTTP transform for outcalls - strips response headers to ensure determinism
  type HttpHeader = { name : Text; value : Text };
  type HttpResponse = { status : Nat; headers : [HttpHeader]; body : Blob };
  type TransformArgs = { response : HttpResponse; context : Blob };

  public query func transform(args : TransformArgs) : async HttpResponse {
    { args.response with headers = [] };
  };

  public shared ({ caller }) func saveCompanionPreference(preference : Text) : async () {
    companionPreferences.add(caller, preference);
  };

  public query ({ caller }) func getCompanionPreference() : async ?Text {
    companionPreferences.get(caller);
  };

  public shared ({ caller }) func saveChatHistory(history : [Message]) : async () {
    chatHistories.add(caller, history);
  };

  public query ({ caller }) func getChatHistory() : async [Message] {
    switch (chatHistories.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };
  };
};
