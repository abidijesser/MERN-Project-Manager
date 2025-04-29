#!/bin/bash

# This script fixes CIcon imports in all JavaScript files in the Client/src directory

# Find all JavaScript files that contain "import" and "CIcon" and "@coreui/react"
FILES=$(grep -l "import.*CIcon.*from '@coreui/react'" $(find Client/src -type f -name "*.js"))

# Loop through each file and fix the imports
for file in $FILES; do
  echo "Fixing CIcon import in $file"
  
  # Replace the CIcon import from '@coreui/react' with the correct import
  sed -i 's/import {[^}]*CIcon[^}]*} from '\''@coreui\/react'\''/import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from '\''@coreui\/react'\''\nimport CIcon from '\''@coreui\/icons-react'\''/g' "$file"
  
  # If CIcon is the only import from '@coreui/react', replace it
  sed -i 's/import { CIcon } from '\''@coreui\/react'\''/import CIcon from '\''@coreui\/icons-react'\''/g' "$file"
  
  # Add cilX import if it's not already there
  if grep -q "CIcon icon={.*x" "$file" && ! grep -q "cilX" "$file"; then
    sed -i '/import CIcon from '\''@coreui\/icons-react'\''/a import { cilX } from '\''@coreui\/icons'\''\n' "$file"
  fi
  
  # Replace CIcon usage with the correct syntax
  sed -i 's/CIcon icon={\['\''cil'\'', '\''x'\''\]}/CIcon icon={cilX}/g' "$file"
done

echo "All CIcon imports have been fixed!"
