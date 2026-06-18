import { CollectionConfig } from 'payload';

export const Veterinarians: CollectionConfig = {
  slug: 'veterinarians',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'clinicName', 'licenseNumber', 'phone'],
  },
  access: {
    read: () => true, // Publicly viewable to find nearby vets
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'clinicName',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      name: 'licenseNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
  ],
  timestamps: true,
};
