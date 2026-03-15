import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
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
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      options: {
        list: [
          { title: 'Screw', value: 'screw' },
          { title: 'Nut', value: 'nut' },
          { title: 'Washer', value: 'washer' },
          { title: 'Heat-Set Insert', value: 'insert' },
          { title: 'Standoff', value: 'standoff' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      options: {
        list: ['M2', 'M2.5', 'M3', 'M4', 'M5'],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lengthMm',
      title: 'Length (mm)',
      type: 'number',
      description: 'Length in millimeters. Not applicable for nuts or washers.',
      hidden: ({ document }) =>
        document?.productType === 'nut' || document?.productType === 'washer',
    }),
    defineField({
      name: 'headType',
      title: 'Head Type',
      type: 'string',
      options: {
        list: [
          { title: 'Socket Cap', value: 'socketCap' },
          { title: 'Hex', value: 'hex' },
          { title: 'Pan', value: 'pan' },
          { title: 'Flat', value: 'flat' },
        ],
      },
      hidden: ({ document }) => document?.productType !== 'screw',
    }),
    defineField({
      name: 'finish',
      title: 'Finish',
      type: 'string',
      options: {
        list: [
          { title: 'Stainless Steel', value: 'stainless' },
          { title: 'Black Oxide', value: 'blackOxide' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      options: {
        list: [
          { title: 'Steel', value: 'steel' },
          { title: 'Nylon', value: 'nylon' },
        ],
      },
      initialValue: 'steel',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceCents',
      title: 'Price (cents)',
      type: 'number',
      description: 'Price per unit in cents (e.g., 15 = $0.15)',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'costCents',
      title: 'Cost (cents)',
      type: 'number',
      description: 'Your cost per unit in cents. For internal margin tracking only.',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Plain-language description of what this fastener is used for.',
      rows: 3,
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Size',
      name: 'sizeAsc',
      by: [{ field: 'size', direction: 'asc' }],
    },
    {
      title: 'Price',
      name: 'priceAsc',
      by: [{ field: 'priceCents', direction: 'asc' }],
    },
  ],
})
