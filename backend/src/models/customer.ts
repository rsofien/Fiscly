import { Schema, model } from "mongoose"

const customerSchema = new Schema(
  {
    workspace_id: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    address: String,
    taxId: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: String,
  },
  { timestamps: true }
)

export const Customer = model("Customer", customerSchema)
