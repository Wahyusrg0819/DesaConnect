import mongoose from 'mongoose';

// Define an interface for the submission document
interface ISubmission {
  name?: string;
  contactInfo?: string;
  category: string;
  description: string;
  createdAt: Date;
  referenceId: string; // Make required as it's generated before saving
  status: 'pending' | 'in progress' | 'resolved';
  fileUrl?: string | null;
  priority?: 'Urgent' | 'Regular'; // Assuming this is used
  internalComments?: Array<{
    text: string;
    author: string;
    createdAt: Date;
  }>;
}

// Define the Mongoose Document type
export interface SubmissionDocument extends ISubmission, mongoose.Document {}


const submissionSchema = new mongoose.Schema<SubmissionDocument>({
  name: {
    type: String,
  },
  contactInfo: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  referenceId: {
    type: String,
    unique: true,
    required: true, // Mark as required in schema
  },
  // Add status field with default value
  status: {
    type: String,
    enum: ['pending', 'in progress', 'resolved'], // Example statuses
    default: 'pending',
  },
  // Add fileUrl field
  fileUrl: {
    type: String,
  },
   // Add priority field
   priority: {
    type: String,
    enum: ['Urgent', 'Regular'],
    default: 'Regular',
   },
   // Add internalComments field
   internalComments: [
    {
        text: String,
        author: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
   ],
});

// Generate a simple unique reference ID before saving
submissionSchema.pre<SubmissionDocument>('save', async function(next) {
  if (this.isNew && !this.referenceId) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.referenceId = result;
  }
  next();
});

const SubmissionModel = mongoose.models.Submission || mongoose.model<SubmissionDocument>('Submission', submissionSchema);

export default SubmissionModel;
