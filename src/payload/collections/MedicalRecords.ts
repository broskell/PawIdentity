import { CollectionConfig } from 'payload';

export const MedicalRecords: CollectionConfig = {
  slug: 'medical-records',
  admin: {
    useAsTitle: 'pet',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'vet') return true;
      // Owners can only view records for pets they own
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
      unique: true,
      index: true,
    },
    {
      name: 'vaccines',
      type: 'array',
      fields: [{ name: 'name', type: 'text' }],
    },
    {
      name: 'allergies',
      type: 'array',
      fields: [{ name: 'allergyName', type: 'text' }],
    },
    {
      name: 'prescriptions',
      type: 'array',
      fields: [{ name: 'prescriptionName', type: 'text' }],
    },
    {
      name: 'surgeries',
      type: 'array',
      fields: [{ name: 'surgeryName', type: 'text' }],
    },
    {
      name: 'diseases',
      type: 'array',
      fields: [{ name: 'diseaseName', type: 'text' }],
    },
    {
      name: 'documents',
      type: 'array',
      fields: [{ name: 'documentUrl', type: 'text' }],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
};
