import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  url: string;
  platform: string;
  tags: string[];
  submittedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Please provide the course URL'],
    trim: true,
  },
  platform: {
    type: String,
    required: [true, 'Please provide the platform (e.g., YouTube, Udemy)'],
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
