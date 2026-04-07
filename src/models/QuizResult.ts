import mongoose, { Document, Model, Schema } from "mongoose";

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  courseName: string;
  score: number;
  totalQuestions: number;
  weakPoints: string[];
  dateTaken: Date;
}

const QuizResultSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  weakPoints: {
    type: [String],
    default: [],
  },
  dateTaken: {
    type: Date,
    default: Date.now,
  },
});

const QuizResult: Model<IQuizResult> =
  mongoose.models.QuizResult ||
  mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);

export default QuizResult;
