export interface JamatTimes {
  fajr: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  jummah: string
}

export interface Facilities {
  femaleArea: boolean
  parking: boolean
  wheelchair: boolean
  wuduArea: boolean
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
