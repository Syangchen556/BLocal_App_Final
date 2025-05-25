/**
 * Generates a URL-friendly slug from a string
 * @param {string} text - The text to convert into a slug
 * @returns {string} The generated slug
 */
export function autoGenerateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Generates a unique slug by appending a number if necessary
 * @param {string} baseSlug - The initial slug to make unique
 * @param {Function} checkExists - Async function to check if a slug exists
 * @returns {Promise<string>} The unique slug
 */
export async function generateUniqueSlug(baseSlug, checkExists) {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
} 