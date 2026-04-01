import {defineField, defineType} from 'sanity';

export const templateType = defineType({
  name: 'template',
  title: 'Template',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'styleNote',
      title: 'Style note',
      type: 'string',
    }),
    defineField({
      name: 'includes',
      title: 'Includes',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'templatePrice',
      title: 'Template price',
      type: 'number',
      initialValue: 18.95,
    }),
    defineField({
      name: 'printPrice',
      title: 'Print price',
      type: 'number',
      initialValue: 24.95,
    }),
    defineField({
      name: 'previewImages',
      title: 'Preview images',
      type: 'array',
      of: [{type: 'image'}],
    }),
    defineField({
      name: 'downloadFile',
      title: 'Download file',
      type: 'file',
      options: {
        accept: '.zip,.pdf',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      media: 'previewImages.0',
    },
  },
});
