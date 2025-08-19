import { IChatLight } from "./IChatLight";

export interface IChat extends IChatLight {
    id: string;
    updated_at: string;
}