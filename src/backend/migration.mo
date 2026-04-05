import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type Message = {
    role : Text;
    content : Text;
  };

  type NewActor = {
    companionPreferences : Map.Map<Principal, Text>;
    chatHistories : Map.Map<Principal, [Message]>;
  };

  public func run(_old : {}) : NewActor {
    {
      companionPreferences = Map.empty<Principal, Text>();
      chatHistories = Map.empty<Principal, [Message]>();
    };
  };
};
