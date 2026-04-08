import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    role: string;
}
export interface HttpHeader {
    value: string;
    name: string;
}
export interface HttpResponse {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface TransformArgs {
    context: Uint8Array;
    response: HttpResponse;
}
export interface backendInterface {
    getChatHistory(): Promise<Array<Message>>;
    getCompanionPreference(): Promise<string | null>;
    saveChatHistory(history: Array<Message>): Promise<void>;
    saveCompanionPreference(preference: string): Promise<void>;
    transform(args: TransformArgs): Promise<HttpResponse>;
}
