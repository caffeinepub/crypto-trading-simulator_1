import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Outcall "http-outcalls/outcall";
import UserApproval "user-approval/approval";

actor {
  // COMPONENT: Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Retained for stable variable compatibility (was used in previous version)
  let approvalState = UserApproval.initState(accessControlState);

  // HTTP transform for outcalls
  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // Persistent user data - keyed by Principal (works for anonymous too)
  let companionPreferences = Map.empty<Principal, Text>();
  let chatHistories = Map.empty<Principal, [Message]>();

  type Message = {
    role : Text;
    content : Text;
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

  public query ({ caller }) func getAllCompanionPreferences() : async [Text] {
    requireAdmin(caller);
    companionPreferences.values().toArray();
  };

  public query ({ caller }) func getAllChatHistories() : async [[Message]] {
    requireAdmin(caller);
    chatHistories.values().toArray();
  };

  public query ({ caller }) func getAllUserChatHistories() : async [(Principal, [Message])] {
    requireAdmin(caller);
    chatHistories.toArray();
  };

  func requireAdmin(principal : Principal) {
    if (not AccessControl.hasPermission(accessControlState, principal, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access this data");
    };
  };
};
