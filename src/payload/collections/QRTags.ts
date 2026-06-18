import { CollectionConfig } from 'payload';

export const QRTags: CollectionConfig = {
  slug: 'qr-tags',
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'pet', 'status'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return true; // Public can scan/read basic QR metadata
      if (user.role === 'admin') return true;
      return {
        'pet.owner': { equals: user.id }
      };
    },
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin'; // QRTags are created by the system/admin
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        'pet.owner': { equals: user.id } // Owner can report as damaged
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'pet',
      type: 'relationship',
      relationTo: 'pets',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'qrImage',
      type: 'text', // Cloudinary URL
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Damaged', value: 'damaged' },
        { label: 'Replacement Requested', value: 'replacementRequested' },
      ],
      defaultValue: 'active',
      required: true,
    },
  ],
  timestamps: true,
};
