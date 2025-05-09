import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    description: { type: String, required: true }
});

const companyDashSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    records: [recordSchema]
});


export default mongoose.model('DashboardCompany', companyDashSchema);


