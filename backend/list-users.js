import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:27017/fiscly').then(async () => {
  const users = await User.find({}, 'email name').lean();
  console.log('📋 Users in database:');
  users.forEach(u => console.log(`  - ${u.email} (${u.name})`));
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
