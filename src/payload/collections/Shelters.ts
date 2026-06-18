import { CollectionConfig } from 'payload';

export const Shelters: CollectionConfig = {
  slug: 'shelters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'capacity', 'rescueCount'],
  },
  access: {
    read: () => true, // Publicly viewable to find nearby shelters
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
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'capacity',
      type: 'number',
    },
    {
      name: 'rescueCount',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
};
