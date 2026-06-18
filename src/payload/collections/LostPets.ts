import { CollectionConfig } from 'payload';

export const LostPets: CollectionConfig = {
  slug: 'lost-pets',
  admin: {
    useAsTitle: 'pet',
    defaultColumns: ['pet', 'status', 'reward', 'missingSince'],
  },
  access: {
    read: () => true, // Public route /lost and /pet/:slug need read access
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'owner' || user.role === 'shelter' || user.role === 'admin';
    },
    update: ({ req: { user } }): any => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        'pet.owner': { equals: user.id }
      };
    },
    delete: ({ req: { user } }): any => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        'pet.owner': { equals: user.id }
      };
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
      name: 'reward',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'missingSince',
      type: 'date',
      required: true,
    },
    {
      name: 'lastSeen',
      type: 'text',
    },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Missing', value: 'missing' },
        { label: 'Found', value: 'found' },
        { label: 'Closed', value: 'closed' },
      ],
      defaultValue: 'missing',
      required: true,
    },
    {
      name: 'scannerNotes',
      type: 'textarea',
    },
    {
      name: 'proofImages',
      type: 'array',
      fields: [{ name: 'imageUrl', type: 'text' }],
    },
  ],
  timestamps: true,
};
