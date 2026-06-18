import mongoose, { Schema, Document } from 'mongoose';

// -------------------------------------------------------------
// USERS COLLECTION
// -------------------------------------------------------------
export interface IUser extends Document {
  firebaseUID: string;
  role: 'owner' | 'vet' | 'shelter' | 'admin';
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  city?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firebaseUID: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['owner', 'vet', 'shelter', 'admin'], default: 'owner' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  avatar: { type: String },
  city: { type: String },
  state: { type: String },
}, { timestamps: true });

// -------------------------------------------------------------
// PETS COLLECTION
// -------------------------------------------------------------
export interface IEmergencyContact {
  name: string;
  relation: string;
  phone: string;
  priority: number;
}

export interface IPet extends Document {
  owner: mongoose.Types.ObjectId | string;
  name: string;
  species: string;
  breed: string;
  dob?: Date;
  gender: 'male' | 'female' | 'unknown';
  weight?: number;
  bloodGroup?: string;
  temperament?: string;
  photo?: string;
  gallery: string[];
  slug: string;
  qrUrl?: string;
  vaccinated: boolean;
  lost: boolean;
  microchipId?: string;
  emergencyContacts: IEmergencyContact[];
  createdAt: Date;
  updatedAt: Date;
}

const PetSchema = new Schema<IPet>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
  weight: { type: Number },
  bloodGroup: { type: String },
  temperament: { type: String },
  photo: { type: String },
  gallery: [{ type: String }],
  slug: { type: String, required: true, unique: true, index: true },
  qrUrl: { type: String },
  vaccinated: { type: Boolean, default: false },
  lost: { type: Boolean, default: false },
  microchipId: { type: String },
  emergencyContacts: [{
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, required: true },
    priority: { type: Number, default: 1 }
  }]
}, { timestamps: true });

// -------------------------------------------------------------
// MEDICAL RECORDS COLLECTION
// -------------------------------------------------------------
export interface IMedicalRecord extends Document {
  pet: mongoose.Types.ObjectId | string;
  vaccines: string[];
  allergies: string[];
  prescriptions: string[];
  surgeries: string[];
  diseases: string[];
  documents: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true, unique: true, index: true },
  vaccines: [{ type: String }],
  allergies: [{ type: String }],
  prescriptions: [{ type: String }],
  surgeries: [{ type: String }],
  diseases: [{ type: String }],
  documents: [{ type: String }],
  notes: { type: String },
}, { timestamps: true });

// -------------------------------------------------------------
// VACCINATIONS COLLECTION
// -------------------------------------------------------------
export interface IVaccination extends Document {
  pet: mongoose.Types.ObjectId | string;
  vaccineName: string;
  dose: string;
  date: Date;
  nextDueDate: Date;
  reminderSent: boolean;
  status: 'pending' | 'administered' | 'overdue';
}

const VaccinationSchema = new Schema<IVaccination>({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
  vaccineName: { type: String, required: true },
  dose: { type: String, required: true },
  date: { type: Date, required: true },
  nextDueDate: { type: Date, required: true },
  reminderSent: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'administered', 'overdue'], default: 'administered' },
}, { timestamps: true });

// -------------------------------------------------------------
// QR TAGS COLLECTION
// -------------------------------------------------------------
export interface IQRTag extends Document {
  pet: mongoose.Types.ObjectId | string;
  slug: string;
  qrImage: string;
  status: 'active' | 'inactive' | 'damaged' | 'replacementRequested';
  createdAt: Date;
}

const QRTagSchema = new Schema<IQRTag>({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
  slug: { type: String, required: true, unique: true },
  qrImage: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'damaged', 'replacementRequested'], default: 'active' },
}, { timestamps: true });

// -------------------------------------------------------------
// LOST PETS COLLECTION
// -------------------------------------------------------------
export interface ILostPet extends Document {
  pet: mongoose.Types.ObjectId | string;
  reward?: number;
  missingSince: Date;
  lastSeen?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'missing' | 'found' | 'closed';
  scannerNotes?: string;
  proofImages: string[];
}

const LostPetSchema = new Schema<ILostPet>({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
  reward: { type: Number, default: 0 },
  missingSince: { type: Date, required: true },
  lastSeen: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { type: String, enum: ['missing', 'found', 'closed'], default: 'missing' },
  scannerNotes: { type: String },
  proofImages: [{ type: String }]
}, { timestamps: true });

// -------------------------------------------------------------
// SCAN LOGS COLLECTION
// -------------------------------------------------------------
export interface IScanLog extends Document {
  pet: mongoose.Types.ObjectId | string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  ip?: string;
  device?: string;
  browser?: string;
  time: Date;
  scanType: 'public' | 'owner' | 'admin';
}

const ScanLogSchema = new Schema<IScanLog>({
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
  city: { type: String },
  country: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  ip: { type: String },
  device: { type: String },
  browser: { type: String },
  time: { type: Date, default: Date.now },
  scanType: { type: String, enum: ['public', 'owner', 'admin'], default: 'public' }
}, { timestamps: true });

// -------------------------------------------------------------
// NOTIFICATIONS COLLECTION
// -------------------------------------------------------------
export interface INotification extends Document {
  user: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

// -------------------------------------------------------------
// MEDIA COLLECTION
// -------------------------------------------------------------
export interface IMedia extends Document {
  url: string;
  publicId: string;
  type: string;
  uploadedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// -------------------------------------------------------------
// SHELTERS & VETERINARIANS COLLECTIONS
// -------------------------------------------------------------
export interface IShelter extends Document {
  user: mongoose.Types.ObjectId | string;
  name: string;
  address: string;
  phone: string;
  capacity?: number;
  rescueCount?: number;
}

const ShelterSchema = new Schema<IShelter>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  capacity: { type: Number },
  rescueCount: { type: Number, default: 0 }
}, { timestamps: true });

export interface IVeterinarian extends Document {
  user: mongoose.Types.ObjectId | string;
  name: string;
  clinicName: string;
  address: string;
  licenseNumber: string;
  phone: string;
}

const VeterinarianSchema = new Schema<IVeterinarian>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  clinicName: { type: String, required: true },
  address: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

// Registering Models and ensuring hot-reloads do not crash Next.js
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Pet = mongoose.models.Pet || mongoose.model<IPet>('Pet', PetSchema);
export const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
export const Vaccination = mongoose.models.Vaccination || mongoose.model<IVaccination>('Vaccination', VaccinationSchema);
export const QRTag = mongoose.models.QRTag || mongoose.model<IQRTag>('QRTag', QRTagSchema);
export const LostPet = mongoose.models.LostPet || mongoose.model<ILostPet>('LostPet', LostPetSchema);
export const ScanLog = mongoose.models.ScanLog || mongoose.model<IScanLog>('ScanLog', ScanLogSchema);
export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const Media = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
export const Shelter = mongoose.models.Shelter || mongoose.model<IShelter>('Shelter', ShelterSchema);
export const Veterinarian = mongoose.models.Veterinarian || mongoose.model<IVeterinarian>('Veterinarian', VeterinarianSchema);
