#!/usr/bin/env python3
import re
import sys

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    original = content
    
    # Fix array type assignments
    content = re.sub(r'mockResolvedValue\(\[\s*{([^}]+)}\s*\]\);', r'mockResolvedValue([{\1}] as any);', content)
    
    # Fix role string literal type errors (reader/admin/member as any)
    content = re.sub(r'([,\(])\s*(["\'])reader\2([,\)])', r'\1 \2reader\2 as any\3', content)
    
    # Fix implicit any in callbacks
    content = re.sub(r'\.map\(([a-z])\s*=>', r'.map((\1: any) =>', content)
    content = re.sub(r'\.filter\(([a-z])\s*=>', r'.filter((\1: any) =>', content)
    content = re.sub(r'\.forEach\(([a-z])\s*=>', r'.forEach((\1: any) =>', content)
    content = re.sub(r'\.find\(([a-z])\s*=>', r'.find((\1: any) =>', content)
    
    # Fix Promise resolve
    content = re.sub(r'new Promise\(\(resolve\)', r'new Promise((resolve: any)', content)
    
    # Remove unused variable declarations by prefixing with underscore
    content = re.sub(r'const (_[a-zA-Z0-9_]+) =', r'// @ts-ignore\nconst \1 =', content)
    
    if content != original:
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Fixed {filename}")
        return True
    return False

if __name__ == '__main__':
    import glob
    
    files = glob.glob('src/repositories/*.test.ts') + \
            glob.glob('src/services/trust.service.test.ts') + \
            glob.glob('src/services/wealth*.test.ts')
    
    for f in files:
        fix_file(f)
