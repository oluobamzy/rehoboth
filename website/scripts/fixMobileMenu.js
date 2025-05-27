// scripts/fixMobileMenu.js
// This script updates the mobile menu in Header.tsx
// Run with: node scripts/fixMobileMenu.js

const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, '..', 'src', 'components', 'common', 'Header.tsx');

// Read the current content of Header.tsx
const content = fs.readFileSync(headerPath, 'utf8');

// Define the updated mobile menu content
const updatedMobileMenu = `      {/* Mobile menu */}
      <div
        className={\`md:hidden \${isMenuOpen ? 'block' : 'hidden'}\`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={\`block px-3 py-2 rounded-md text-base font-medium \${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
              }\`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {user && (
            <>
              {user.app_metadata?.role === 'admin' && (
                <div className="py-2 border-t border-gray-200 mt-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                    Admin
                  </p>
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={\`block px-3 py-2 rounded-md text-base font-medium \${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }\`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="border-t border-gray-200 my-2">
                <div className="px-3 py-2 text-sm text-gray-600">
                  Signed in as: {user.email}
                </div>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
          
          {!user && (
            <Link
              href="/auth/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 mt-2 border-t border-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Log In
            </Link>
          )}
        </div>
      </div>`;

// Find the position of the mobile menu
const mobileMenuStart = content.indexOf('{/* Mobile menu */}');
const mobileMenuEnd = content.indexOf('</header>') - 7; // Approximate end position

if (mobileMenuStart !== -1 && mobileMenuEnd > mobileMenuStart) {
  // Create the updated file content
  const updatedContent = content.substring(0, mobileMenuStart) + updatedMobileMenu + content.substring(mobileMenuEnd);
  
  // Write the updated content back to the file
  fs.writeFileSync(headerPath, updatedContent, 'utf8');
  console.log('Successfully updated mobile menu in Header.tsx');
} else {
  console.error('Could not find mobile menu section in Header.tsx');
}
