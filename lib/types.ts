export interface JamatTimes {
  fajr: number // Unix timestamp in milliseconds
  dhuhr: number
  asr: number
  maghrib: number
  isha: number
  jummah: number
}

export interface Facilities {
  femaleArea: boolean
  parking: boolean
  wheelchairAccess: boolean
  wuduFacilities: boolean
  airConditioned: boolean
}

export interface MosqueData {
  _id: string
  name: string
  address: string
  city: string
  country: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  jamatTimes: JamatTimes
  facilities: Facilities
  phone?: string
  website?: string
  description?: string
  verificationCount: number
  createdAt: string
  updatedAt: string
  distance?: number
}

export interface SearchParams {
  lat?: number
  lng?: number
  radius?: number
  query?: string
}
