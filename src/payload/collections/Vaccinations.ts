import { CollectionConfig } from 'payload';

export const Vaccinations: CollectionConfig = {
  slug: 'vaccinations',
  admin: {
    useAsTitle: 'vaccineName',
    defaultColumns: ['vaccineName', 'pet', 'status', 'nextDueDate'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'vet') return true;
      return {
        'pet.owner': { equals: user.id }
      };
    },
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'vet' || user.role === 'admin';
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'vet' || user.role === 'admin';
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
      name: 'vaccineName',
      type: 'text',
      required: true,
    },
    {
      name: 'dose',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'nextDueDate',
      type: 'date',
      required: true,
    },
    {
      name: 'reminderSent',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Administered', value: 'administered' },
        { label: 'Overdue', value: 'overdue' },
      ],
      defaultValue: 'administered',
      required: true,
    },
  ],
  timestamps: true,
};
