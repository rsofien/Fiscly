import { Schema, model } from "mongoose"

const invoiceSchema = new Schema(
  {
    workspace_id: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["draft", "sent", "paid", "overdue", "cancelled"], default: "draft" },
    description: String,
    notes: String,
    paymentMethod: { type: String, enum: ["bank_transfer", "card", "crypto", "cash"], default: "bank_transfer" },
    language: { type: String, enum: ["en", "fr"], default: "en" },
    issuerType: { type: String, enum: ["company", "personal"], default: "company" },
    paidDate: Date,
    // FX conversion fields
    usdAmount: { type: Number },
    fxRate: { type: Number },
    fxDate: { type: String },
    fxSource: { type: String },
  },
  { timestamps: true }
)

const invoiceItemSchema = new Schema(
  {
    invoice_id: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
)

export const Invoice = model("Invoice", invoiceSchema)
export const InvoiceItem = model("InvoiceItem", invoiceItemSchema)
