import { Schema, model } from "mongoose"

const workspaceSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    user_email: { type: String, required: true },
    name: { type: String, required: true },
    email: String,
    address: String,
    phone: String,
    invoicePrefix: { type: String, default: "INV" },
    defaultPaymentTerms: { type: Number, default: 15 },
    defaultNotes: String,
    matriculeFiscale: String,
    personal_name: String,
    personal_email: String,
    personal_phone: String,
    logo: { type: Schema.Types.Mixed, default: null },
    signature: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

export const Workspace = model("Workspace", workspaceSchema)
