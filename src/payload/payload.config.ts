import { buildConfig } from 'payload';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

import { Users } from './collections/Users';
import { Pets } from './collections/Pets';
import { MedicalRecords } from './collections/MedicalRecords';
import { Vaccinations } from './collections/Vaccinations';
import { QRTags } from './collections/QRTags';
import { LostPets } from './collections/LostPets';
import { ScanLogs } from './collections/ScanLogs';
import { Notifications } from './collections/Notifications';
import { Media } from './collections/Media';
import { Shelters } from './collections/Shelters';
import { Veterinarians } from './collections/Veterinarians';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  collections: [
    Users,
    Pets,
    MedicalRecords,
    Vaccinations,
    QRTags,
    LostPets,
    ScanLogs,
    Notifications,
    Media,
    Shelters,
    Veterinarians,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'd1a7b4f593e820c78a0f9b6e4d3c2b1a5e6f7d8c9b0a1b2c3d4e5f6',
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/pawpass',
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    disable: true, // Focus purely on Rest APIs
  },
});
