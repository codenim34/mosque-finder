import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUpdateJamatTimes {
  fajr?: number
  dhuhr?: number
  asr?: number
  maghrib?: number
  isha?: number
  jummah?: number
}

export interface IUpdateFacilities {
  femaleArea?: boolean
  parking?: boolean
  wheelchairAccess?: boolean
  wuduFacilities?: boolean
  airConditioned?: boolean
}

export interface IUpdateContactInfo {
  address?: string
  city?: string
  country?: string
  phone?: string | null
  website?: string | null
  description?: string | null
}

export interface IMosqueUpdate extends Document {
  mosqueId: mongoose.Types.ObjectId
  jamatTimes?: IUpdateJamatTimes
  facilities?: IUpdateFacilities
  contactInfo?: IUpdateContactInfo
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  supportCount: number
  supportedIPs: string[]
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UpdateJamatTimesSchema = new Schema<IUpdateJamatTimes>(
  {
    fajr: Number,
    dhuhr: Number,
    asr: Number,
    maghrib: Number,
    isha: Number,
    jummah: Number,
  },
  { _id: false }
)

const UpdateFacilitiesSchema = new Schema<IUpdateFacilities>(
  {
    femaleArea: Boolean,
    parking: Boolean,
    wheelchairAccess: Boolean,
    wuduFacilities: Boolean,
    airConditioned: Boolean,
  },
  { _id: false }
)

const UpdateContactInfoSchema = new Schema<IUpdateContactInfo>(
  {
    address: String,
    city: String,
    country: String,
    phone: { type: String, default: null },
    website: { type: String, default: null },
    description: { type: String, default: null },
  },
  { _id: false }
)

const MosqueUpdateSchema = new Schema<IMosqueUpdate>(
  {
    mosqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Mosque',
      required: true,
      index: true,
    },
    jamatTimes: { type: UpdateJamatTimesSchema },
    facilities: { type: UpdateFacilitiesSchema },
    contactInfo: { type: UpdateContactInfoSchema },
    note: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    supportCount: { type: Number, default: 1 },
    supportedIPs: { type: [String], default: [] },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
)

MosqueUpdateSchema.index({ mosqueId: 1, status: 1, createdAt: -1 })

const MosqueUpdate: Model<IMosqueUpdate> =
  mongoose.models.MosqueUpdate ||
  mongoose.model<IMosqueUpdate>('MosqueUpdate', MosqueUpdateSchema)

export default MosqueUpdate
