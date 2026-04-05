import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Message {
    content: string;
    role: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllChatHistories(): Promise<Array<Array<Message>>>;
    getAllCompanionPreferences(): Promise<Array<string>>;
    getAllUserChatHistories(): Promise<Array<[Principal, Array<Message>]>>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(): Promise<Array<Message>>;
    getCompanionPreference(): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveChatHistory(history: Array<Message>): Promise<void>;
    saveCompanionPreference(preference: string): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
