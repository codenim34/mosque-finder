import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IJamatTimes {
  fajr: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  jummah: string
}

export interface IFacilities {
  femaleArea: boolean
  parking: boolean
  wheelchair: boolean
  wuduArea: boolean
  airConditioned: boolean
}

export interface IMosque extends Document {
  name: string
  address: string
  city: string
  country: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  jamatTimes: IJamatTimes
  facilities: IFacilities
  phone?: string
  website?: string
  description?: string
  verificationCount: number
  verifiedIPs: string[]
  createdAt: Date
  updatedAt: Date
}

const JamatTimesSchema = new Schema<IJamatTimes>(
  {
    fajr: { type: String, required: true },
    dhuhr: { type: String, required: true },
    asr: { type: String, required: true },
    maghrib: { type: String, required: true },
    isha: { type: String, required: true },
    jummah: { type: String, required: true },
  },
  { _id: false }
)

const FacilitiesSchema = new Schema<IFacilities>(
  {
    femaleArea: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    wheelchair: { type: Boolean, default: false },
    wuduArea: { type: Boolean, default: false },
    airConditioned: { type: Boolean, default: false },
  },
  { _id: false }
)

const MosqueSchema = new Schema<IMosque>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    jamatTimes: { type: JamatTimesSchema, required: true },
    facilities: { type: FacilitiesSchema, required: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    verificationCount: { type: Number, default: 0 },
    verifiedIPs: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
)

// Create geospatial index for location-based queries
MosqueSchema.index({ location: '2dsphere' })
MosqueSchema.index({ name: 'text', address: 'text', city: 'text' })

const Mosque: Model<IMosque> =
  mongoose.models.Mosque || mongoose.model<IMosque>('Mosque', MosqueSchema)

export default Mosque
