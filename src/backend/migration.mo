import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old types — defined inline (copied from .old vendored packages)
  type UserRole = { #admin; #user; #guest };
  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type ApprovalStatus = { #approved; #rejected; #pending };
  type UserApprovalState = {
    var approvalStatus : Map.Map<Principal, ApprovalStatus>;
  };

  type Message = { role : Text; content : Text };

  type OldActor = {
    accessControlState : AccessControlState;
    approvalState : UserApprovalState;
    companionPreferences : Map.Map<Principal, Text>;
    chatHistories : Map.Map<Principal, [Message]>;
  };

  type NewActor = {
    companionPreferences : Map.Map<Principal, Text>;
    chatHistories : Map.Map<Principal, [Message]>;
  };

  // Discard accessControlState and approvalState; preserve companion data
  public func run(old : OldActor) : NewActor {
    {
      companionPreferences = old.companionPreferences;
      chatHistories = old.chatHistories;
    };
  };
};
