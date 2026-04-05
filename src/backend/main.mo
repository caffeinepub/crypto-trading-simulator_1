import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Migration "migration";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Outcall "http-outcalls/outcall";
import UserApproval "user-approval/approval";

(with migration = Migration.run)
actor {
  // COMPONENT: Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // COMPONENT: Approval-based user management
  let approvalState = UserApproval.initState(accessControlState);

  // HTTP transform for outcalls
  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // Persistent user data
  let companionPreferences = Map.empty<Principal, Text>();
  let chatHistories = Map.empty<Principal, [Message]>();

  type Message = {
    role : Text;
    content : Text;
  };

  public shared ({ caller }) func saveCompanionPreference(preference : Text) : async () {
    requireApprovedUser(caller);
    companionPreferences.add(caller, preference);
  };

  public query ({ caller }) func getCompanionPreference() : async ?Text {
    requireApprovedUser(caller);
    companionPreferences.get(caller);
  };

  public shared ({ caller }) func saveChatHistory(history : [Message]) : async () {
    requireApprovedUser(caller);
    chatHistories.add(caller, history);
  };

  public query ({ caller }) func getChatHistory() : async [Message] {
    requireApprovedUser(caller);
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
    if (not isAdmin(principal)) {
      Runtime.trap("Unauthorized: Only admins can access this data");
    };
  };

  func requireApprovedUser(principal : Principal) {
    if (not isApprovedUser(principal)) {
      Runtime.trap("Unauthorized: Must be an approved user");
    };
  };

  func isApprovedUser(principal : Principal) : Bool {
    isAdmin(principal) or UserApproval.isApproved(approvalState, principal);
  };

  func isAdmin(principal : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, principal, #admin);
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    isApprovedUser(caller);
  };

  // User approval API
  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can approve users");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view approval list");
    };
    UserApproval.listApprovals(approvalState);
  };
};
