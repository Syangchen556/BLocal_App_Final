const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Function to update a file
async function updateFile(filePath) {
  try {
    // Read the file content
    const content = await readFileAsync(filePath, 'utf8');
    
    // Replace imports
    let updatedContent = content
      .replace(/import\s*{\s*getServerSession\s*}\s*from\s*['"]next-auth(?:\/next)?['"];?/g, 
               `import { auth } from '@/lib/auth';`)
      .replace(/import\s*{\s*authOptions\s*}\s*from\s*['"]@\/lib\/auth['"];?/g, 
               '');
    
    // Remove duplicate auth imports if they exist
    const authImportRegex = /import\s*{\s*auth\s*}\s*from\s*['"]@\/lib\/auth['"];?/g;
    const matches = updatedContent.match(authImportRegex);
    if (matches && matches.length > 1) {
      // Keep only the first occurrence
      let firstOccurrence = true;
      updatedContent = updatedContent.replace(authImportRegex, (match) => {
        if (firstOccurrence) {
          firstOccurrence = false;
          return match;
        }
        return '';
      });
    }
    
    // Replace getServerSession calls
    updatedContent = updatedContent
      .replace(/const\s+session\s*=\s*await\s+getServerSession\(\s*(?:authOptions)?\s*\);?/g, 
               'const session = await auth();');
    
    // Update role checks to be case-insensitive
    updatedContent = updatedContent
      .replace(/session\.user\.role\s*!==?\s*['"]ADMIN['"]/g, 
               'session.user.role.toUpperCase() !== \'ADMIN\'')
      .replace(/session\.user\.role\s*!==?\s*['"]SELLER['"]/g, 
               'session.user.role.toUpperCase() !== \'SELLER\'')
      .replace(/session\.user\.role\s*!==?\s*['"]BUYER['"]/g, 
               'session.user.role.toUpperCase() !== \'BUYER\'')
      .replace(/session\.user\.role\s*===?\s*['"]ADMIN['"]/g, 
               'session.user.role.toUpperCase() === \'ADMIN\'')
      .replace(/session\.user\.role\s*===?\s*['"]SELLER['"]/g, 
               'session.user.role.toUpperCase() === \'SELLER\'')
      .replace(/session\.user\.role\s*===?\s*['"]BUYER['"]/g, 
               'session.user.role.toUpperCase() === \'BUYER\'');
    
    // Update connectDB import if needed
    updatedContent = updatedContent
      .replace(/import\s*{\s*connectDB\s*}\s*from\s*['"]@\/lib\/mongodb['"];?/g, 
               `import connectDB from '@/lib/mongodb';`);
    
    // Write the updated content back to the file
    await writeFileAsync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
    return false;
  }
}

// Function to recursively process all files in a directory
async function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(filePath);
    } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
      // Process JavaScript files
      const content = await readFileAsync(filePath, 'utf8');
      
      // Only update files that use getServerSession
      if (content.includes('getServerSession')) {
        await updateFile(filePath);
      }
    }
  }
}

// Main function
async function main() {
  const apiDirectory = path.join(__dirname, 'src', 'app', 'api');
  console.log('Starting to update API routes...');
  
  await processDirectory(apiDirectory);
  
  console.log('Finished updating API routes.');
}

main().catch(console.error);
