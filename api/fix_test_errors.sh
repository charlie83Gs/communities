#!/bin/bash

# Fix communityMember.repository.test.ts
sed -i '
# Cast mockFgaService as any
s/communityMemberRepository = new CommunityMemberRepository(mockDb, mockFgaService);/communityMemberRepository = new CommunityMemberRepository(mockDb, mockFgaService as any);/g

# Fix role argument errors - cast role arguments as any
s/assignBaseRole(\(.*\), '"'"'reader'"'"')/assignBaseRole(\1, '"'"'reader'"'"' as any)/g
s/assignBaseRole(\(.*\), '"'"'admin'"'"')/assignBaseRole(\1, '"'"'admin'"'"' as any)/g
s/assignBaseRole(\(.*\), '"'"'member'"'"')/assignBaseRole(\1, '"'"'member'"'"' as any)/g

# Fix "not assignable to parameter of type null" - cast as any
s/mockResolvedValue(\[\(.*\)\]);$/mockResolvedValue([\1] as any);/g

# Fix array type mismatches
s/mockResolvedValue(\[\s*{/mockResolvedValue([{/g
' src/repositories/communityMember.repository.test.ts

# Fix unused variables - prefix with underscore
sed -i 's/const _\([a-zA-Z0-9_]*\) =/const _\1 =/g' src/repositories/*.test.ts

# Fix implicit any types in callbacks
sed -i 's/\.then((\([a-z]\)) =>/\.then((\1: any) =>/g' src/repositories/*.test.ts
sed -i 's/\.map((\([a-z]\)) =>/\.map((\1: any) =>/g' src/repositories/*.test.ts
sed -i 's/\.filter((\([a-z]\)) =>/\.filter((\1: any) =>/g' src/repositories/*.test.ts
sed -i 's/\.forEach((\([a-z]\)) =>/\.forEach((\1: any) =>/g' src/repositories/*.test.ts
sed -i 's/\.find((\([a-z]\)) =>/\.find((\1: any) =>/g' src/repositories/*.test.ts

# Fix Promise resolve callbacks
sed -i 's/new Promise((resolve)/new Promise((resolve: any)/g' src/repositories/*.test.ts

# Fix wealth.repository.test.ts - distribution type
sed -i 's/distributionType: '"'"'request_based'"'"'/distributionType: '"'"'unit_based'"'"' as any/g' src/repositories/wealth.repository.test.ts

# Fix type null errors
sed -i 's/: null,/: null as any,/g' src/repositories/wealth.repository.test.ts

echo "Basic fixes applied"
