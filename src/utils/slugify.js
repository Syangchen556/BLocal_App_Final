import slugify from 'slugify';

/**
 * Generates a unique slug for a given title
 * @param {string} title - The title to generate slug from
 * @param {Model} Model - The mongoose model to check against
 * @returns {Promise<string>} The unique slug
 */
export async function generateUniqueSlug(title, Model) {
  // Base slug from title
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });

  // Check if base slug exists
  let slug = baseSlug;
  let counter = 1;
  let exists = await Model.findOne({ slug });

  // If slug exists, append counter until unique
  while (exists) {
    slug = `${baseSlug}-${counter}`;
    exists = await Model.findOne({ slug });
    counter++;
  }

  return slug;
}

/**
 * Middleware to automatically generate slug before saving
 * @param {string} field - The field to generate slug from (e.g., 'title' or 'name')
 */
export function autoGenerateSlug(field) {
  return async function(next) {
    if (this.isModified(field)) {
      try {
        this.slug = await generateUniqueSlug(this[field], this.constructor);
      } catch (error) {
        return next(error);
      }
    }
    next();
  };
} 