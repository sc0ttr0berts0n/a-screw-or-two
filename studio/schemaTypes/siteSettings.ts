import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'A Screw or Two',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      initialValue: 'Hobby-friendly fasteners, sold individually.',
    }),
    defineField({
      name: 'freeShippingThresholdCents',
      title: 'Free Shipping Threshold (cents)',
      type: 'number',
      description: 'Orders above this amount get free shipping. 3500 = $35.00',
      initialValue: 3500,
    }),
    defineField({
      name: 'flatShippingCents',
      title: 'Flat Shipping Rate (cents)',
      type: 'number',
      description: 'Shipping cost for orders below the free shipping threshold. 450 = $4.50',
      initialValue: 450,
    }),
    defineField({
      name: 'minimumOrderCents',
      title: 'Minimum Order (cents)',
      type: 'number',
      description: 'Minimum order value to checkout. 800 = $8.00',
      initialValue: 800,
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'text',
      rows: 2,
      initialValue: 'Need just one screw? We\'ve got you.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'valueProps',
      title: 'Value Propositions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'valueProp',
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'string' }),
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
        },
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'Default SEO Title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default SEO Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
