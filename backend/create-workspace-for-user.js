import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  user_id: String,
  user_email: String,
  name: String,
  email: String,
  invoicePrefix: String,
  defaultPaymentTerms: Number,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
const User = mongoose.model('User', userSchema);

const userEmail = process.argv[2] || 'contact@devsync-agecy.com';

mongoose.connect('mongodb://localhost:27017/fiscly').then(async () => {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    console.log('❌ User not found:', userEmail);
    process.exit(1);
  }
  
  const existing = await Workspace.findOne({ user_id: user._id.toString() });
  if (existing) {
    console.log('✓ Workspace already exists for', userEmail);
    process.exit(0);
  }
  
  await Workspace.create({
    user_id: user._id.toString(),
    user_email: user.email,
    name: user.name || 'My Company',
    email: user.email,
    invoicePrefix: 'INV',
    defaultPaymentTerms: 15,
  });
  
  console.log('✓ Workspace created for', userEmail);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
