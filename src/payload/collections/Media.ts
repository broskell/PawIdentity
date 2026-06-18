import { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'publicId',
    defaultColumns: ['publicId', 'type', 'uploadedBy', 'createdAt'],
  },
  access: {
    read: () => true, // Publicly read-accessible
    create: ({ req: { user } }) => !!user, // Any authenticated user can upload photos/records
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { uploadedBy: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { uploadedBy: { equals: user.id } };
    },
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'publicId',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'text', // e.g. image/png, application/pdf
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
  ],
  timestamps: true,
};
