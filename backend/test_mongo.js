import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

async function testConnection() {
  console.log('Connecting to:', uri);
  try {
    await mongoose.connect(uri);
    console.log('✅ Connection successful!');
    
    const TestSchema = new mongoose.Schema({ name: String, date: Date });
    const TestModel = mongoose.model('Test', TestSchema);
    
    console.log('Writing test document...');
    const doc = await TestModel.create({ name: 'System Test', date: new Date() });
    console.log('✅ Document created:', doc._id);
    
    console.log('Reading test document...');
    const found = await TestModel.findById(doc._id);
    console.log('✅ Document found:', found.name);
    
    console.log('Cleaning up...');
    await TestModel.findByIdAndDelete(doc._id);
    console.log('✅ Test complete. Disconnecting.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testConnection();
