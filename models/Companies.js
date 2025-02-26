import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    invoiceNo: {
        type: String,
        required: true
    },
    containerNo: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true
    },
    advance: {
        type: String,
        required: true
    }
});

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    records: [recordSchema]
});

export default mongoose.model('Company', companySchema);
