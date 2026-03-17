import mongoose, { Document, Model, Schema } from 'mongoose'

export type AppFeedbackType = 'feedback' | 'suggestion' | 'problem'

export interface IAppFeedback extends Document {
  type: AppFeedbackType
  message: string
  anonymous: boolean
  name?: string
  contact?: string
  pagePath?: string
  createdAt: Date
  updatedAt: Date
}

const AppFeedbackSchema = new Schema<IAppFeedback>(
  {
    type: {
      type: String,
      enum: ['feedback', 'suggestion', 'problem'],
      default: 'feedback',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    anonymous: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    contact: {
      type: String,
      trim: true,
      maxlength: 180,
    },
    pagePath: {
      type: String,
      trim: true,
      maxlength: 260,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

AppFeedbackSchema.index({ createdAt: -1 })

const AppFeedback: Model<IAppFeedback> =
  mongoose.models.AppFeedback ||
  mongoose.model<IAppFeedback>('AppFeedback', AppFeedbackSchema)

export default AppFeedback
