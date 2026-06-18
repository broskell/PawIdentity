import { CollectionConfig } from 'payload';

export const Pets: CollectionConfig = {
  slug: 'pets',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'species', 'breed', 'lost'],
  },
  access: {
    read: ({ req: { user } }): any => {
      if (!user) return { lost: { equals: true } }; // Public can only read lost pets or basic public info
      if (user.role === 'admin' || user.role === 'vet') return true;
      return { owner: { equals: user.id } }; // Owners can see their own pets
    },
    create: ({ req: { user } }): any => {
      if (!user) return false;
      return user.role === 'owner' || user.role === 'shelter' || user.role === 'admin';
    },
    update: ({ req: { user } }): any => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'vet') return true;
      return { owner: { equals: user.id } };
    },
    delete: ({ req: { user } }): any => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { owner: { equals: user.id } };
    },
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'species',
      type: 'text',
      required: true,
    },
    {
      name: 'breed',
      type: 'text',
      required: true,
    },
    {
      name: 'dob',
      type: 'date',
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Unknown', value: 'unknown' },
      ],
      defaultValue: 'unknown',
    },
    {
      name: 'weight',
      type: 'number',
    },
    {
      name: 'bloodGroup',
      type: 'text',
    },
    {
      name: 'temperament',
      type: 'text',
    },
    {
      name: 'photo',
      type: 'text', // Cloudinary URL
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'imageUrl',
          type: 'text',
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'qrUrl',
      type: 'text',
    },
    {
      name: 'vaccinated',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'lost',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'microchipId',
      type: 'text',
    },
    {
      name: 'emergencyContacts',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'relation',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'priority',
          type: 'number',
          defaultValue: 1,
        },
      ],
    },
  ],
  timestamps: true,
};
