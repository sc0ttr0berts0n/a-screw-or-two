import { defineField, defineType } from 'sanity'

export const kit = defineType({
  name: 'kit',
  title: 'Project Kit',
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
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceCents',
      title: 'Kit Price (cents)',
      type: 'number',
      description: 'Bundle price in cents (e.g., 3500 = $35.00)',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'costCents',
      title: 'Cost (cents)',
      type: 'number',
      description: 'Your total cost for kit contents. Internal use only.',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'projectUrl',
      title: 'Project URL',
      type: 'url',
      description: 'Link to the project this kit is designed for.',
    }),
    defineField({
      name: 'image',
      title: 'Kit Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'contents',
      title: 'Kit Contents',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'kitItem',
          title: 'Kit Item',
          fields: [
            defineField({
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: 'note',
              title: 'Note',
              type: 'string',
              description: 'e.g., "for the frame corners"',
            }),
          ],
          preview: {
            select: {
              productName: 'product.name',
              quantity: 'quantity',
            },
            prepare({ productName, quantity }) {
              return {
                title: productName || 'Select a product',
                subtitle: `Qty: ${quantity || 0}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Show this kit on the home page.',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      media: 'image',
    },
  },
})
