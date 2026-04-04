import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";

actor {
  // COMPONENT: Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // COMPONENT: Approval-based user management
  let approvalState = UserApproval.initState(accessControlState);

  // Check if any admin has been assigned yet
  public query func hasAnyAdmin() : async Bool {
    accessControlState.adminAssigned;
  };

  // Claim admin rights -- only works if no admins exist yet (first-time setup)
  public shared ({ caller }) func claimAdmin() : async Bool {
    if (accessControlState.adminAssigned) {
      return false; // Admin already exists, cannot claim
    };
    if (caller.isAnonymous()) {
      return false;
    };
    // Use initialize with matching tokens so the caller becomes admin
    AccessControl.initialize(accessControlState, caller, "setup", "setup");
    true;
  };

  // COMPONENT: Approval check
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };
};
