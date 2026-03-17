import mongoose, { Document, Model, Schema } from 'mongoose'

export type FeedbackType = 'feedback' | 'suggestion' | 'problem'

export interface IMosqueFeedback extends Document {
  mosqueId: mongoose.Types.ObjectId
  type: FeedbackType
  message: string
  anonymous: boolean
  name?: string
  contact?: string
  createdAt: Date
  updatedAt: Date
}

const MosqueFeedbackSchema = new Schema<IMosqueFeedback>(
  {
    mosqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Mosque',
      required: true,
      index: true,
    },
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
  },
  {
    timestamps: true,
  }
)

MosqueFeedbackSchema.index({ mosqueId: 1, createdAt: -1 })

const MosqueFeedback: Model<IMosqueFeedback> =
  mongoose.models.MosqueFeedback ||
  mongoose.model<IMosqueFeedback>('MosqueFeedback', MosqueFeedbackSchema)

export default MosqueFeedback
